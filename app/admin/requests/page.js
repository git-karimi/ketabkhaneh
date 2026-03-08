import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminLayout from '../AdminLayout'

export default async function AdminRequests() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: requests } = await supabase
    .from('requests')
    .select(`*, books(title), requester:profiles!requests_requester_id_fkey(full_name), owner:profiles!requests_owner_id_fkey(full_name)`)
    .order('created_at', { ascending: false })

  const statusLabel = s =>
    s === 'pending' ? '⏳ در انتظار' :
    s === 'accepted' ? '✅ پذیرفته' : '❌ رد شده'

  const typeLabel = t =>
    t === 'borrow' ? 'قرض' : t === 'gift' ? 'هدیه' : 'خرید'

  return (
    <AdminLayout adminName={profile.full_name}>
      <div>
        <h2 style={{fontSize:'1.4rem', fontWeight:700, color:'#0f172a', marginBottom:'1.5rem'}}>مدیریت درخواست‌ها</h2>

        <div style={{background:'#fff', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,0.06)', overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.875rem'}}>
            <thead>
              <tr style={{background:'#f8fafc', borderBottom:'1px solid #e2e8f0'}}>
                {['کتاب','درخواست‌دهنده','صاحب کتاب','نوع','وضعیت'].map(h => (
                  <th key={h} style={{textAlign:'right', padding:'12px 16px', color:'#475569', fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests?.map(req => (
                <tr key={req.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                  <td style={{padding:'12px 16px', fontWeight:600, color:'#0f172a'}}>{req.books?.title || '—'}</td>
                  <td style={{padding:'12px 16px', color:'#475569'}}>{req.requester?.full_name || '—'}</td>
                  <td style={{padding:'12px 16px', color:'#475569'}}>{req.owner?.full_name || '—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{fontSize:'0.75rem', padding:'4px 10px', borderRadius:20, background:'#f1f5f9', color:'#475569'}}>
                      {typeLabel(req.request_type)}
                    </span>
                  </td>
                  <td style={{padding:'12px 16px', fontSize:'0.8rem'}}>{statusLabel(req.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}