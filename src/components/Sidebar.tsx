import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

const navItems = [
  { icon: '⊞', label: 'Dashboard',      path: '/dashboard' },
  { icon: '◫', label: 'Meetings',       path: '/meetings' },
  { icon: '✅', label: 'Action Items',  path: '/action-items' },
  { icon: '🤖', label: 'AI Assistant',  path: '/ai-assistant' },
  { icon: '📝', label: 'Transcriptions',path: '/transcriptions' },
  { icon: '👤', label: 'Profile',       path: '/profile' },
  { icon: '🔴', label: 'Live Record', path: '/record' },
]

export default function Sidebar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [user, setUser]             = useState<any>(null)
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const w = isMobile ? '220px' : collapsed ? '68px' : '216px'

  const SidebarContent = () => (
    <div style={{
      width: w,
      height: '100%',           /* fill the fixed wrapper */
      background: 'rgba(10,10,20,0.97)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      padding: '18px 10px',
      fontFamily: "'DM Sans', sans-serif",
      backdropFilter: 'blur(24px)',
      transition: 'width 0.25s ease',
      overflowX: 'hidden',
      overflowY: 'hidden',      /* ← never scroll the sidebar */
      flexShrink: 0,
    }}>

      {/* ── Logo row ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
        padding: '4px 6px', marginBottom: 24,
      }}>
        {(!collapsed || isMobile) ? (
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{
              width:32, height:32, borderRadius:9,
              background:'linear-gradient(135deg,#6457F9,#8B7FF7)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:15, color:'white', fontWeight:700, flexShrink:0,
              boxShadow:'0 4px 14px rgba(100,87,249,0.45)',
            }}>N</div>
            <span style={{ fontWeight:700, fontSize:16, color:'white', letterSpacing:'-0.01em' }}>
              Notivo <span style={{ color:'#8B7FF7' }}>AI</span>
            </span>
          </div>
        ) : (
          <div style={{
            width:32, height:32, borderRadius:9,
            background:'linear-gradient(135deg,#6457F9,#8B7FF7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:15, color:'white', fontWeight:700,
            boxShadow:'0 4px 14px rgba(100,87,249,0.45)',
          }}>N</div>
        )}
        {!isMobile && (
          <button onClick={() => setCollapsed(c => !c)} style={{
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)',
            color:'rgba(255,255,255,0.45)', width:24, height:24,
            borderRadius:6, cursor:'pointer', fontSize:11,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            transition:'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(100,87,249,0.2)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.06)'}
          >{collapsed ? '→' : '←'}</button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex:1 }}>
        {navItems.map(item => {
          const active = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          return (
            <div
              key={item.path}
              onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false) }}
              title={collapsed && !isMobile ? item.label : undefined}
              style={{
                display:'flex', alignItems:'center',
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                gap:10,
                padding: collapsed && !isMobile ? '10px 0' : '9px 12px',
                borderRadius:10, marginBottom:2, cursor:'pointer',
                fontSize:13, fontWeight: active ? 600 : 400,
                color: active ? 'white' : 'rgba(255,255,255,0.42)',
                background: active ? 'rgba(100,87,249,0.18)' : 'transparent',
                border: active ? '1px solid rgba(100,87,249,0.28)' : '1px solid transparent',
                transition:'all 0.15s',
                userSelect:'none',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background='transparent' }}
            >
              <span style={{ fontSize:15, flexShrink:0, width:18, textAlign:'center' }}>{item.icon}</span>
              {(!collapsed || isMobile) && (
                <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</span>
              )}
            </div>
          )
        })}
      </nav>

      {/* ── Upgrade banner ── */}
      {(!collapsed || isMobile) && (
        <div style={{
          background:'rgba(100,87,249,0.08)', borderRadius:12, padding:'12px 14px',
          marginBottom:10, border:'1px solid rgba(100,87,249,0.18)', flexShrink:0,
        }}>
          <div style={{ fontSize:11.5, fontWeight:600, color:'#a89fff', marginBottom:3 }}>⭐ Upgrade to Pro</div>
          <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.38)', lineHeight:1.5 }}>
            Unlock advanced features and more meeting insights.
          </div>
        </div>
      )}

      {/* ── User row ── */}
      <div
        onClick={() => { navigate('/profile'); if (isMobile) setMobileOpen(false) }}
        style={{
          display:'flex', alignItems:'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          gap:9, padding:'9px 8px',
          borderTop:'1px solid rgba(255,255,255,0.06)',
          cursor:'pointer', borderRadius:10, transition:'all 0.15s', flexShrink:0,
        }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.05)'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background='transparent'}
        title={collapsed && !isMobile ? 'Profile' : undefined}
      >
        <div style={{
          width:30, height:30, borderRadius:'50%',
          background:'linear-gradient(135deg,#6457F9,#8B7FF7)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:11.5, color:'white', fontWeight:700, flexShrink:0,
          boxShadow:'0 2px 8px rgba(100,87,249,0.35)',
        }}>
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        {(!collapsed || isMobile) && (
          <div style={{ overflow:'hidden', flex:1 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {user?.email?.split('@')[0] || 'User'}
            </div>
            <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.38)' }}>View profile →</div>
          </div>
        )}
      </div>
    </div>
  )

  /* ── Mobile ── */
  if (isMobile) {
    return (
      <>
        <button onClick={() => setMobileOpen(true)} style={{
          position:'fixed', top:14, left:14, zIndex:300,
          background:'rgba(100,87,249,0.9)', border:'none', color:'white',
          width:38, height:38, borderRadius:10, cursor:'pointer',
          fontSize:17, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 16px rgba(100,87,249,0.4)',
        }}>☰</button>

        {mobileOpen && (
          <div style={{ position:'fixed', inset:0, zIndex:299 }}>
            <div onClick={() => setMobileOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)' }} />
            <div style={{ position:'absolute', left:0, top:0, bottom:0 }}>
              <SidebarContent />
            </div>
          </div>
        )}
      </>
    )
  }

  /* ── Desktop: fixed position so it never scrolls with content ── */
  return (
    <>
      {/* Fixed sidebar */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: w,
        zIndex: 100,
        transition: 'width 0.25s ease',
      }}>
        <SidebarContent />
      </div>
      {/* Spacer so main content doesn't hide behind the fixed sidebar */}
      <div style={{ width: w, flexShrink: 0, transition: 'width 0.25s ease' }} />
    </>
  )
}