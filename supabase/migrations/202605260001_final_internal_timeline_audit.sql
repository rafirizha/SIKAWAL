drop function if exists public.create_final_letter(
  uuid,
  uuid,
  text,
  text,
  text,
  bigint,
  text,
  text,
  text,
  text,
  text
);

create or replace function public.create_final_letter(
  input_letter_id uuid,
  input_actor_user_id uuid,
  input_storage_path text default null,
  input_file_url text default null,
  input_file_mime_type text default null,
  input_file_size_bytes bigint default null,
  input_checksum_sha256 text default null,
  input_google_doc_id text default null,
  input_google_doc_url text default null,
  input_source_type text default null,
  input_final_summary text default null
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
  created_final_version_id uuid;
  next_version_number integer;
  normalized_storage_path text;
  normalized_file_mime_type text;
  normalized_checksum_sha256 text;
  normalized_google_doc_id text;
  normalized_google_doc_url text;
  normalized_source_type text;
  normalized_final_summary text;
begin
  normalized_storage_path := nullif(trim(coalesce(input_storage_path, '')), '');
  normalized_file_mime_type := nullif(trim(coalesce(input_file_mime_type, '')), '');
  normalized_checksum_sha256 := nullif(trim(coalesce(input_checksum_sha256, '')), '');
  normalized_google_doc_id := nullif(trim(coalesce(input_google_doc_id, '')), '');
  normalized_google_doc_url := nullif(trim(coalesce(input_google_doc_url, '')), '');
  normalized_source_type := nullif(trim(coalesce(input_source_type, '')), '');
  normalized_final_summary := nullif(trim(coalesce(input_final_summary, '')), '');

  if normalized_final_summary is null then
    raise exception 'Catatan final internal wajib diisi';
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

  if draft_letter.status <> 'Disetujui Internal' then
    raise exception 'Naskah final hanya dapat dibuat dari status Disetujui Internal';
  end if;

  if actor_user.role <> 'Admin'
    and actor_user.role <> 'Kepala BPS'
    and actor_user.id <> draft_letter.creator_user_id
  then
    raise exception 'User tidak memiliki akses membuat naskah final';
  end if;

  if actor_user.id = draft_letter.creator_user_id
    and actor_user.role not in ('Pegawai', 'Kasubbag Umum', 'Admin')
  then
    raise exception 'Role penyusun tidak memiliki akses membuat naskah final';
  end if;

  if normalized_storage_path is null and normalized_google_doc_url is null then
    raise exception 'Naskah final wajib memiliki file final atau link Google Docs final';
  end if;

  if normalized_source_type is null then
    normalized_source_type := case
      when normalized_storage_path is not null then null
      when normalized_google_doc_url is not null then 'google_docs'
      else null
    end;
  end if;

  if normalized_source_type is null
    or normalized_source_type not in ('upload_docx', 'upload_pdf', 'google_docs')
  then
    raise exception 'Source type naskah final tidak valid';
  end if;

  if normalized_storage_path is not null then
    if normalized_storage_path not like concat('letters/', input_letter_id::text, '/versions/%') then
      raise exception 'Path naskah final tidak valid';
    end if;

    if normalized_file_mime_type is null
      or normalized_file_mime_type not in (
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    then
      raise exception 'MIME type naskah final tidak valid';
    end if;

    if input_file_size_bytes is null or input_file_size_bytes <= 0 then
      raise exception 'Ukuran file naskah final tidak valid';
    end if;

    if normalized_checksum_sha256 is null then
      raise exception 'Checksum naskah final wajib tersedia';
    end if;

    if normalized_source_type not in ('upload_docx', 'upload_pdf') then
      raise exception 'Source type file final harus upload_docx atau upload_pdf';
    end if;
  end if;

  if normalized_storage_path is null and normalized_source_type <> 'google_docs' then
    raise exception 'Source type link final harus google_docs';
  end if;

  select id, version_number
  into latest_version_id, next_version_number
  from public.letter_versions
  where letter_versions.letter_id = input_letter_id
  order by version_number desc
  limit 1;

  if latest_version_id is null then
    raise exception 'Versi sebelumnya tidak ditemukan';
  end if;

  next_version_number := next_version_number + 1;

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
    notes
  )
  values (
    input_letter_id,
    latest_version_id,
    next_version_number,
    draft_letter.revision_round,
    'Naskah Final',
    'Naskah Final',
    normalized_source_type,
    normalized_storage_path,
    input_file_url,
    normalized_file_mime_type,
    input_file_size_bytes,
    normalized_checksum_sha256,
    normalized_google_doc_id,
    normalized_google_doc_url,
    input_actor_user_id,
    normalized_final_summary
  )
  returning id into created_final_version_id;

  update public.letters
  set
    status = 'Final',
    current_reviewer_role = null,
    revision_target_role = null,
    google_doc_id = coalesce(normalized_google_doc_id, google_doc_id),
    google_doc_url = coalesce(normalized_google_doc_url, google_doc_url),
    final_version_id = created_final_version_id,
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
    'CREATE_FINAL',
    'Disetujui Internal',
    'Final',
    normalized_final_summary,
    created_final_version_id
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
    'CREATE_FINAL',
    input_actor_user_id,
    actor_user.role,
    'Disetujui Internal',
    'Final',
    jsonb_build_object(
      'version_id', created_final_version_id,
      'parent_version_id', latest_version_id,
      'revision_round', draft_letter.revision_round,
      'source_type', normalized_source_type,
      'has_file_final', normalized_storage_path is not null,
      'has_google_doc_final', normalized_google_doc_url is not null
    )
  );

  return query select input_letter_id, created_final_version_id;
end;
$$;

drop function if exists public.cancel_letter(uuid, uuid, text);

create or replace function public.cancel_letter(
  input_letter_id uuid,
  input_actor_user_id uuid,
  input_cancel_reason text
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
  normalized_cancel_reason text;
  can_cancel boolean := false;
begin
  normalized_cancel_reason := nullif(trim(coalesce(input_cancel_reason, '')), '');

  if normalized_cancel_reason is null then
    raise exception 'Alasan pembatalan wajib diisi';
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

  if draft_letter.status in ('Final', 'Dibatalkan') then
    raise exception 'Dokumen final atau dibatalkan tidak dapat dibatalkan ulang';
  end if;

  if actor_user.role = 'Admin' then
    can_cancel := true;
  elsif actor_user.id = draft_letter.creator_user_id then
    can_cancel := true;
  elsif actor_user.role = 'Kasubbag Umum'
    and actor_user.team_id is not null
    and actor_user.team_id = draft_letter.team_id
    and draft_letter.status in (
      'Menunggu Koreksi Kasubbag Umum',
      'Perlu Revisi Pegawai'
    )
  then
    can_cancel := true;
  elsif actor_user.role = 'Kepala BPS'
    and draft_letter.status in (
      'Menunggu Koreksi Kepala BPS',
      'Disetujui Internal'
    )
  then
    can_cancel := true;
  end if;

  if not can_cancel then
    raise exception 'User tidak memiliki akses membatalkan dokumen';
  end if;

  select id
  into latest_version_id
  from public.letter_versions
  where letter_versions.letter_id = input_letter_id
  order by version_number desc
  limit 1;

  update public.letters
  set
    status = 'Dibatalkan',
    current_reviewer_role = null,
    revision_target_role = null,
    cancel_reason = normalized_cancel_reason,
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
    'CANCEL',
    draft_letter.status,
    'Dibatalkan',
    normalized_cancel_reason,
    latest_version_id
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
    'CANCEL',
    input_actor_user_id,
    actor_user.role,
    draft_letter.status,
    'Dibatalkan',
    jsonb_build_object(
      'version_id', latest_version_id,
      'cancel_reason', normalized_cancel_reason,
      'revision_round', draft_letter.revision_round
    )
  );

  return query select input_letter_id, latest_version_id;
end;
$$;

revoke execute on function public.create_final_letter(
  uuid,
  uuid,
  text,
  text,
  text,
  bigint,
  text,
  text,
  text,
  text,
  text
) from public, anon, authenticated;

revoke execute on function public.cancel_letter(
  uuid,
  uuid,
  text
) from public, anon, authenticated;

grant execute on function public.create_final_letter(
  uuid,
  uuid,
  text,
  text,
  text,
  bigint,
  text,
  text,
  text,
  text,
  text
) to service_role;

grant execute on function public.cancel_letter(
  uuid,
  uuid,
  text
) to service_role;
