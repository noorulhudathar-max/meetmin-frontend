import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import StarCanvas from '../components/StarCanvas'
import FAQ from './FAQ'

type Page = 'login' | 'faq'

/* ── Google Icon ── */
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

/* ── Navbar ── */
function Nav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <div style={{
      position:'fixed', top:0, left:0, right:0, zIndex:200,
      height:64, display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 16px',
      background:'rgba(11,11,18,0.82)',
      backdropFilter:'blur(24px) saturate(1.8)',
      borderBottom:'1px solid rgba(100,87,249,0.18)',
      boxShadow:'0 1px 40px rgba(0,0,0,0.45)',
      boxSizing:'border-box',
    }}>
      {/* Brand */}
      <button onClick={() => setPage('login')}
        style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0, flexShrink:0 }}>
        <div style={{
          width:32, height:32, borderRadius:9,
          background:'linear-gradient(135deg,#6457F9,#9B8EFF)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
          boxShadow:'0 0 16px rgba(100,87,249,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          flexShrink:0,
        }}>N</div>
        <span style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:15, color:'var(--text)', letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>
          <span style={{ background:'linear-gradient(90deg,#8B7FF7,#c4b8ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Notivo AI</span>
        </span>
      </button>

      {/* Status pill — hidden on very small screens */}
      <div className="status-pill" style={{
        display:'flex', alignItems:'center', gap:6,
        background:'rgba(100,87,249,0.09)', border:'1px solid rgba(100,87,249,0.2)',
        borderRadius:100, padding:'5px 12px',
        fontSize:10, fontWeight:600, color:'rgba(210,205,255,0.8)',
        letterSpacing:'0.06em', textTransform:'uppercase' as const,
        whiteSpace:'nowrap' as const,
      }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:'#6dffb3', display:'inline-block', boxShadow:'0 0 5px #6dffb3', animation:'pulse 2s infinite', flexShrink:0 }} />
        All systems operational
      </div>

      {/* Links */}
      <div style={{ display:'flex', gap:4, flexShrink:0 }}>
        {(['login','faq'] as Page[]).map(p => (
          <button key={p} onClick={() => setPage(p)} style={{
            padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600,
            fontFamily:'var(--font-body)', cursor:'pointer', border:'none',
            background: page===p ? 'rgba(100,87,249,0.2)' : 'transparent',
            color: page===p ? '#c4b8ff' : 'rgba(200,195,255,0.65)',
            boxShadow: page===p ? 'inset 0 0 0 1px rgba(100,87,249,0.35)' : 'none',
            transition:'all 0.2s', letterSpacing:'0.01em',
          }}>
            {p === 'login' ? 'Sign In' : 'FAQ'}
          </button>
        ))}
      </div>

      <style>{`
        @media (max-width: 520px) {
          .status-pill { display: none !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Orbs ── */
function Orbs() {
  const b: React.CSSProperties = { position:'fixed', borderRadius:'50%', filter:'blur(70px)', pointerEvents:'none', zIndex:0 }
  return (
    <>
      <div style={{ ...b, width:300, height:300, background:'rgba(100,87,249,0.15)', top:-80, right:-80, animation:'drift 20s ease-in-out infinite alternate' }} />
      <div style={{ ...b, width:220, height:220, background:'rgba(139,127,247,0.10)', bottom:-60, left:-60, animation:'drift 17s ease-in-out infinite alternate', animationDelay:'-7s' }} />
      <div style={{ ...b, width:160, height:160, background:'rgba(80,200,255,0.06)', top:'42%', left:'33%', animation:'drift 22s ease-in-out infinite alternate', animationDelay:'-13s' }} />
    </>
  )
}

/* ── Ambient cards — hidden on mobile ── */
function AmbientCards() {
  const s = (ex: React.CSSProperties): React.CSSProperties => ({
    position:'absolute',
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
    borderRadius:14, padding:'14px 16px', backdropFilter:'blur(12px)',
    minWidth:180, maxWidth:220, ...ex,
  })
  const row = (t: string) => (
    <div key={t} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
      <div style={{ width:15, height:15, borderRadius:4, background:'rgba(100,87,249,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:7, color:'#c4b8ff', flexShrink:0 }}>✓</div>
      <span style={{ fontSize:10, color:'rgba(220,215,255,0.6)' }}>{t}</span>
    </div>
  )
  const ttl = (t: string) => <div style={{ fontSize:10, fontWeight:700, color:'rgba(220,215,255,0.75)', marginBottom:8, fontFamily:'var(--font-head)' }}>{t}</div>
  return (
    <>
      <style>{`
        @media (max-width: 900px) { .ambient-cards-wrap { display: none !important; } }
      `}</style>
      <div className="ambient-cards-wrap" style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1, overflow:'hidden' }}>
        <div style={s({ top:'17%', left:'3%', animation:'floatCard 16s ease-in-out infinite alternate' })}>
          {ttl('📋 Sprint Planning · 32 min')} {row('Summary generated')} {row('5 action items extracted')} {row('Sent to Slack')}
        </div>
        <div style={s({ top:'54%', right:'2.5%', animation:'floatCard 13s ease-in-out infinite alternate', animationDelay:'-5s' })}>
          {ttl('🤖 AI Analysis Complete')} {row('Decisions captured')} {row('Deadlines assigned')}
        </div>
        <div style={s({ bottom:'13%', left:'4%', animation:'floatCard 18s ease-in-out infinite alternate', animationDelay:'-9s' })}>
          {ttl('⚡ 32h saved this month')} {row('128 meetings processed')} {row('96 minutes generated')}
        </div>
      </div>
    </>
  )
}

/* ── Field ── */
function Field({ label, type, placeholder, value, onChange }: {
  label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(200,195,255,0.75)', marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase' as const }}>
        {label}
      </label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:'100%', padding:'13px 15px', borderRadius:10,
          background: focused ? 'rgba(100,87,249,0.12)' : 'rgba(255,255,255,0.07)',
          border:`1px solid ${focused ? 'rgba(100,87,249,0.6)' : 'rgba(255,255,255,0.13)'}`,
          color:'rgba(240,238,255,0.95)', fontSize:14, fontFamily:'var(--font-body)',
          outline:'none',
          boxShadow: focused ? '0 0 0 3px rgba(100,87,249,0.13)' : 'none',
          transition:'all 0.2s',
          boxSizing:'border-box' as const,
        }}
      />
    </div>
  )
}

/* ── Login Card ── */
function LoginCard({ onGoFaq }: { onGoFaq: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [message, setMessage]   = useState('')
  const [flipping, setFlipping] = useState(false)

  const toggleMode = () => {
    setFlipping(true)
    setTimeout(() => { setIsSignUp(v => !v); setError(''); setMessage(''); setFlipping(false) }, 270)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('✓ Check your email to confirm!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:`${window.location.origin}/dashboard` } })
  }

  return (
    <div style={{
      width:'100%', maxWidth:420,
      background:'rgba(255,255,255,0.05)',
      backdropFilter:'blur(40px) saturate(1.6)',
      border:'1px solid rgba(255,255,255,0.12)',
      borderRadius:22, padding:'28px 24px',
      boxShadow:'0 0 0 1px rgba(100,87,249,0.12), 0 28px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      animation: flipping ? 'cardFlip 0.28s ease both' : 'floatIn 0.75s cubic-bezier(0.16,1,0.3,1) both',
      transition:'box-shadow 0.3s',
      boxSizing:'border-box' as const,
    }}>
      {/* Brand */}
      <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:18 }}>
        <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#6457F9,#9B8EFF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, boxShadow:'0 3px 12px rgba(100,87,249,0.4)', flexShrink:0 }}>📋</div>
        <span style={{ fontFamily:'var(--font-head)', fontSize:14, fontWeight:700, color:'rgba(240,238,255,0.95)' }}>
          <span style={{ background:'linear-gradient(90deg,#8B7FF7,#c4b8ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}> Notivo AI</span>
        </span>
      </div>

      <h1 style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:700, marginBottom:5, color:'rgba(245,243,255,0.97)', margin:'0 0 5px' }}>
        {isSignUp ? 'Create account' : 'Welcome back'}
      </h1>
      <p style={{ fontSize:13, color:'rgba(190,185,255,0.75)', marginBottom:20, lineHeight:1.55, margin:'5px 0 20px' }}>
        {isSignUp ? 'Join thousands saving hours every week.' : 'Sign in — your minutes are waiting.'}
      </p>

      {error && <div style={{ background:'rgba(255,80,80,0.12)', border:'1px solid rgba(255,80,80,0.28)', color:'#ff9999', borderRadius:9, padding:'10px 13px', fontSize:13, marginBottom:14 }}>{error}</div>}
      {message && <div style={{ background:'rgba(60,200,120,0.12)', border:'1px solid rgba(60,200,120,0.28)', color:'#70e0a0', borderRadius:9, padding:'10px 13px', fontSize:13, marginBottom:14 }}>{message}</div>}

      <form onSubmit={handleSubmit}>
        <Field label="Email address" type="email"    placeholder="you@company.com" value={email}    onChange={setEmail} />
        <Field label="Password"      type="password" placeholder="••••••••"        value={password} onChange={setPassword} />

        {!isSignUp && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, marginTop:4, flexWrap:'wrap', gap:8 }}>
            <label style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'rgba(190,185,255,0.72)', cursor:'pointer' }}>
              <input type="checkbox" style={{ accentColor:'var(--purple)' }} /> Remember me
            </label>
            <a href="#" style={{ fontSize:12, color:'#a89fff', textDecoration:'none', fontWeight:600 }}>Forgot password?</a>
          </div>
        )}
        {isSignUp && <div style={{ marginBottom:16 }} />}

        <button type="submit" disabled={loading} style={{
          width:'100%', padding:'12px', borderRadius:11,
          background:'linear-gradient(135deg,#6457F9,#8B7FF7)',
          color:'white', border:'none', fontSize:14, fontWeight:700,
          fontFamily:'var(--font-body)', cursor:loading?'not-allowed':'pointer',
          marginBottom:10, opacity:loading?0.7:1,
          boxShadow:'0 4px 18px rgba(100,87,249,0.45)',
          transition:'all 0.22s',
        }}>
          {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:11, color:'rgba(200,195,255,0.35)', marginBottom:10 }}>
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }} />or
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }} />
      </div>

      <button onClick={handleGoogle} style={{
        width:'100%', padding:'11px', borderRadius:11,
        background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
        color:'rgba(235,232,255,0.9)', fontSize:13, fontWeight:600, fontFamily:'var(--font-body)',
        display:'flex', alignItems:'center', justifyContent:'center', gap:9,
        cursor:'pointer', marginBottom:16, transition:'all 0.2s',
      }}>
        <GoogleIcon /> Continue with Google
      </button>

      <p style={{ textAlign:'center', fontSize:12, color:'rgba(190,185,255,0.65)', margin:'0 0 10px' }}>
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <span onClick={toggleMode} style={{ color:'#a89fff', cursor:'pointer', fontWeight:700 }}>
          {isSignUp ? 'Sign in' : 'Sign up free'}
        </span>
      </p>

      <p style={{ textAlign:'center', fontSize:11, color:'rgba(190,185,255,0.45)', margin:0 }}>
        Have questions?{' '}
        <span onClick={onGoFaq} style={{ color:'#a89fff', cursor:'pointer', opacity:0.85 }}>Visit our FAQ →</span>
      </p>
    </div>
  )
}

/* ── Info Pills ── */
function InfoPills({ onGoFaq }: { onGoFaq: () => void }) {
  const pills = ['No credit card required', 'Free tier available', 'Cancel anytime']
  return (
    <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:12, flexWrap:'wrap', maxWidth:420, padding:'0 8px', boxSizing:'border-box' }}>
      {pills.map((p, i) => (
        <div key={p} style={{
          display:'flex', alignItems:'center', gap:5,
          background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:100, padding:'5px 12px', fontSize:10, color:'rgba(200,195,255,0.72)',
          animation:'floatIn 0.7s ease both', animationDelay:`${0.2+i*0.08}s`,
        }}>
          <div style={{ width:4, height:4, borderRadius:'50%', background:'#a89fff', animation:'pulse 2s infinite', flexShrink:0 }} />
          {p}
        </div>
      ))}
    </div>
  )
}

/* ── ROOT ── */
export default function Login() {
  const [page, setPage] = useState<Page>('login')

  return (
    <div style={{ width:'100vw', height:'100vh', overflow:'hidden', position:'relative' }}>
      <StarCanvas />
      <Orbs />
      <Nav page={page} setPage={setPage} />

      {page === 'login' && (
        <>
          <AmbientCards />
          <div style={{
            position:'absolute', inset:0, zIndex:2,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            paddingTop:72, paddingLeft:16, paddingRight:16,
            paddingBottom:12,
            overflowY:'auto',
            boxSizing:'border-box',
          }}>
            <LoginCard onGoFaq={() => setPage('faq')} />
            <InfoPills onGoFaq={() => setPage('faq')} />
          </div>
        </>
      )}

      {page === 'faq' && (
        <div className="faq-scroll" style={{ position:'absolute', inset:0, paddingTop:64, overflowY:'auto', zIndex:2 }}>
          <FAQ onGoLogin={() => setPage('login')} />
        </div>
      )}
    </div>
  )
}