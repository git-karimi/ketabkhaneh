import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import BooksManager from './BooksManager'

export default async function AdminBooks() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: books } = await supabase
    .from('books')
    .select(`*, profiles(full_name)`)
    .order('created_at', { ascending: false })

  return <BooksManager books={books || []} adminName={profile.full_name} />
}