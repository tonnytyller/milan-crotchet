import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://botiybwcqbybnrzpavsy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdGl5YndjcWJ5Ym5yenBhdnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDExNjMsImV4cCI6MjA3NjA3NzE2M30.lhZaya1iPIGfrcCQC369s_v0NcT7P1GtmQvzQteUyo8'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)