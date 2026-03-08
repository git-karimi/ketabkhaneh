'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children, adminName }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { href: '/admin', icon: '📊', label: 'داشبورد' },
    { href: '/admin/users', icon: '👥', label: 'کاربران' },
    { href: '/admin/books', icon: '📚', label: 'کتاب‌ها' },
    { href: '/admin/reviews', icon: '⭐', label: 'نظرات' },
    { href: '/admin/requests', icon: '📬', label: 'درخواست‌ها' },
  ]

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#f4f6f9', fontFamily:'Vazirmatn, Arial, sans-serif', direction:'rtl'}}>
      
      {/* Sidebar */}
      <div style={{width:260, background:'#fff', borderLeft:'1px solid #e2e8f0', height:'100vh', position:'fixed', right:0, top:0, display:'flex', flexDirection:'column', zIndex:50}}>
        
        {/* لوگو */}
        <div style={{height:60, padding:'0 20px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid #e2e8f0'}}>
          <div style={{width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem'}}>📚</div>
          <div>
            <div style={{fontWeight:700, fontSize:'0.9rem', color:'#0f172a'}}>کتابخانه</div>
            <div style={{fontSize:'0.7rem', color:'#94a3b8'}}>پنل مدیریت</div>
          </div>
        </div>

        {/* منو */}
        <nav style={{flex:1, padding:'1rem 0', overflowY:'auto'}}>
          <div style={{padding:'0 12px', marginBottom:'0.5rem'}}>
            <div style={{fontSize:'0.65rem', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, padding:'0 8px'}}>منو اصلی</div>
          </div>
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                style={{display:'flex', alignItems:'center', gap:10, padding:'10px 20px', margin:'2px 12px', borderRadius:8, textDecoration:'none', background: isActive ? '#eef2ff' : 'transparent', color: isActive ? '#6366f1' : '#475569', fontWeight: isActive ? 600 : 400, fontSize:'0.875rem', transition:'all 0.15s'}}>
                <span style={{fontSize:'1rem'}}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* پروفایل ادمین */}
        <div style={{padding:'1rem', borderTop:'1px solid #e2e8f0'}}>
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'#f8fafc'}}>
            <div style={{width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'0.9rem'}}>
              {adminName?.charAt(0) || 'A'}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontWeight:600, fontSize:'0.8rem', color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{adminName || 'ادمین'}</div>
              <div style={{fontSize:'0.7rem', color:'#94a3b8'}}>مدیر سیستم</div>
            </div>
            <button onClick={handleLogout}
              style={{background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:'1rem', padding:4}}
              title="خروج">
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* محتوا */}
      <div style={{flex:1, marginRight:260, display:'flex', flexDirection:'column', minHeight:'100vh'}}>
        {/* هدر */}
        <header style={{height:60, background:'#fff', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', position:'sticky', top:0, zIndex:40}}>
          <div style={{fontSize:'0.875rem', color:'#94a3b8'}}>
            {navItems.find(n => n.href === pathname)?.label || 'داشبورد'}
          </div>
          <Link href="/" style={{fontSize:'0.8rem', color:'#6366f1', textDecoration:'none'}}>
            → بازگشت به سایت
          </Link>
        </header>

        {/* محتوای اصلی */}
        <main style={{flex:1, padding:'2rem'}}>
          {children}
        </main>
      </div>
    </div>
  )
}