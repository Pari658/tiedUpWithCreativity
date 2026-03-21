import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://vspiwiteykkpqfsqgakh.supabase.co"
const supabaseKey = "sb_publishable_2q6v7Ld6sg9YRCR_OnjKwQ_93jNyVnI"

export const supabase = createClient(supabaseUrl, supabaseKey)