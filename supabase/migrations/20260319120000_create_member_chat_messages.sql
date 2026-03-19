create extension if not exists pgcrypto;

create or replace function public.is_current_user_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_dashboard ud
    where ud.user_id = auth.uid()
      and (
        coalesce(ud.membro, false) = true
        or lower(coalesce(ud.role, '')) = 'membro'
      )
  );
$$;

create table if not exists public.member_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  message text not null,
  author_name text,
  author_filial text,
  author_avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default (timezone('utc', now()) + interval '1 hour'),
  constraint member_chat_messages_message_check check (char_length(trim(message)) between 1 and 400),
  constraint member_chat_messages_expiration_check check (expires_at > created_at)
);

create index if not exists member_chat_messages_created_at_idx
  on public.member_chat_messages (created_at asc);

create index if not exists member_chat_messages_expires_at_idx
  on public.member_chat_messages (expires_at asc);

alter table public.member_chat_messages enable row level security;

drop policy if exists "Members can read member chat" on public.member_chat_messages;
create policy "Members can read member chat"
on public.member_chat_messages
for select
using (public.is_current_user_member());

drop policy if exists "Members can send member chat messages" on public.member_chat_messages;
create policy "Members can send member chat messages"
on public.member_chat_messages
for insert
with check (
  public.is_current_user_member()
  and auth.uid() = user_id
);

drop policy if exists "Members can delete expired member chat messages" on public.member_chat_messages;
create policy "Members can delete expired member chat messages"
on public.member_chat_messages
for delete
using (
  public.is_current_user_member()
  and (
    expires_at <= timezone('utc', now())
    or auth.uid() = user_id
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'member_chat_messages'
  ) then
    alter publication supabase_realtime add table public.member_chat_messages;
  end if;
end
$$;
