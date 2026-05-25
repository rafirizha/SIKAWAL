alter function public.ensure_letter_version_parent_matches()
set search_path = public;

alter function public.ensure_letter_final_version_matches()
set search_path = public;

alter function public.create_and_submit_draft_letter(
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
)
set search_path = public;

alter function public.prevent_letter_versions_mutation()
set search_path = public;

alter function public.create_draft_letter(
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
)
set search_path = public;

alter function public.submit_draft_to_general_subdivision(uuid, uuid)
set search_path = public;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

create index if not exists idx_approvals_version_id
on public.approvals(version_id);

create index if not exists idx_correction_snapshot_jobs_requested_by_user_id
on public.correction_snapshot_jobs(requested_by_user_id);

create index if not exists idx_correction_snapshot_jobs_result_version_id
on public.correction_snapshot_jobs(result_version_id);

create index if not exists idx_letter_versions_created_by_user_id
on public.letter_versions(created_by_user_id);

create index if not exists idx_letter_versions_reviewer_user_id
on public.letter_versions(reviewer_user_id);

create index if not exists idx_letters_final_version_id
on public.letters(final_version_id);
