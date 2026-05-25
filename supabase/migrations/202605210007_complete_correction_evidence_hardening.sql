drop function if exists public.complete_general_subdivision_correction(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  bigint,
  text,
  text,
  text,
  jsonb,
  timestamptz
);

create or replace function public.complete_general_subdivision_correction(
  input_letter_id uuid,
  input_actor_user_id uuid,
  input_decision text,
  input_storage_path text default null,
  input_file_url text default null,
  input_file_mime_type text default null,
  input_file_size_bytes bigint default null,
  input_checksum_sha256 text default null,
  input_notes text default null,
  input_source_type text default 'manual_snapshot_upload',
  input_comments_json jsonb default null,
  input_exported_at timestamptz default null,
  input_snapshot_job_id uuid default null
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
  corrected_version_id uuid;
  next_revision_round integer;
  next_version_number integer;
  next_status text;
  next_current_reviewer_role text;
  next_revision_target_role text;
  approval_action text;
  normalized_storage_path text;
  normalized_file_mime_type text;
  normalized_checksum_sha256 text;
  normalized_notes text;
  normalized_source_type text;
  resolved_exported_at timestamptz;
  comments_json_has_evidence boolean := false;
begin
  normalized_storage_path := nullif(trim(coalesce(input_storage_path, '')), '');
  normalized_file_mime_type := nullif(trim(coalesce(input_file_mime_type, '')), '');
  normalized_checksum_sha256 := nullif(trim(coalesce(input_checksum_sha256, '')), '');
  normalized_notes := nullif(trim(coalesce(input_notes, '')), '');
  normalized_source_type := coalesce(
    nullif(trim(coalesce(input_source_type, '')), ''),
    'manual_snapshot_upload'
  );
  resolved_exported_at := coalesce(input_exported_at, now());

  if input_comments_json is not null then
    if jsonb_typeof(input_comments_json) = 'array' then
      comments_json_has_evidence := jsonb_array_length(input_comments_json) > 0;
    elsif jsonb_typeof(input_comments_json) = 'object' then
      select exists (
        select 1
        from jsonb_each(input_comments_json) as entry(key, value)
        where (
          jsonb_typeof(value) = 'array' and jsonb_array_length(value) > 0
        ) or (
          jsonb_typeof(value) = 'object' and value <> '{}'::jsonb
        ) or (
          jsonb_typeof(value) = 'string' and length(trim(value #>> '{}')) > 0
        ) or jsonb_typeof(value) in ('number', 'boolean')
      )
      into comments_json_has_evidence;
    elsif jsonb_typeof(input_comments_json) = 'string' then
      comments_json_has_evidence := length(trim(input_comments_json #>> '{}')) > 0;
    elsif jsonb_typeof(input_comments_json) in ('number', 'boolean') then
      comments_json_has_evidence := true;
    end if;
  end if;

  if input_decision not in ('request_revision', 'forward_to_head') then
    raise exception 'Hasil koreksi tidak valid';
  end if;

  if normalized_source_type not in ('manual_snapshot_upload', 'apps_script_export') then
    raise exception 'Sumber snapshot koreksi tidak valid';
  end if;

  if normalized_storage_path is null and not comments_json_has_evidence then
    raise exception 'Snapshot koreksi atau comments_json wajib tersedia';
  end if;

  if normalized_source_type = 'manual_snapshot_upload' and normalized_storage_path is null then
    raise exception 'Snapshot koreksi wajib diupload';
  end if;

  if normalized_storage_path is not null then
    if normalized_storage_path not like concat('letters/', input_letter_id::text, '/snapshots/%') then
      raise exception 'Path snapshot koreksi tidak valid';
    end if;

    if input_file_size_bytes is null or input_file_size_bytes <= 0 then
      raise exception 'Ukuran snapshot koreksi tidak valid';
    end if;

    if normalized_checksum_sha256 is null then
      raise exception 'Checksum snapshot koreksi wajib tersedia';
    end if;

    if normalized_file_mime_type not in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) then
      raise exception 'Format snapshot koreksi harus DOCX atau PDF';
    end if;
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
    comments_json,
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
    normalized_source_type,
    normalized_storage_path,
    input_file_url,
    normalized_file_mime_type,
    input_file_size_bytes,
    normalized_checksum_sha256,
    draft_letter.google_doc_id,
    draft_letter.google_doc_url,
    case when comments_json_has_evidence then input_comments_json else null end,
    input_actor_user_id,
    input_actor_user_id,
    'Kasubbag Umum',
    normalized_notes,
    resolved_exported_at
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
    normalized_notes,
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
      'source_type', normalized_source_type,
      'snapshot_job_id', input_snapshot_job_id,
      'snapshot_storage_path', normalized_storage_path,
      'has_file_snapshot', normalized_storage_path is not null,
      'has_comments_json', comments_json_has_evidence,
      'checksum_sha256', normalized_checksum_sha256,
      'file_mime_type', normalized_file_mime_type,
      'file_size_bytes', input_file_size_bytes,
      'exported_at', resolved_exported_at
    )
  );

  if input_snapshot_job_id is not null then
    update public.correction_snapshot_jobs
    set
      status = 'SUCCESS',
      error_message = null,
      result_version_id = corrected_version_id,
      completed_at = now()
    where id = input_snapshot_job_id
      and letter_id = input_letter_id
      and requested_by_user_id = input_actor_user_id
      and reviewer_role = 'Kasubbag Umum';

    if not found then
      raise exception 'Job snapshot koreksi tidak valid';
    end if;
  end if;

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
  text,
  text,
  jsonb,
  timestamptz,
  uuid
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
  text,
  text,
  jsonb,
  timestamptz,
  uuid
) to service_role;
