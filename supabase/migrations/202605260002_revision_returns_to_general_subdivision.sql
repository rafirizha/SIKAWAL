create or replace function public.submit_letter_revision(
  input_letter_id uuid,
  input_actor_user_id uuid,
  input_google_doc_id text default null,
  input_google_doc_url text default null,
  input_storage_path text default null,
  input_file_url text default null,
  input_file_mime_type text default null,
  input_file_size_bytes bigint default null,
  input_checksum_sha256 text default null,
  input_source_type text default null,
  input_change_summary text default null
)
returns table (
  letter_id uuid,
  version_id uuid
)
language plpgsql
set search_path = public
as $$
declare
  draft_letter public.letters%rowtype;
  actor_user public.users%rowtype;
  latest_version_id uuid;
  revision_version_id uuid;
  next_version_number integer;
  next_status text := 'Menunggu Koreksi Kasubbag Umum';
  next_current_reviewer_role text := 'Kasubbag Umum';
  normalized_change_summary text;
  normalized_storage_path text;
  normalized_file_mime_type text;
  normalized_checksum_sha256 text;
  normalized_source_type text;
  resolved_google_doc_id text;
  resolved_google_doc_url text;
begin
  normalized_change_summary := nullif(trim(coalesce(input_change_summary, '')), '');
  normalized_storage_path := nullif(trim(coalesce(input_storage_path, '')), '');
  normalized_file_mime_type := nullif(trim(coalesce(input_file_mime_type, '')), '');
  normalized_checksum_sha256 := nullif(trim(coalesce(input_checksum_sha256, '')), '');
  normalized_source_type := nullif(trim(coalesce(input_source_type, '')), '');
  resolved_google_doc_id := nullif(trim(coalesce(input_google_doc_id, '')), '');
  resolved_google_doc_url := nullif(trim(coalesce(input_google_doc_url, '')), '');

  if normalized_change_summary is null then
    raise exception 'Ringkasan perubahan wajib diisi';
  end if;

  select *
  into draft_letter
  from public.letters
  where id = input_letter_id
  for update;

  if not found then
    raise exception 'Draft tidak ditemukan';
  end if;

  select *
  into actor_user
  from public.users
  where id = input_actor_user_id
    and is_active = true;

  if not found then
    raise exception 'User aktif tidak ditemukan';
  end if;

  if draft_letter.status <> 'Perlu Revisi Pegawai' then
    raise exception 'Hanya draft yang membutuhkan revisi yang dapat dikirim ulang';
  end if;

  if actor_user.role <> 'Admin' and (
    draft_letter.creator_user_id <> input_actor_user_id or
    actor_user.role not in ('Pegawai', 'Kasubbag Umum')
  ) then
    raise exception 'User tidak memiliki akses mengirim revisi ini';
  end if;

  if draft_letter.revision_target_role not in ('Kasubbag Umum', 'Kepala BPS') then
    raise exception 'Target reviewer revisi tidak valid';
  end if;

  if draft_letter.revision_round <= 0 then
    raise exception 'Putaran revisi tidak valid';
  end if;

  resolved_google_doc_id := coalesce(resolved_google_doc_id, draft_letter.google_doc_id);
  resolved_google_doc_url := coalesce(resolved_google_doc_url, draft_letter.google_doc_url);

  if normalized_source_type is null then
    normalized_source_type := case
      when normalized_storage_path is not null then null
      when resolved_google_doc_url is not null then 'google_docs'
      else null
    end;
  end if;

  if normalized_source_type is null or normalized_source_type not in ('google_docs', 'upload_docx', 'upload_pdf') then
    raise exception 'Sumber hasil revisi tidak valid';
  end if;

  if normalized_storage_path is null and resolved_google_doc_url is null then
    raise exception 'Hasil revisi wajib memiliki Google Docs atau file revisi';
  end if;

  if normalized_storage_path is not null then
    if normalized_storage_path not like concat('letters/', input_letter_id::text, '/versions/%') then
      raise exception 'Path file revisi tidak valid';
    end if;

    if input_file_size_bytes is null or input_file_size_bytes <= 0 then
      raise exception 'Ukuran file revisi tidak valid';
    end if;

    if normalized_checksum_sha256 is null then
      raise exception 'Checksum file revisi wajib tersedia';
    end if;

    if normalized_file_mime_type not in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) then
      raise exception 'Format file revisi harus DOCX atau PDF';
    end if;

    if normalized_source_type not in ('upload_docx', 'upload_pdf') then
      raise exception 'Source type file revisi tidak sesuai';
    end if;
  end if;

  if normalized_storage_path is null and normalized_source_type <> 'google_docs' then
    raise exception 'Source type hasil revisi harus Google Docs jika tanpa file';
  end if;

  select id
  into latest_version_id
  from public.letter_versions
  where letter_versions.letter_id = input_letter_id
  order by version_number desc
  limit 1;

  if latest_version_id is null then
    raise exception 'Versi sebelumnya tidak ditemukan';
  end if;

  select coalesce(max(version_number), 0) + 1
  into next_version_number
  from public.letter_versions
  where letter_versions.letter_id = input_letter_id;

  insert into public.letter_versions (
    letter_id,
    parent_version_id,
    version_number,
    revision_round,
    version_type,
    title,
    source_type,
    storage_path,
    file_url,
    file_mime_type,
    file_size_bytes,
    checksum_sha256,
    google_doc_id,
    google_doc_url,
    created_by_user_id,
    notes,
    change_summary
  )
  values (
    input_letter_id,
    latest_version_id,
    next_version_number,
    draft_letter.revision_round,
    'Hasil Revisi',
    concat('Hasil Revisi ', draft_letter.revision_round),
    normalized_source_type,
    normalized_storage_path,
    input_file_url,
    normalized_file_mime_type,
    input_file_size_bytes,
    normalized_checksum_sha256,
    resolved_google_doc_id,
    resolved_google_doc_url,
    input_actor_user_id,
    normalized_change_summary,
    normalized_change_summary
  )
  returning id into revision_version_id;

  update public.letters
  set
    status = next_status,
    current_reviewer_role = next_current_reviewer_role,
    revision_target_role = null,
    google_doc_id = resolved_google_doc_id,
    google_doc_url = resolved_google_doc_url,
    updated_at = now()
  where id = input_letter_id;

  insert into public.approvals (
    letter_id,
    actor_user_id,
    actor_role,
    action,
    from_status,
    to_status,
    notes,
    version_id
  )
  values (
    input_letter_id,
    input_actor_user_id,
    actor_user.role,
    'SUBMIT_REVISION',
    'Perlu Revisi Pegawai',
    next_status,
    normalized_change_summary,
    revision_version_id
  );

  insert into public.audit_logs (
    entity_type,
    entity_id,
    action,
    actor_user_id,
    actor_role,
    from_status,
    to_status,
    metadata
  )
  values (
    'letter',
    input_letter_id,
    'SUBMIT_REVISION',
    input_actor_user_id,
    actor_user.role,
    'Perlu Revisi Pegawai',
    next_status,
    jsonb_build_object(
      'version_id', revision_version_id,
      'parent_version_id', latest_version_id,
      'revision_round', draft_letter.revision_round,
      'original_revision_target_role', draft_letter.revision_target_role,
      'routed_reviewer_role', next_current_reviewer_role,
      'source_type', normalized_source_type,
      'storage_path', normalized_storage_path,
      'google_doc_id', resolved_google_doc_id,
      'has_file_revision', normalized_storage_path is not null,
      'checksum_sha256', normalized_checksum_sha256,
      'file_mime_type', normalized_file_mime_type,
      'file_size_bytes', input_file_size_bytes
    )
  );

  return query select input_letter_id, revision_version_id;
end;
$$;

revoke execute on function public.submit_letter_revision(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  bigint,
  text,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.submit_letter_revision(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  bigint,
  text,
  text,
  text
) to service_role;
