-- NOT YET APPLIED to the live project (the confirmation timed out on 30 Oct 2026).
-- Fills the public site name (site_profile.full_name) from the owner's account
-- while it still shows the "Your Name" placeholder.

create or replace function private.sync_site_name_from_owner()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.role = 'owner' and coalesce(new.full_name, '') <> '' then
    update public.site_profile
       set full_name = new.full_name, updated_at = now()
     where id = 1 and full_name in ('Your Name', '');
  end if;
  return null;
end;
$$;
revoke execute on function private.sync_site_name_from_owner() from public, anon, authenticated;

drop trigger if exists sync_site_name on public.profiles;
create trigger sync_site_name after insert or update of role, full_name on public.profiles
  for each row execute function private.sync_site_name_from_owner();

-- One-off sync for the current owner.
update public.site_profile s
   set full_name = p.full_name, updated_at = now()
  from public.profiles p
 where s.id = 1 and p.role = 'owner' and coalesce(p.full_name, '') <> ''
   and s.full_name in ('Your Name', '');
