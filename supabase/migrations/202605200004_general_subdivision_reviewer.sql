alter table if exists public.users
  drop constraint if exists users_role_check;

alter table if exists public.letters
  drop constraint if exists letters_status_check,
  drop constraint if exists letters_current_reviewer_role_check,
  drop constraint if exists letters_revision_target_role_check;

alter table if exists public.letter_versions
  drop constraint if exists letter_versions_reviewer_role_check;

alter table if exists public.correction_snapshot_jobs
  drop constraint if exists correction_snapshot_jobs_reviewer_role_check;

alter table if exists public.approvals
  drop constraint if exists approvals_actor_role_check;

alter table if exists public.audit_logs
  drop constraint if exists audit_logs_actor_role_check;

update public.users
set
  role = 'Kasubbag Umum',
  name = replace(name, 'Ketua Tim', 'Kasubbag Umum'),
  email = case
    when email = 'ketua-tim@example.test'
      and not exists (
        select 1
        from public.users existing_user
        where existing_user.email = 'kasubbag-umum@example.test'
      )
    then 'kasubbag-umum@example.test'
    else email
  end,
  updated_at = now()
where role = 'Ketua Tim';

update public.letters
set
  status = case
    when status = 'Menunggu Koreksi Ketua Tim' then 'Menunggu Koreksi Kasubbag Umum'
    else status
  end,
  current_reviewer_role = case
    when current_reviewer_role = 'Ketua Tim' then 'Kasubbag Umum'
    else current_reviewer_role
  end,
  revision_target_role = case
    when revision_target_role = 'Ketua Tim' then 'Kasubbag Umum'
    else revision_target_role
  end,
  updated_at = now()
where status = 'Menunggu Koreksi Ketua Tim'
  or current_reviewer_role = 'Ketua Tim'
  or revision_target_role = 'Ketua Tim';

update public.letter_versions
set
  reviewer_role = case
    when reviewer_role = 'Ketua Tim' then 'Kasubbag Umum'
    else reviewer_role
  end,
  title = replace(title, 'Ketua Tim', 'Kasubbag Umum'),
  notes = replace(notes, 'Ketua Tim', 'Kasubbag Umum'),
  change_summary = replace(change_summary, 'Ketua Tim', 'Kasubbag Umum')
where reviewer_role = 'Ketua Tim'
  or title like '%Ketua Tim%'
  or notes like '%Ketua Tim%'
  or change_summary like '%Ketua Tim%';

update public.correction_snapshot_jobs
set reviewer_role = 'Kasubbag Umum'
where reviewer_role = 'Ketua Tim';

update public.approvals
set
  actor_role = case
    when actor_role = 'Ketua Tim' then 'Kasubbag Umum'
    else actor_role
  end,
  from_status = case
    when from_status = 'Menunggu Koreksi Ketua Tim' then 'Menunggu Koreksi Kasubbag Umum'
    else from_status
  end,
  to_status = case
    when to_status = 'Menunggu Koreksi Ketua Tim' then 'Menunggu Koreksi Kasubbag Umum'
    else to_status
  end,
  notes = replace(notes, 'Ketua Tim', 'Kasubbag Umum')
where actor_role = 'Ketua Tim'
  or from_status = 'Menunggu Koreksi Ketua Tim'
  or to_status = 'Menunggu Koreksi Ketua Tim'
  or notes like '%Ketua Tim%';

update public.audit_logs
set
  actor_role = case
    when actor_role = 'Ketua Tim' then 'Kasubbag Umum'
    else actor_role
  end,
  from_status = case
    when from_status = 'Menunggu Koreksi Ketua Tim' then 'Menunggu Koreksi Kasubbag Umum'
    else from_status
  end,
  to_status = case
    when to_status = 'Menunggu Koreksi Ketua Tim' then 'Menunggu Koreksi Kasubbag Umum'
    else to_status
  end
where actor_role = 'Ketua Tim'
  or from_status = 'Menunggu Koreksi Ketua Tim'
  or to_status = 'Menunggu Koreksi Ketua Tim';

alter table public.users
  add constraint users_role_check check (
    role in ('Pegawai', 'Kasubbag Umum', 'Kepala BPS', 'Admin')
  );

alter table public.letters
  add constraint letters_status_check check (
    status in (
      'Draft',
      'Menunggu Koreksi Kasubbag Umum',
      'Perlu Revisi Pegawai',
      'Menunggu Koreksi Kepala BPS',
      'Disetujui Internal',
      'Final',
      'Dibatalkan'
    )
  ),
  add constraint letters_current_reviewer_role_check check (
    current_reviewer_role is null or
    current_reviewer_role in ('Kasubbag Umum', 'Kepala BPS')
  ),
  add constraint letters_revision_target_role_check check (
    revision_target_role is null or
    revision_target_role in ('Kasubbag Umum', 'Kepala BPS')
  );

alter table public.letter_versions
  add constraint letter_versions_reviewer_role_check check (
    reviewer_role is null or reviewer_role in ('Kasubbag Umum', 'Kepala BPS')
  );

alter table public.correction_snapshot_jobs
  add constraint correction_snapshot_jobs_reviewer_role_check check (
    reviewer_role in ('Kasubbag Umum', 'Kepala BPS')
  );

alter table public.approvals
  add constraint approvals_actor_role_check check (
    actor_role in ('Pegawai', 'Kasubbag Umum', 'Kepala BPS', 'Admin')
  );

alter table public.audit_logs
  add constraint audit_logs_actor_role_check check (
    actor_role is null or actor_role in ('Pegawai', 'Kasubbag Umum', 'Kepala BPS', 'Admin')
  );

create or replace function public.submit_draft_to_general_subdivision(
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
    raise exception 'Hanya draft yang dapat diajukan ke Kasubbag Umum';
  end if;

  if actor_user.role <> 'Admin' and (
    draft_letter.creator_user_id <> input_actor_user_id or
    actor_user.role not in ('Pegawai', 'Kasubbag Umum')
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
    status = 'Menunggu Koreksi Kasubbag Umum',
    current_reviewer_role = 'Kasubbag Umum',
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
    'Menunggu Koreksi Kasubbag Umum',
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
    'Menunggu Koreksi Kasubbag Umum',
    jsonb_build_object('version_id', draft_version_id)
  );

  return query select input_letter_id, draft_version_id;
end;
$$;

drop function if exists public.submit_draft_to_team_lead(uuid, uuid);
