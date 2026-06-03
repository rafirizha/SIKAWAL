grant usage on schema public to service_role;

grant select, insert, update, delete on table
  public.users,
  public.teams,
  public.letters,
  public.letter_versions,
  public.correction_snapshot_jobs,
  public.approvals,
  public.audit_logs
to service_role;

revoke all privileges on table
  public.letters,
  public.letter_versions,
  public.correction_snapshot_jobs,
  public.approvals,
  public.audit_logs
from anon, authenticated;

revoke all privileges on table
  public.users,
  public.teams
from anon;

revoke insert, update, delete, truncate, references, trigger on table
  public.users,
  public.teams
from authenticated;

grant usage on schema public to authenticated;

grant select on table
  public.users,
  public.teams
to authenticated;
