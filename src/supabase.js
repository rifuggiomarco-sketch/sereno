import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nuqoidtfipzraqwjjgjj.supabase.co'
const supabaseKey = 'sb_publishable_aXhiG36fUSENU18SGRSk6A_lbSYcvfU'

export const supabase = createClient(supabaseUrl, supabaseKey)
