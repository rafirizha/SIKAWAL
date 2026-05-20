do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'storage'
      and table_name = 'buckets'
  ) then
    insert into storage.buckets (id, name, public)
    values ('letter-documents', 'letter-documents', false)
    on conflict (id) do nothing;
  end if;
end;
$$;

create or replace function public.create_draft_letter(
  input_letter_id uuid,
  input_subject text,
  input_recipient text,
  input_letter_date date,
  input_creator_user_id uuid,
  input_team_id uuid,
  input_google_doc_id text default null,
  input_google_doc_url text default null,
  input_data_classification text default 'dummy',
  input_storage_path text default null,
  input_file_url text default null,
  input_file_mime_type text default null,
  input_file_size_bytes bigint default null,
  input_checksum_sha256 text default null,
  input_source_type text default null
)
returns table (
  letter_id uuid,
  version_id uuid
)
language plpgsql
as $$
declare
  created_version_id uuid;
  resolved_source_type text;
begin
  if input_storage_path is not null and input_source_type is null then
    raise exception 'input_source_type is required when input_storage_path is provided';
  end if;

  resolved_source_type := input_source_type;

  if resolved_source_type is null and input_google_doc_url is not null then
    resolved_source_type := 'google_docs';
  end if;

  insert into public.letters (
    id,
    subject,
    recipient,
    letter_date,
    creator_user_id,
    team_id,
    status,
    revision_round,
    google_doc_id,
    google_doc_url,
    data_classification
  )
  values (
    input_letter_id,
    input_subject,
    input_recipient,
    input_letter_date,
    input_creator_user_id,
    input_team_id,
    'Draft',
    0,
    input_google_doc_id,
    input_google_doc_url,
    input_data_classification
  );

  if input_storage_path is not null or input_google_doc_url is not null then
    insert into public.letter_versions (
      letter_id,
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
      created_by_user_id
    )
    values (
      input_letter_id,
      1,
      0,
      'Draft Pengajuan',
      'Draft Pengajuan 1',
      resolved_source_type,
      input_storage_path,
      input_file_url,
      input_file_mime_type,
      input_file_size_bytes,
      input_checksum_sha256,
      input_google_doc_id,
      input_google_doc_url,
      input_creator_user_id
    )
    returning id into created_version_id;
  end if;

  insert into public.audit_logs (
    entity_type,
    entity_id,
    action,
    actor_user_id,
    actor_role,
    to_status,
    metadata
  )
  select
    'letter',
    input_letter_id,
    'CREATE_DRAFT',
    input_creator_user_id,
    users.role,
    'Draft',
    jsonb_build_object(
      'version_id', created_version_id,
      'has_file', input_storage_path is not null,
      'has_google_doc', input_google_doc_url is not null
    )
  from public.users
  where users.id = input_creator_user_id;

  return query select input_letter_id, created_version_id;
end;
$$;

create or replace function public.submit_draft_to_team_lead(
  input_letter_id uuid,
  input_actor_user_id uuid
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
  draft_version_id uuid;
  next_version_number integer;
begin
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

  if draft_letter.status <> 'Draft' then
    raise exception 'Hanya draft yang dapat diajukan ke Ketua Tim';
  end if;

  if actor_user.role <> 'Admin' and (
    draft_letter.creator_user_id <> input_actor_user_id or
    actor_user.role not in ('Pegawai', 'Ketua Tim')
  ) then
    raise exception 'User tidak memiliki akses untuk mengajukan draft ini';
  end if;

  select id
  into draft_version_id
  from public.letter_versions
  where letter_versions.letter_id = input_letter_id
    and version_type = 'Draft Pengajuan'
  order by version_number
  limit 1;

  if draft_version_id is null then
    if draft_letter.google_doc_url is null then
      raise exception 'Draft harus memiliki link Google Docs atau dokumen awal sebelum diajukan';
    end if;

    select coalesce(max(version_number), 0) + 1
    into next_version_number
    from public.letter_versions
    where letter_versions.letter_id = input_letter_id;

    insert into public.letter_versions (
      letter_id,
      version_number,
      revision_round,
      version_type,
      title,
      source_type,
      google_doc_id,
      google_doc_url,
      created_by_user_id
    )
    values (
      input_letter_id,
      next_version_number,
      0,
      'Draft Pengajuan',
      'Draft Pengajuan 1',
      'google_docs',
      draft_letter.google_doc_id,
      draft_letter.google_doc_url,
      input_actor_user_id
    )
    returning id into draft_version_id;
  end if;

  update public.letters
  set
    status = 'Menunggu Koreksi Ketua Tim',
    current_reviewer_role = 'Ketua Tim',
    revision_target_role = null,
    updated_at = now()
  where id = input_letter_id;

  insert into public.approvals (
    letter_id,
    actor_user_id,
    actor_role,
    action,
    from_status,
    to_status,
    version_id
  )
  values (
    input_letter_id,
    input_actor_user_id,
    actor_user.role,
    'SUBMIT_DRAFT',
    'Draft',
    'Menunggu Koreksi Ketua Tim',
    draft_version_id
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
    'SUBMIT_DRAFT',
    input_actor_user_id,
    actor_user.role,
    'Draft',
    'Menunggu Koreksi Ketua Tim',
    jsonb_build_object('version_id', draft_version_id)
  );

  return query select input_letter_id, draft_version_id;
end;
$$;
