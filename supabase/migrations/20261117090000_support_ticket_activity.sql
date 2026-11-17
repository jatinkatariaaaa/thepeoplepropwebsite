-- Keep a ticket's place in the queue honest: a new message bumps updated_at,
-- a trader's reply reopens a resolved ticket, an admin's reply moves an open
-- ticket to in progress and tells the trader. A new ticket alerts the admins.
create or replace function private.ticket_message_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  t public.support_tickets;
begin
  select * into t from public.support_tickets where id = new.ticket_id;
  if not found then return new; end if;

  update public.support_tickets
     set updated_at = now(),
         status = case
           when new.sender_role = 'user' and status in ('resolved', 'closed') then 'open'
           when new.sender_role = 'admin' and status = 'open' then 'in_progress'
           else status
         end
   where id = new.ticket_id;

  if new.sender_role = 'admin' and t.user_id is not null
     and exists (select 1 from public.profiles p where p.id = t.user_id) then
    insert into public.user_notifications (user_id, type, title, body, link)
    values (t.user_id, 'ticket_reply', 'Support replied', left(new.message, 140), '/dashboard/support');
  end if;
  return new;
exception when others then
  raise warning 'ticket_message_after_insert failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists trg_ticket_message_after_insert on public.ticket_messages;
create trigger trg_ticket_message_after_insert
  after insert on public.ticket_messages
  for each row execute function private.ticket_message_after_insert();

create or replace function private.support_ticket_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.admin_notifications (type, severity, title, message, entity_type, entity_id, user_id)
  values ('system_alert', case when new.priority in ('high', 'urgent') then 'warning' else 'info' end,
          'New support ticket', new.user_email || ': ' || new.subject, 'ticket', new.id::text, new.user_id);
  return new;
exception when others then
  raise warning 'support_ticket_after_insert failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists trg_support_ticket_after_insert on public.support_tickets;
create trigger trg_support_ticket_after_insert
  after insert on public.support_tickets
  for each row execute function private.support_ticket_after_insert();
