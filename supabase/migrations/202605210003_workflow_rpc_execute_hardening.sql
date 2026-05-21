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

revoke execute on function public.submit_draft_to_general_subdivision(
  uuid,
  uuid
) from public, anon, authenticated;

grant execute on function public.submit_draft_to_general_subdivision(
  uuid,
  uuid
) to service_role;

revoke execute on function public.create_and_submit_draft_letter(
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
) from public, anon, authenticated;

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
