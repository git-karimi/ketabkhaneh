import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import RequestsManager from './RequestsManager'

export default async function AdminRequests() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: requests } = await supabase
    .from('requests')
    .select(`
      *,
      books(title, author),
      requester:profiles!requests_requester_id_fkey(full_name),
      owner:profiles!requests_owner_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  return <RequestsManager requests={requests || []} adminName={profile.full_name} />
}