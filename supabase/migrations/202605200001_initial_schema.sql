create extension if not exists pgcrypto;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  leader_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null,
  team_id uuid references public.teams(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_role_check check (
    role in ('Pegawai', 'Ketua Tim', 'Kepala BPS', 'Admin')
  )
);

alter table public.teams
  add constraint teams_leader_user_id_fkey
  foreign key (leader_user_id)
  references public.users(id)
  on delete set null;

create table public.letters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  recipient text not null,
  letter_date date not null,
  creator_user_id uuid not null references public.users(id) on delete restrict,
  team_id uuid not null references public.teams(id) on delete restrict,
  status text not null default 'Draft',
  current_reviewer_role text,
  revision_target_role text,
  revision_round integer not null default 0,
  google_doc_id text,
  google_doc_url text,
  final_version_id uuid,
  srikandi_reference_number text,
  srikandi_reference_url text,
  srikandi_processed_at timestamptz,
  data_classification text not null default 'dummy',
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint letters_status_check check (
    status in (
      'Draft',
      'Menunggu Koreksi Ketua Tim',
      'Perlu Revisi Pegawai',
      'Menunggu Koreksi Kepala BPS',
      'Disetujui Internal',
      'Final',
      'Dibatalkan'
    )
  ),
  constraint letters_current_reviewer_role_check check (
    current_reviewer_role is null or
    current_reviewer_role in ('Ketua Tim', 'Kepala BPS')
  ),
  constraint letters_revision_target_role_check check (
    revision_target_role is null or
    revision_target_role in ('Ketua Tim', 'Kepala BPS')
  ),
  constraint letters_revision_round_check check (revision_round >= 0),
  constraint letters_data_classification_check check (
    data_classification in ('dummy', 'anonymized', 'approved_real_data')
  )
);

create table public.letter_versions (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  parent_version_id uuid,
  version_number integer not null,
  revision_round integer not null default 0,
  version_type text not null,
  title text not null,
  source_type text not null,
  storage_path text,
  file_url text,
  file_mime_type text,
  file_size_bytes bigint,
  checksum_sha256 text,
  google_doc_id text,
  google_doc_url text,
  comments_json jsonb,
  created_by_user_id uuid not null references public.users(id) on delete restrict,
  reviewer_user_id uuid references public.users(id) on delete restrict,
  reviewer_role text,
  notes text,
  change_summary text,
  exported_at timestamptz,
  created_at timestamptz not null default now(),
  constraint letter_versions_version_type_check check (
    version_type in (
      'Draft Pengajuan',
      'Draft Dikoreksi',
      'Hasil Revisi',
      'Naskah Final'
    )
  ),
  constraint letter_versions_source_type_check check (
    source_type in (
      'google_docs',
      'upload_docx',
      'upload_pdf',
      'apps_script_export',
      'manual_snapshot_upload',
      'system_final'
    )
  ),
  constraint letter_versions_reviewer_role_check check (
    reviewer_role is null or reviewer_role in ('Ketua Tim', 'Kepala BPS')
  ),
  constraint letter_versions_version_number_check check (version_number > 0),
  constraint letter_versions_revision_round_check check (revision_round >= 0),
  constraint letter_versions_file_size_bytes_check check (
    file_size_bytes is null or file_size_bytes > 0
  ),
  constraint letter_versions_revision_summary_check check (
    version_type <> 'Hasil Revisi' or
    nullif(trim(change_summary), '') is not null
  ),
  constraint letter_versions_corrected_draft_reviewer_check check (
    version_type <> 'Draft Dikoreksi' or
    (reviewer_user_id is not null and reviewer_role is not null)
  ),
  constraint letter_versions_corrected_draft_evidence_check check (
    version_type <> 'Draft Dikoreksi' or
    (storage_path is not null or comments_json is not null)
  ),
  constraint letter_versions_evidence_check check (
    storage_path is not null or google_doc_url is not null or comments_json is not null
  ),
  constraint letter_versions_unique_version_number unique (letter_id, version_number)
);

alter table public.letter_versions
  add constraint letter_versions_parent_version_id_fkey
  foreign key (parent_version_id)
  references public.letter_versions(id)
  on delete restrict;

alter table public.letters
  add constraint letters_final_version_id_fkey
  foreign key (final_version_id)
  references public.letter_versions(id)
  on delete set null;

create table public.correction_snapshot_jobs (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  requested_by_user_id uuid not null references public.users(id) on delete restrict,
  reviewer_role text not null,
  source_google_doc_id text,
  status text not null default 'PENDING',
  error_message text,
  result_version_id uuid references public.letter_versions(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint correction_snapshot_jobs_reviewer_role_check check (
    reviewer_role in ('Ketua Tim', 'Kepala BPS')
  ),
  constraint correction_snapshot_jobs_status_check check (
    status in ('PENDING', 'SUCCESS', 'FAILED', 'FALLBACK_REQUIRED')
  )
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  actor_user_id uuid not null references public.users(id) on delete restrict,
  actor_role text not null,
  action text not null,
  from_status text,
  to_status text,
  notes text,
  version_id uuid references public.letter_versions(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint approvals_actor_role_check check (
    actor_role in ('Pegawai', 'Ketua Tim', 'Kepala BPS', 'Admin')
  ),
  constraint approvals_action_check check (
    action in (
      'SUBMIT_DRAFT',
      'COMPLETE_CORRECTION',
      'REQUEST_REVISION',
      'SUBMIT_REVISION',
      'FORWARD_TO_HEAD',
      'APPROVE_INTERNAL',
      'CREATE_FINAL',
      'CANCEL',
      'UPDATE_SRIKANDI_REFERENCE'
    )
  )
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  actor_user_id uuid references public.users(id) on delete set null,
  actor_role text,
  from_status text,
  to_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_actor_role_check check (
    actor_role is null or actor_role in ('Pegawai', 'Ketua Tim', 'Kepala BPS', 'Admin')
  )
);

create index idx_users_team_id on public.users(team_id);
create index idx_users_role on public.users(role);
create index idx_teams_leader_user_id on public.teams(leader_user_id);
create index idx_letters_creator_user_id on public.letters(creator_user_id);
create index idx_letters_team_id on public.letters(team_id);
create index idx_letters_status on public.letters(status);
create index idx_letters_letter_date on public.letters(letter_date);
create index idx_letters_current_reviewer_role on public.letters(current_reviewer_role);
create index idx_letters_created_at on public.letters(created_at);
create index idx_letter_versions_letter_id on public.letter_versions(letter_id);
create index idx_letter_versions_parent_version_id on public.letter_versions(parent_version_id);
create index idx_letter_versions_version_type on public.letter_versions(version_type);
create index idx_letter_versions_revision_round on public.letter_versions(revision_round);
create index idx_letter_versions_created_at on public.letter_versions(created_at);
create index idx_correction_snapshot_jobs_letter_id on public.correction_snapshot_jobs(letter_id);
create index idx_correction_snapshot_jobs_status on public.correction_snapshot_jobs(status);
create index idx_approvals_letter_id on public.approvals(letter_id);
create index idx_approvals_actor_user_id on public.approvals(actor_user_id);
create index idx_approvals_created_at on public.approvals(created_at);
create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_logs_actor_user_id on public.audit_logs(actor_user_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at);

create or replace function public.ensure_letter_version_parent_matches()
returns trigger
language plpgsql
as $$
declare
  parent_letter_id uuid;
begin
  if new.parent_version_id is null then
    return new;
  end if;

  select letter_id
  into parent_letter_id
  from public.letter_versions
  where id = new.parent_version_id;

  if parent_letter_id is null or parent_letter_id <> new.letter_id then
    raise exception 'parent_version_id must reference a version from the same letter';
  end if;

  return new;
end;
$$;

create trigger trg_letter_versions_parent_matches
before insert or update of parent_version_id, letter_id
on public.letter_versions
for each row
execute function public.ensure_letter_version_parent_matches();

create or replace function public.ensure_letter_final_version_matches()
returns trigger
language plpgsql
as $$
declare
  version_letter_id uuid;
begin
  if new.final_version_id is null then
    return new;
  end if;

  select letter_id
  into version_letter_id
  from public.letter_versions
  where id = new.final_version_id;

  if version_letter_id is null or version_letter_id <> new.id then
    raise exception 'final_version_id must reference a version from the same letter';
  end if;

  return new;
end;
$$;

create trigger trg_letters_final_version_matches
before insert or update of final_version_id
on public.letters
for each row
execute function public.ensure_letter_final_version_matches();

alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.letters enable row level security;
alter table public.letter_versions enable row level security;
alter table public.correction_snapshot_jobs enable row level security;
alter table public.approvals enable row level security;
alter table public.audit_logs enable row level security;

create policy "users can read own profile"
  on public.users
  for select
  to authenticated
  using (id = auth.uid());

create policy "authenticated users can read teams"
  on public.teams
  for select
  to authenticated
  using (true);
