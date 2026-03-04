import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import RequestsManager from './RequestsManager'

export default async function RequestsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // درخواست‌های دریافتی
  const { data: received } = await supabase
    .from('requests')
    .select(`*, books(title, author), profiles!requests_requester_id_fkey(full_name)`)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // درخواست‌های ارسالی
  const { data: sent } = await supabase
    .from('requests')
    .select(`*, books(title, author), profiles!requests_owner_id_fkey(full_name)`)
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  return <RequestsManager received={received || []} sent={sent || []} />
}