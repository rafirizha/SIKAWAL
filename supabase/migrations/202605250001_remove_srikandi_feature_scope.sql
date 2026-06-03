do $$
begin
  if exists (
    select 1
    from public.approvals
    where action = 'UPDATE_SRIKANDI_REFERENCE'
  ) then
    raise exception 'Cannot remove SRIKANDI feature scope while UPDATE_SRIKANDI_REFERENCE approval rows still exist';
  end if;
end $$;

alter table public.approvals
  drop constraint if exists approvals_action_check;

alter table public.approvals
  add constraint approvals_action_check check (
    action in (
      'SUBMIT_DRAFT',
      'COMPLETE_CORRECTION',
      'REQUEST_REVISION',
      'SUBMIT_REVISION',
      'FORWARD_TO_HEAD',
      'APPROVE_INTERNAL',
      'CREATE_FINAL',
      'CANCEL'
    )
  );

alter table public.letters
  drop column if exists srikandi_reference_number,
  drop column if exists srikandi_reference_url,
  drop column if exists srikandi_processed_at;
