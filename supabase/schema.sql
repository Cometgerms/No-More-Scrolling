create table public.reading_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object' and state->>'version' = '1' and octet_length(state::text) <= 5000000),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.reading_states enable row level security;
revoke all on public.reading_states from anon, authenticated;
grant select, insert, update on public.reading_states to authenticated;
create policy own_read on public.reading_states for select to authenticated using ((select auth.uid()) = user_id);
create policy own_insert on public.reading_states for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_update on public.reading_states for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function public.save_reading_state(expected_owner uuid, expected_revision bigint, new_state jsonb)
returns setof public.reading_states language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null or auth.uid() <> expected_owner then raise exception 'Account changed'; end if;
  if expected_revision = 0 then
    return query insert into public.reading_states(user_id, state)
      values (auth.uid(), new_state) on conflict (user_id) do nothing returning *;
  else
    return query update public.reading_states set state = new_state, revision = revision + 1, updated_at = now()
      where user_id = auth.uid() and revision = expected_revision returning *;
  end if;
end;
$$;
revoke all on function public.save_reading_state(uuid, bigint, jsonb) from public, anon;
grant execute on function public.save_reading_state(uuid, bigint, jsonb) to authenticated;
