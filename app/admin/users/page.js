import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UsersManager from './UsersManager'

export default async function AdminUsers() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: users } = await supabase
    .from('profiles').select('*').order('created_at', { ascending: false })

  return <UsersManager users={users || []} currentUserId={user.id} adminName={profile.full_name} />
}