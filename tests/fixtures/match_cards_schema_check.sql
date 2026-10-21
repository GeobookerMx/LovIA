SELECT table_name, column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema='public' AND ((table_name='profiles' AND column_name IN ('id','alias','age','city','avatar_url','visibility_mode','status','onboarding_completed')) OR (table_name='matches' AND column_name IN ('id','user_a_id','user_b_id','status','current_level','created_at')) OR (table_name='blocks' AND column_name IN ('blocker_id','blocked_id')))
ORDER BY table_name, column_name;
