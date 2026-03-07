import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ReviewsManager from './ReviewsManager'

export default async function AdminReviews() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`*, profiles(full_name), books(title)`)
    .order('created_at', { ascending: false })

  return <ReviewsManager reviews={reviews || []} />
}