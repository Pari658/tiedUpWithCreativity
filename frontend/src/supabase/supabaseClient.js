import { createClient } from '@supabase/supabase-js'
import { ENV } from '../lib/env.js';

const supabaseUrl = ENV.SUPABASE_URL
const supabaseKey = ENV.SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)