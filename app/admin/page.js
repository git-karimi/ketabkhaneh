import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminLayout from './AdminLayout'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const [
    { count: usersCount },
    { count: booksCount },
    { count: requestsCount },
    { count: reviewsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('requests').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
  ])

  return (
    <AdminLayout adminName={profile.full_name} activePage="dashboard">
      <div>
        <h2 style={{fontSize:'1.4rem', fontWeight:700, color:'#0f172a', marginBottom:'1.5rem'}}>داشبورد</h2>

        {/* کارت‌های آمار */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem'}}>
          {[
            { label:'کاربران', count: usersCount, icon:'👥', color:'#6366f1', bg:'#eef2ff' },
            { label:'کتاب‌ها', count: booksCount, icon:'📚', color:'#10b981', bg:'#ecfdf5' },
            { label:'درخواست‌ها', count: requestsCount, icon:'📬', color:'#3b82f6', bg:'#eff6ff' },
            { label:'نظرات', count: reviewsCount, icon:'⭐', color:'#f59e0b', bg:'#fffbeb' },
          ].map(s => (
            <div key={s.label} style={{background:'#fff', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                <span style={{fontSize:'0.8rem', color:'#475569', fontWeight:500}}>{s.label}</span>
                <div style={{width:40, height:40, borderRadius:'10px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem'}}>
                  {s.icon}
                </div>
              </div>
              <div style={{fontSize:'2rem', fontWeight:800, color:'#0f172a'}}>{s.count}</div>
            </div>
          ))}
        </div>

        {/* دسترسی سریع */}
        <div style={{background:'#fff', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
          <h3 style={{fontWeight:600, marginBottom:'1rem', color:'#0f172a'}}>دسترسی سریع</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1rem'}}>
            {[
              { href:'/admin/users', icon:'👥', title:'مدیریت کاربران', desc:'مشاهده، مسدود کردن و تغییر نقش' },
              { href:'/admin/books', icon:'📚', title:'مدیریت کتاب‌ها', desc:'غیرفعال کردن کتاب‌های نامناسب' },
              { href:'/admin/reviews', icon:'⭐', title:'مدیریت نظرات', desc:'حذف نظرات نامناسب' },
              { href:'/admin/requests', icon:'📬', title:'مدیریت درخواست‌ها', desc:'وضعیت همه درخواست‌ها' },
            ].map(item => (
              <a key={item.href} href={item.href}
                style={{display:'flex', alignItems:'center', gap:'1rem', padding:'1rem', borderRadius:'10px', background:'#f8fafc', border:'1px solid #e2e8f0', textDecoration:'none', transition:'all 0.2s'}}>
                <div style={{fontSize:'1.5rem'}}>{item.icon}</div>
                <div>
                  <div style={{fontWeight:600, color:'#0f172a', fontSize:'0.9rem'}}>{item.title}</div>
                  <div style={{fontSize:'0.75rem', color:'#94a3b8', marginTop:'2px'}}>{item.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}