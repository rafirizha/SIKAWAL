create or replace function public.complete_general_subdivision_correction(
  input_letter_id uuid,
  input_actor_user_id uuid,
  input_decision text,
  input_storage_path text,
  input_file_url text default null,
  input_file_mime_type text default null,
  input_file_size_bytes bigint default null,
  input_checksum_sha256 text default null,
  input_notes text default null
)
returns table (
  letter_id uuid,
  version_id uuid
)
language plpgsql
as $$
declare
  draft_letter public.letters%rowtype;
  actor_user public.users%rowtype;
  latest_version_id uuid;
  corrected_version_id uuid;
  next_revision_round integer;
  next_version_number integer;
  next_status text;
  next_current_reviewer_role text;
  next_revision_target_role text;
  approval_action text;
begin
  if input_decision not in ('request_revision', 'forward_to_head') then
    raise exception 'Hasil koreksi tidak valid';
  end if;

  if nullif(trim(coalesce(input_storage_path, '')), '') is null then
    raise exception 'Snapshot koreksi wajib diupload';
  end if;

  if input_storage_path not like concat('letters/', input_letter_id::text, '/snapshots/%') then
    raise exception 'Path snapshot koreksi tidak valid';
  end if;

  if input_file_size_bytes is null or input_file_size_bytes <= 0 then
    raise exception 'Ukuran snapshot koreksi tidak valid';
  end if;

  if nullif(trim(coalesce(input_checksum_sha256, '')), '') is null then
    raise exception 'Checksum snapshot koreksi wajib tersedia';
  end if;

  if input_file_mime_type not in (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) then
    raise exception 'Format snapshot koreksi harus DOCX atau PDF';
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

  if draft_letter.status <> 'Menunggu Koreksi Kasubbag Umum' then
    raise exception 'Hanya draft yang menunggu koreksi Kasubbag Umum yang dapat diselesaikan';
  end if;

  if actor_user.role <> 'Admin' and (
    actor_user.role <> 'Kasubbag Umum' or
    actor_user.team_id is null or
    actor_user.team_id <> draft_letter.team_id
  ) then
    raise exception 'User tidak memiliki akses menyelesaikan koreksi ini';
  end if;

  select id
  into latest_version_id
  from public.letter_versions
  where letter_versions.letter_id = input_letter_id
  order by version_number desc
  limit 1;

  if latest_version_id is null then
    raise exception 'Versi pengajuan awal tidak ditemukan';
  end if;

  select coalesce(max(version_number), 0) + 1
  into next_version_number
  from public.letter_versions
  where letter_versions.letter_id = input_letter_id;

  next_revision_round := draft_letter.revision_round + 1;

  if input_decision = 'request_revision' then
    next_status := 'Perlu Revisi Pegawai';
    next_current_reviewer_role := null;
    next_revision_target_role := 'Kasubbag Umum';
    approval_action := 'REQUEST_REVISION';
  else
    next_status := 'Menunggu Koreksi Kepala BPS';
    next_current_reviewer_role := 'Kepala BPS';
    next_revision_target_role := null;
    approval_action := 'FORWARD_TO_HEAD';
  end if;

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
    reviewer_user_id,
    reviewer_role,
    notes,
    exported_at
  )
  values (
    input_letter_id,
    latest_version_id,
    next_version_number,
    next_revision_round,
    'Draft Dikoreksi',
    concat('Draft Dikoreksi ', next_revision_round, ' oleh Kasubbag Umum'),
    'manual_snapshot_upload',
    input_storage_path,
    input_file_url,
    input_file_mime_type,
    input_file_size_bytes,
    input_checksum_sha256,
    draft_letter.google_doc_id,
    draft_letter.google_doc_url,
    input_actor_user_id,
    input_actor_user_id,
    'Kasubbag Umum',
    nullif(trim(coalesce(input_notes, '')), ''),
    now()
  )
  returning id into corrected_version_id;

  update public.letters
  set
    status = next_status,
    current_reviewer_role = next_current_reviewer_role,
    revision_target_role = next_revision_target_role,
    revision_round = next_revision_round,
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
    approval_action,
    'Menunggu Koreksi Kasubbag Umum',
    next_status,
    nullif(trim(coalesce(input_notes, '')), ''),
    corrected_version_id
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
    'COMPLETE_CORRECTION',
    input_actor_user_id,
    actor_user.role,
    'Menunggu Koreksi Kasubbag Umum',
    next_status,
    jsonb_build_object(
      'stage', 'general_subdivision',
      'decision', input_decision,
      'approval_action', approval_action,
      'version_id', corrected_version_id,
      'parent_version_id', latest_version_id,
      'revision_round', next_revision_round,
      'snapshot_storage_path', input_storage_path,
      'checksum_sha256', input_checksum_sha256,
      'file_mime_type', input_file_mime_type,
      'file_size_bytes', input_file_size_bytes
    )
  );

  return query select input_letter_id, corrected_version_id;
end;
$$;

revoke execute on function public.complete_general_subdivision_correction(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  bigint,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.complete_general_subdivision_correction(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  bigint,
  text,
  text
) to service_role;
