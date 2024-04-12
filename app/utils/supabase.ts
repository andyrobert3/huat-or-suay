import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fpmzvrlcupujrprpjwcw.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseKey) {
    throw new Error('Supabase key is not defined')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase };