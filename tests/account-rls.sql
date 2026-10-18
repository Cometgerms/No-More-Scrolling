begin;
select set_config('nms.test_a', gen_random_uuid()::text, true), set_config('nms.test_b', gen_random_uuid()::text, true);
insert into auth.users(id, email) values
(current_setting('nms.test_a')::uuid, 'nms-rls-a@example.invalid'),
(current_setting('nms.test_b')::uuid, 'nms-rls-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('nms.test_a'), 'role', 'authenticated')::text, true);
do $$
declare n int;
begin
 select count(*) into n from public.save_reading_state(current_setting('nms.test_a')::uuid, 0, '{"version":1,"saved":["measure"]}'::jsonb);
 if n <> 1 then raise exception 'Own insert failed'; end if;
 select count(*) into n from public.save_reading_state(current_setting('nms.test_a')::uuid, 0, '{"version":1}'::jsonb);
 if n <> 0 then raise exception 'Stale creation overwrote data'; end if;
 select count(*) into n from public.save_reading_state(current_setting('nms.test_a')::uuid, 1, '{"version":1,"notes":{"measure":"preserved"}}'::jsonb);
 if n <> 1 then raise exception 'Own update failed'; end if;
 select count(*) into n from public.save_reading_state(current_setting('nms.test_a')::uuid, 1, '{"version":1}'::jsonb);
 if n <> 0 then raise exception 'Stale revision overwrote data'; end if;
end $$;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('nms.test_b'), 'role', 'authenticated')::text, true);
do $$
declare n int; blocked boolean := false;
begin
 select count(*) into n from public.reading_states where user_id = current_setting('nms.test_a')::uuid;
 if n <> 0 then raise exception 'Cross-account read allowed'; end if;
 update public.reading_states set state = '{"version":1}' where user_id = current_setting('nms.test_a')::uuid;
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'Cross-account write allowed'; end if;
 begin
  perform public.save_reading_state(current_setting('nms.test_a')::uuid, 2, '{"version":1}'::jsonb);
 exception when raise_exception then blocked := true; end;
 if not blocked then raise exception 'Account switch was not rejected'; end if;
end $$;
reset role;
select 'PASS: own read/write, stale revision protection, cross-account isolation, expected-owner check' as result,
  not has_function_privilege('anon','public.save_reading_state(uuid,bigint,jsonb)','EXECUTE') as anonymous_rpc_blocked,
  not has_table_privilege('anon','public.reading_states','SELECT') as anonymous_table_blocked;
rollback;
