import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Cek URL:", supabaseUrl); 
console.log("Cek Key:", supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL atau Key masih kosong/undefined!")
}

export const supabase = createClient(supabaseUrl, supabaseKey)