import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string

export const supabase = createClient(url, key)

export async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('item-images').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('item-images').getPublicUrl(path)
    return data.publicUrl
}