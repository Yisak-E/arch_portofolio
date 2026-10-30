-- One-off: move v1 messages into v2 conversations (run AFTER schema.sql).
insert into public.conversations (id, client_id, subject, status, owner_unread, client_unread, last_message_at, created_at)
select id, sender_id, subject, 'open', not is_read, false, created_at, created_at from _old_messages
where sender_id in (select id from public.profiles);

insert into public.conversation_messages (conversation_id, sender_id, body, created_at)
select id, sender_id, body, created_at from _old_messages
where sender_id in (select id from public.profiles);
