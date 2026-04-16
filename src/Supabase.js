import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://carssqvvbepwooapmrge.supabase.co"
const supabaseAnonkey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcnNzcXZ2YmVwd29vYXBtcmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTQ2OTksImV4cCI6MjA5MDQzMDY5OX0.KsfynWXeK434uoHXBpshGZNiemCiuuypj2cCgP5hsAM"
export const supabase = createClient(supabaseUrl,supabaseAnonkey);