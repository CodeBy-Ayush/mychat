import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jzswyeuakieplifjrula.supabase.co";

const supabaseKey = "sb_publishable__uAdhaw_YDw7Rt0L4JxiLw_7ZalCflS";

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);