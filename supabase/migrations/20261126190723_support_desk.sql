-- Support desk: tickets as conversations both sides can follow.
--
-- * last_message_at / last_sender: who spoke last, so the admin inbox can show what needs a
--   reply and the trader sees which tickets have an answer waiting.
-- * user_seen_at / admin_seen_at with the generated user_unread / admin_unread flags drive the
--   unread dots and the sidebar badge (PostgREST cannot compare two columns in a filter).
-- * Notifications: an admin reply, or a ticket being resolved or closed, lands in the trader's
--   dashboard bell with a link straight to that ticket; a trader's follow-up lands in the admin bell.

alter table public.support_tickets
  add column if not exists last_message_at timestamptz,
  add column if not exists last_sender text,
  add column if not exists user_seen_at timestamptz,
  add column if not exists admin_seen_at timestamptz;

do $$ begin
  alter table public.support_tickets
    add constraint support_tickets_last_sender_check check (last_sender in ('user', 'admin'));
exception when duplicate_object then null;
end $$;

update public.support_tickets t
set last_message_at = m.created_at, last_sender = m.sender_role
from (
  select distinct on (ticket_id) ticket_id, created_at, sender_role
  from public.ticket_messages order by ticket_id, created_at desc, id desc
) m
where m.ticket_id = t.id and t.last_message_at is null;

alter table public.support_tickets
  add column if not exists user_unread boolean
    generated always as (last_sender = 'admin' and (user_seen_at is null or user_seen_at < last_message_at)) stored,
  add column if not exists admin_unread boolean
    generated always as (last_sender = 'user' and (admin_seen_at is null or admin_seen_at < last_message_at)) stored;

create index if not exists support_tickets_user_idx on public.support_tickets (user_id, updated_at desc);
create index if not exists support_tickets_inbox_idx on public.support_tickets (status, last_message_at desc);
create index if not exists ticket_messages_ticket_idx on public.ticket_messages (ticket_id, created_at);

-- A new message: keep the ticket's state in step and tell the other side.
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
         -- whoever wrote the message has seen the conversation up to it
         user_seen_at = case when new.sender_role = 'user' then new.created_at else user_seen_at end,
         admin_seen_at = case when new.sender_role = 'admin' then new.created_at else admin_seen_at end,
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
    -- a follow-up; the first message is announced by the new-ticket notification
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

-- Resolved or closed by the team: the trader hears about it.
create or replace function private.support_ticket_after_status()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if new.user_id is not null and new.status in ('resolved', 'closed') then
    insert into public.user_notifications (user_id, type, title, body, link)
    values (new.user_id, 'ticket_status',
            case when new.status = 'resolved' then 'Ticket resolved' else 'Ticket closed' end,
            left(new.subject, 140) || ' · Reply on the ticket if you still need help.',
            '/dashboard/support?ticket=' || new.id);
  end if;
  return null;
exception when others then
  raise warning 'support_ticket_after_status failed: %', sqlerrm;
  return null;
end;
$$;

drop trigger if exists trg_support_ticket_after_status on public.support_tickets;
create trigger trg_support_ticket_after_status
after update of status on public.support_tickets
for each row when (old.status is distinct from new.status)
execute function private.support_ticket_after_status();

-- The trader opened a ticket: clear its unread dot. Traders cannot update tickets directly.
create or replace function public.support_ticket_seen(p_ticket uuid)
returns void
language sql
security definer
set search_path to ''
as $$
  update public.support_tickets
     set user_seen_at = now()
   where id = p_ticket
     and user_id = (select auth.uid())
     and user_unread;
$$;

revoke all on function private.ticket_message_after_insert() from public, anon, authenticated;
revoke all on function private.support_ticket_after_status() from public, anon, authenticated;
revoke all on function public.support_ticket_seen(uuid) from public, anon;
grant execute on function public.support_ticket_seen(uuid) to authenticated;
