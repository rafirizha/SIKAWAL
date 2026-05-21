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
  creator_user public.users%rowtype;
  resolved_source_type text;
begin
  select *
  into creator_user
  from public.users
  where id = input_creator_user_id
    and is_active = true;

  if not found then
    raise exception 'User aktif tidak ditemukan';
  end if;

  if creator_user.role not in ('Pegawai', 'Kasubbag Umum', 'Admin') then
    raise exception 'Role user tidak memiliki akses membuat draft';
  end if;

  if creator_user.role <> 'Admin' and (
    creator_user.team_id is null or
    creator_user.team_id <> input_team_id
  ) then
    raise exception 'User tidak memiliki akses membuat draft untuk tim ini';
  end if;

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
  values (
    'letter',
    input_letter_id,
    'CREATE_DRAFT',
    input_creator_user_id,
    creator_user.role,
    'Draft',
    jsonb_build_object(
      'version_id', created_version_id,
      'has_file', input_storage_path is not null,
      'has_google_doc', input_google_doc_url is not null
    )
  );

  return query select input_letter_id, created_version_id;
end;
$$;

revoke execute on function public.create_draft_letter(
  uuid,
  text,
  text,
  date,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  bigint,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.create_draft_letter(
  uuid,
  text,
  text,
  date,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  bigint,
  text,
  text
) to service_role;
