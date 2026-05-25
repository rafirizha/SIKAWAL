drop policy if exists "server only deny direct access" on public.letters;
drop policy if exists "server only deny direct access" on public.letter_versions;
drop policy if exists "server only deny direct access" on public.correction_snapshot_jobs;
drop policy if exists "server only deny direct access" on public.approvals;
drop policy if exists "server only deny direct access" on public.audit_logs;

create policy "server only deny direct access"
  on public.letters
  for all
  to public
  using (false)
  with check (false);

create policy "server only deny direct access"
  on public.letter_versions
  for all
  to public
  using (false)
  with check (false);

create policy "server only deny direct access"
  on public.correction_snapshot_jobs
  for all
  to public
  using (false)
  with check (false);

create policy "server only deny direct access"
  on public.approvals
  for all
  to public
  using (false)
  with check (false);

create policy "server only deny direct access"
  on public.audit_logs
  for all
  to public
  using (false)
  with check (false);

drop policy if exists "users can read own profile" on public.users;

create policy "users can read own profile"
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);
