insert into public.teams (id, name)
values
  ('10000000-0000-0000-0000-000000000001', 'Tim Umum'),
  ('10000000-0000-0000-0000-000000000002', 'Tim Statistik Produksi')
on conflict (id) do nothing;

insert into public.users (id, name, email, role, team_id, is_active)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'Pegawai Dummy',
    'pegawai@example.test',
    'Pegawai',
    '10000000-0000-0000-0000-000000000001',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Kasubbag Umum Dummy',
    'kasubbag-umum@example.test',
    'Kasubbag Umum',
    '10000000-0000-0000-0000-000000000001',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Kepala BPS Dummy',
    'kepala-bps@example.test',
    'Kepala BPS',
    null,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Admin Dummy',
    'admin@example.test',
    'Admin',
    null,
    true
  )
on conflict (id) do nothing;

update public.teams
set leader_user_id = '20000000-0000-0000-0000-000000000002'
where id = '10000000-0000-0000-0000-000000000001';

insert into public.letters (
  id,
  subject,
  recipient,
  letter_date,
  creator_user_id,
  team_id,
  status,
  current_reviewer_role,
  revision_round,
  google_doc_url,
  data_classification
)
values (
  '30000000-0000-0000-0000-000000000001',
  'Undangan rapat koordinasi dummy',
  'Peserta rapat internal',
  '2026-05-20',
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Menunggu Koreksi Kasubbag Umum',
  'Kasubbag Umum',
  0,
  'https://docs.google.com/document/d/dummy-document-id/edit',
  'dummy'
)
on conflict (id) do nothing;

insert into public.letter_versions (
  id,
  letter_id,
  version_number,
  revision_round,
  version_type,
  title,
  source_type,
  google_doc_url,
  created_by_user_id
)
values (
  '40000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  1,
  0,
  'Draft Pengajuan',
  'Draft Pengajuan 1',
  'google_docs',
  'https://docs.google.com/document/d/dummy-document-id/edit',
  '20000000-0000-0000-0000-000000000001'
)
on conflict (id) do nothing;
