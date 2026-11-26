-- A message written at the same instant the other side last looked still counts as unread
-- (seen markers now use clock_timestamp(), message times use the transaction time).

alter table public.support_tickets drop column if exists user_unread;
alter table public.support_tickets drop column if exists admin_unread;

alter table public.support_tickets
  add column user_unread boolean
    generated always as (last_sender = 'admin' and (user_seen_at is null or user_seen_at <= last_message_at)) stored,
  add column admin_unread boolean
    generated always as (last_sender = 'user' and (admin_seen_at is null or admin_seen_at <= last_message_at)) stored;

-- The sender has seen everything before their own message, but not something written in the same instant.
create or replace function private.ticket_message_after_insert()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  t public.support_tickets;
begin
  select * into t from public.support_tickets where id = new.ticket_id;
  if not found then return new; end if;

  update public.support_tickets
     set updated_at = now(),
         last_message_at = new.created_at,
         last_sender = new.sender_role,
         user_seen_at = case when new.sender_role = 'user' then clock_timestamp() else user_seen_at end,
         admin_seen_at = case when new.sender_role = 'admin' then clock_timestamp() else admin_seen_at end,
         status = case
           when new.sender_role = 'user' and status in ('resolved', 'closed') then 'open'
           when new.sender_role = 'admin' and status = 'open' then 'in_progress'
           else status
         end
   where id = new.ticket_id;

  if new.sender_role = 'admin' and t.user_id is not null
     and exists (select 1 from public.profiles p where p.id = t.user_id) then
    insert into public.user_notifications (user_id, type, title, body, link)
    values (t.user_id, 'ticket_reply', 'Support replied: ' || left(t.subject, 80), left(new.message, 140),
            '/dashboard/support?ticket=' || t.id);
  elsif new.sender_role = 'user' and t.last_message_at is not null then
    insert into public.admin_notifications (type, severity, title, message, entity_type, entity_id, user_id)
    values ('system_alert', 'info', 'Ticket reply', coalesce(t.user_email, '') || ': ' || left(new.message, 140),
            'ticket', t.id::text, t.user_id);
  end if;
  return new;
exception when others then
  raise warning 'ticket_message_after_insert failed: %', sqlerrm;
  return new;
end;
$$;

create or replace function public.support_ticket_seen(p_ticket uuid)
returns void
language sql
security definer
set search_path to ''
as $$
  update public.support_tickets
     set user_seen_at = clock_timestamp()
   where id = p_ticket
     and user_id = (select auth.uid())
     and user_unread;
$$;

revoke all on function private.ticket_message_after_insert() from public, anon, authenticated;
revoke all on function public.support_ticket_seen(uuid) from public, anon;
grant execute on function public.support_ticket_seen(uuid) to authenticated;
