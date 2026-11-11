-- Production still had the pre-June register_new_estate without p_estate_name,
-- so sign-ups that create a new estate failed with "Could not find the function".
-- The app never calls the old 4-argument version; drop it so only one remains.
drop function if exists register_new_estate(text, text, integer, text);

create or replace function register_new_estate(
  p_email        text,
  p_name         text,
  p_estate_name  text,
  p_color_index  integer,
  p_timezone     text
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_estate_id  uuid;
  v_join_code  text;
  v_created_at bigint;
begin
  v_created_at := (extract(epoch from now()) * 1000)::bigint;

  insert into estates (name)
  values (p_estate_name)
  returning id, join_code into v_estate_id, v_join_code;

  insert into profiles (id, estate_id, email, name, color_index, timezone, created_at)
  values (auth.uid(), v_estate_id, p_email, p_name, p_color_index, p_timezone, v_created_at);

  return jsonb_build_object(
    'estate_id',  v_estate_id,
    'join_code',  v_join_code
  );
end;
$$;

notify pgrst, 'reload schema';
