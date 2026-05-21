create or replace function public.create_and_submit_draft_letter(
  input_letter_id uuid,
  input_subject text,
  input_recipient text,
  input_letter_date date,
  input_creator_user_id uuid,
  input_team_id uuid,
  input_actor_user_id uuid,
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
  created_letter_id uuid;
  created_version_id uuid;
begin
  select result.letter_id, result.version_id
  into created_letter_id, created_version_id
  from public.create_draft_letter(
    input_letter_id,
    input_subject,
    input_recipient,
    input_letter_date,
    input_creator_user_id,
    input_team_id,
    input_google_doc_id,
    input_google_doc_url,
    input_data_classification,
    input_storage_path,
    input_file_url,
    input_file_mime_type,
    input_file_size_bytes,
    input_checksum_sha256,
    input_source_type
  ) as result;

  select result.letter_id, result.version_id
  into created_letter_id, created_version_id
  from public.submit_draft_to_general_subdivision(
    input_letter_id,
    input_actor_user_id
  ) as result;

  return query select created_letter_id, created_version_id;
end;
$$;

create or replace function public.prevent_letter_versions_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'letter_versions are immutable and cannot be updated or deleted';
end;
$$;

drop trigger if exists trg_letter_versions_prevent_update on public.letter_versions;
drop trigger if exists trg_letter_versions_prevent_delete on public.letter_versions;

create trigger trg_letter_versions_prevent_update
before update on public.letter_versions
for each row
execute function public.prevent_letter_versions_mutation();

create trigger trg_letter_versions_prevent_delete
before delete on public.letter_versions
for each row
execute function public.prevent_letter_versions_mutation();

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

grant execute on function public.submit_draft_to_general_subdivision(
  uuid,
  uuid
) to service_role;

grant execute on function public.create_and_submit_draft_letter(
  uuid,
  text,
  text,
  date,
  uuid,
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
