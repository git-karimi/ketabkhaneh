'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase.from('profiles').select('full_name, role').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // توی صفحات ادمین navbar نمایش داده نشه
  if (pathname.startsWith('/admin')) return null

  return (
    <nav style={{background:'#fff', borderBottom:'1px solid #e2e8f0', position:'sticky', top:0, zIndex:50, direction:'rtl'}}>
      <div style={{maxWidth:1200, margin:'0 auto', padding:'0 1.5rem', height:60, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        
        {/* لوگو */}
        <Link href="/" style={{display:'flex', alignItems:'center', gap:8, textDecoration:'none'}}>
          <div style={{width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#3b82f6,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem'}}>📚</div>
          <span style={{fontWeight:700, fontSize:'1rem', color:'#0f172a'}}>کتابخانه</span>
        </Link>

        {/* منو دسکتاپ */}
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <Link href="/" style={{fontSize:'0.875rem', color: pathname === '/' ? '#3b82f6' : '#475569', textDecoration:'none', padding:'6px 12px', borderRadius:8, background: pathname === '/' ? '#eff6ff' : 'transparent', fontWeight: pathname === '/' ? 600 : 400}}>
            🏠 خانه
          </Link>

          {user ? (
            <>
              <Link href="/dashboard"
                style={{fontSize:'0.875rem', color: pathname === '/dashboard' ? '#3b82f6' : '#475569', textDecoration:'none', padding:'6px 12px', borderRadius:8, background: pathname === '/dashboard' ? '#eff6ff' : 'transparent', fontWeight: pathname === '/dashboard' ? 600 : 400}}>
                📖 کتاب‌های من
              </Link>

              <Link href="/dashboard/requests"
                style={{fontSize:'0.875rem', color: pathname.includes('/requests') ? '#3b82f6' : '#475569', textDecoration:'none', padding:'6px 12px', borderRadius:8, background: pathname.includes('/requests') ? '#eff6ff' : 'transparent', fontWeight: pathname.includes('/requests') ? 600 : 400}}>
                📬 درخواست‌ها
              </Link>

              <Link href="/books/add"
                style={{fontSize:'0.875rem', color:'#fff', textDecoration:'none', padding:'6px 14px', borderRadius:8, background:'#3b82f6', fontWeight:600}}>
                + افزودن کتاب
              </Link>

              {profile?.role === 'admin' && (
                <Link href="/admin"
                  style={{fontSize:'0.875rem', color:'#6366f1', textDecoration:'none', padding:'6px 12px', borderRadius:8, background:'#eef2ff', fontWeight:600}}>
                  🛡️ مدیریت
                </Link>
              )}

              {/* منوی کاربر */}
              <div style={{position:'relative'}}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  style={{display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', cursor:'pointer', fontSize:'0.875rem', color:'#0f172a'}}>
                  <div style={{width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'0.75rem', fontWeight:700}}>
                    {profile?.full_name?.charAt(0) || '؟'}
                  </div>
                  <span style={{maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {profile?.full_name || 'کاربر'}
                  </span>
                  <span style={{fontSize:'0.6rem'}}>▼</span>
                </button>

                {menuOpen && (
                  <div style={{position:'absolute', top:'110%', left:0, background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, boxShadow:'0 4px 12px rgba(0,0,0,0.1)', minWidth:160, zIndex:100}}>
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                      style={{display:'block', padding:'10px 16px', fontSize:'0.875rem', color:'#475569', textDecoration:'none', borderBottom:'1px solid #f1f5f9'}}>
                      👤 پروفایل من
                    </Link>
                    <button onClick={handleLogout}
                      style={{display:'block', width:'100%', textAlign:'right', padding:'10px 16px', fontSize:'0.875rem', color:'#ef4444', background:'none', border:'none', cursor:'pointer'}}>
                      🚪 خروج
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login"
                style={{fontSize:'0.875rem', color:'#475569', textDecoration:'none', padding:'6px 14px', borderRadius:8, border:'1px solid #e2e8f0'}}>
                ورود
              </Link>
              <Link href="/register"
                style={{fontSize:'0.875rem', color:'#fff', textDecoration:'none', padding:'6px 14px', borderRadius:8, background:'#3b82f6', fontWeight:600}}>
                ثبت‌نام
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}