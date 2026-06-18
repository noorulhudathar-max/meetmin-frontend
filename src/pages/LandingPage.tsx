
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Tilt card hook ──────────────────────────────────────────────────────────
function useTilt(strength = 15) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(800px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale(1.03)`
    }
    const onLeave = () => { el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)' }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [strength])
  return ref
}

// ── Feature card ────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, delay }: {
  icon: string; title: string; desc: string; color: string; delay: number
}) {
  const ref = useTilt(12)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div ref={ref} style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 24, padding: 'clamp(20px, 3vw, 32px) clamp(16px, 2.5vw, 28px)',
      transition: 'transform 0.15s ease, opacity 0.6s ease, box-shadow 0.3s ease',
      cursor: 'default', position: 'relative', overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transform: visible ? 'perspective(800px) translateY(0)' : 'perspective(800px) translateY(30px)',
      willChange: 'transform', backdropFilter: 'blur(20px)',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = `0 30px 60px ${color}20, 0 0 0 1px ${color}30`; el.style.borderColor = `${color}40` }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.borderColor = 'rgba(255,255,255,0.08)' }}
    >
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: color, opacity: 0.08, filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ width: 52, height: 52, borderRadius: 16, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{icon}</div>
      <h3 style={{ margin: '0 0 10px', fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 'clamp(12px, 1.5vw, 14px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{desc}</p>
    </div>
  )
}

// ── Step card ───────────────────────────────────────────────────────────────
function StepCard({ num, title, desc, color, delay }: {
  num: string; title: string; desc: string; color: string; delay: number
}) {
  const ref = useTilt(8)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div ref={ref} style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20, padding: 'clamp(18px, 3vw, 28px) clamp(14px, 2vw, 24px)',
      transition: 'transform 0.15s ease, opacity 0.6s ease',
      opacity: visible ? 1 : 0, willChange: 'transform',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color, marginBottom: 16 }}>{num}</div>
      <h4 style={{ margin: '0 0 8px', fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: 700, color: 'white' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: 'clamp(12px, 1.5vw, 13.5px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{desc}</p>
    </div>
  )
}

// ── Testimonial card ────────────────────────────────────────────────────────
function TestimonialCard({ name, role, company, text, avatar, delay }: {
  name: string; role: string; company: string; text: string; avatar: string; delay: number
}) {
  const ref = useTilt(8)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div ref={ref} style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: 'clamp(18px, 3vw, 28px)',
      transition: 'transform 0.15s ease, opacity 0.6s ease',
      opacity: visible ? 1 : 0, willChange: 'transform',
    }}>
      <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
        {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: 13 }}>★</span>)}
      </div>
      <p style={{ margin: '0 0 18px', fontSize: 'clamp(12px, 1.5vw, 14px)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontStyle: 'italic' }}>"{text}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#6457F9,#8B7FF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{avatar}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{role}, {company}</div>
        </div>
      </div>
    </div>
  )
}

// ── Stat counter ─────────────────────────────────────────────────────────────
function StatItem({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      let start = 0
      const step = value / 60
      const timer = setInterval(() => {
        start += step
        if (start >= value) { setCount(value); clearInterval(timer) }
        else setCount(Math.floor(start))
      }, 16)
      obs.disconnect()
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [value])
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: 'white', letterSpacing: -2, lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: 'rgba(255,255,255,0.45)', marginTop: 8, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function SectionTag({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <div style={{ display: 'inline-block', background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: '5px 16px', fontSize: 11, fontWeight: 700, color, marginBottom: 16, letterSpacing: '0.06em' }}>{label}</div>
  )
}

// ── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const [heroVisible, setHeroVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mouseRef = useRef({ x: 0, y: 0 })
  const cursorPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t) }, [])

  // Custom cursor — desktop only
  useEffect(() => {
    const cursor = cursorRef.current; const dot = cursorDotRef.current
    let animId: number
    const moveCursor = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      if (dot) { dot.style.left = `${e.clientX}px`; dot.style.top = `${e.clientY}px` }
    }
    const animateCursor = () => {
      if (cursor) {
        cursorPosRef.current.x += (mouseRef.current.x - cursorPosRef.current.x) * 0.12
        cursorPosRef.current.y += (mouseRef.current.y - cursorPosRef.current.y) * 0.12
        cursor.style.left = `${cursorPosRef.current.x}px`; cursor.style.top = `${cursorPosRef.current.y}px`
      }
      animId = requestAnimationFrame(animateCursor)
    }
    window.addEventListener('mousemove', moveCursor); animateCursor()
    return () => { window.removeEventListener('mousemove', moveCursor); cancelAnimationFrame(animId) }
  }, [])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const particles: { x:number;y:number;vx:number;vy:number;r:number;o:number;pulse:number;pulseSpeed:number }[] = []
    for (let i = 0; i < 100; i++) {
      particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx:(Math.random()-0.5)*0.25, vy:(Math.random()-0.5)*0.25, r:Math.random()*2+0.5, o:Math.random()*0.5+0.1, pulse:Math.random()*Math.PI*2, pulseSpeed:Math.random()*0.02+0.005 })
    }
    let animId: number
    const mouse = { x: -1000, y: -1000 }
    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    window.addEventListener('mousemove', onMouseMove)
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.pulse += p.pulseSpeed
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.sqrt(dx*dx+dy*dy)
        if (dist < 100) { p.x += dx/dist*1.5; p.y += dy/dist*1.5 }
        const opacity = p.o*(0.7+0.3*Math.sin(p.pulse))
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(139,127,247,${opacity})`; ctx.fill()
        particles.slice(i+1, i+8).forEach(q => {
          const d = Math.hypot(p.x-q.x, p.y-q.y)
          if (d < 100) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = `rgba(100,87,249,${0.12*(1-d/100)})`; ctx.lineWidth = 0.5; ctx.stroke() }
        })
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMouseMove) }
  }, [])

  const features = [
    { icon:'🎙', title:'AI Transcription',  desc:'Upload any audio or video file. Our AI transcribes it with 99% accuracy in seconds using Groq Whisper.', color:'#6457F9', delay:400 },
    { icon:'📋', title:'Smart Minutes',     desc:'LLaMA AI automatically extracts summaries, key decisions, and action items from your transcript.',          color:'#8B7FF7', delay:500 },
    { icon:'🌍', title:'Multi-Language',    desc:'Supports Urdu, Hindi, Arabic, English and more. Translate transcripts to Roman Urdu instantly.',            color:'#22c55e', delay:600 },
    { icon:'📊', title:'AI Analytics',      desc:'Ask questions about your meetings. Get charts, graphs, and insights powered by AI assistant.',              color:'#f59e0b', delay:700 },
    { icon:'✅', title:'Task Tracker',      desc:'Auto-extracted action items with assignees and deadlines. Track completion with progress bars.',             color:'#3b82f6', delay:800 },
    { icon:'🔒', title:'Secure & Private',  desc:'Enterprise-grade security with Supabase RLS. Your meeting data is fully encrypted and stays yours.',       color:'#ec4899', delay:900 },
  ]

  const steps = [
    { num:'01', title:'Upload your meeting',  desc:'Drag and drop any audio or video file. We support MP3, MP4, WAV, M4A up to 500MB.',             color:'#6457F9', delay:300 },
    { num:'02', title:'AI transcribes it',    desc:'Groq Whisper AI transcribes your meeting in seconds with support for 50+ languages.',            color:'#8B7FF7', delay:400 },
    { num:'03', title:'Minutes generated',    desc:'LLaMA AI reads the transcript and extracts summary, decisions, and action items automatically.', color:'#22c55e', delay:500 },
    { num:'04', title:'Share & act',          desc:'View minutes, assign tasks, chat with AI about your meeting, and track team progress.',          color:'#f59e0b', delay:600 },
  ]

  const testimonials = [
    { name:'Ahmad Raza',  role:'Product Manager', company:'TechPk',    text:'Notivo AI saves us 2 hours per week. The Urdu transcription is incredibly accurate for our local meetings.', avatar:'AR', delay:300 },
    { name:'Sara Khan',   role:'CEO',             company:'StartupHub', text:'The AI-generated action items are spot on. Our team never misses a follow-up anymore.',                      avatar:'SK', delay:400 },
    { name:'Usman Ali',   role:'Project Lead',    company:'DevHouse',   text:'The chart feature in the AI Assistant is amazing. We can visualize meeting data instantly.',                 avatar:'UA', delay:500 },
  ]

  const aboutPoints = [
    { icon:'🇵🇰', title:'Built for Pakistan', desc:'Designed from the ground up for Pakistani teams who hold meetings in Urdu, English, or a mix of both.' },
    { icon:'⚡', title:'Lightning Fast',       desc:"Powered by Groq — the fastest AI inference on the planet. Transcription in seconds, not minutes." },
    { icon:'🧠', title:'LLaMA Intelligence',   desc:"Meta's LLaMA 3.3 generates meeting summaries and action items with human-level understanding." },
    { icon:'🛡', title:'Privacy First',        desc:'Your recordings are processed securely. We never train on your data and you can delete everything anytime.' },
  ]

  const sec = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: 'clamp(48px,8vw,120px) clamp(16px,5vw,80px)',
    position: 'relative', zIndex: 1, ...extra,
  })

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #05050f 0%, #0a0518 40%, #050a18 100%)', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden', cursor: 'none' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #05050f; }
        ::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.4); border-radius: 3px; }
        @media (max-width: 640px) {
          body { cursor: auto !important; }
          .landing-cursor, .landing-cursor-dot { display: none !important; }
          .desktop-nav-links { display: none !important; }
        }
        @media (min-width: 641px) {
          .mobile-hamburger { display: none !important; }
          .mobile-menu { display: none !important; }
        }
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; }
          .hero-preview { display: none !important; }
        }
        @media (max-width: 480px) {
          .hero-social-proof { flex-direction: column !important; align-items: center !important; }
          .flow-connector { flex-wrap: wrap !important; justify-content: center !important; }
          .stat-mini-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* Custom cursor */}
      <div className="landing-cursor" ref={cursorRef} style={{ position:'fixed', width:36, height:36, borderRadius:'50%', background:'rgba(139,127,247,0.15)', border:'1px solid rgba(139,127,247,0.4)', pointerEvents:'none', zIndex:9999, transform:'translate(-50%,-50%)', transition:'transform 0.3s ease', left:0, top:0 }} />
      <div className="landing-cursor-dot" ref={cursorDotRef} style={{ position:'fixed', width:6, height:6, borderRadius:'50%', background:'#8B7FF7', pointerEvents:'none', zIndex:9999, transform:'translate(-50%,-50%)', left:0, top:0 }} />

      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', top:-300, left:-200, width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle,rgba(100,87,249,0.12) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:-200, right:-200, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,127,247,0.08) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      {/* ── NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'0 clamp(16px,5vw,80px)', background:'rgba(5,5,15,0.7)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)', height:70, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', flexShrink:0 }} onClick={() => navigate('/')}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6457F9,#8B7FF7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'white', flexShrink:0 }}>N</div>
          <span style={{ fontSize:'clamp(15px,2vw,18px)', fontWeight:800, color:'white', letterSpacing:'-0.3px', whiteSpace:'nowrap' }}>
            Notivo <span style={{ color:'#8B7FF7' }}>AI</span>
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="desktop-nav-links" style={{ display:'flex', gap:28, alignItems:'center' }}>
          {[['Features','#features'],['How it Works','#how-it-works'],['About','#about']].map(([label, href]) => (
            <a key={label} href={href} style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:14, fontWeight:500, transition:'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color='white')}
              onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.6)')}
            >{label}</a>
          ))}
        </div>

        {/* Desktop CTA buttons */}
        <div className="desktop-nav-links" style={{ display:'flex', gap:10, flexShrink:0 }}>
          <button onClick={() => navigate('/login')} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>Sign in</button>
          <button onClick={() => navigate('/login')} style={{ background:'linear-gradient(135deg,#6457F9,#8B7FF7)', border:'none', color:'white', padding:'8px 18px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(100,87,249,0.4)', transition:'all 0.2s', whiteSpace:'nowrap' }}>Get Started →</button>
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(v => !v)} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'white', width:40, height:40, borderRadius:10, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{ position:'fixed', top:70, left:0, right:0, zIndex:99, background:'rgba(5,5,15,0.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'16px', display:'flex', flexDirection:'column', gap:8 }}>
          {[['Features','#features'],['How it Works','#how-it-works'],['About','#about']].map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMobileMenuOpen(false)} style={{ color:'rgba(255,255,255,0.8)', textDecoration:'none', fontSize:15, fontWeight:500, padding:'10px 12px', borderRadius:8, display:'block' }}>{label}</a>
          ))}
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button onClick={() => { navigate('/login'); setMobileMenuOpen(false) }} style={{ flex:1, background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'white', padding:'10px', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>Sign in</button>
            <button onClick={() => { navigate('/login'); setMobileMenuOpen(false) }} style={{ flex:1, background:'linear-gradient(135deg,#6457F9,#8B7FF7)', border:'none', color:'white', padding:'10px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>Get Started →</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(90px,15vh,160px) clamp(16px,5vw,80px) 60px', position:'relative', zIndex:1, textAlign:'center' }}>
        <div style={{ maxWidth:860, margin:'0 auto', width:'100%' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(100,87,249,0.12)', border:'1px solid rgba(100,87,249,0.3)', borderRadius:30, padding:'5px 16px 5px 8px', marginBottom:24, opacity:heroVisible?1:0, transform:heroVisible?'translateY(0)':'translateY(-20px)', transition:'all 0.6s ease', flexWrap:'wrap', justifyContent:'center' }}>
            <span style={{ background:'#6457F9', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:700, color:'white', flexShrink:0 }}>NEW</span>
            <span style={{ fontSize:'clamp(11px,2vw,13px)', color:'rgba(255,255,255,0.7)', fontWeight:500 }}>AI-powered meeting minutes for Pakistani teams</span>
          </div>

          <h1 style={{ fontSize:'clamp(30px,7vw,76px)', fontWeight:900, color:'white', margin:'0 0 20px', lineHeight:1.05, letterSpacing:'clamp(-1px,-0.03em,-4px)', opacity:heroVisible?1:0, transform:heroVisible?'translateY(0)':'translateY(30px)', transition:'all 0.7s ease 0.1s' }}>
            Turn Meetings Into<br />
            <span style={{ background:'linear-gradient(135deg,#6457F9,#a78bfa,#8B7FF7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Actionable Minutes</span><br />
            with AI ✨
          </h1>

          <p style={{ fontSize:'clamp(13px,2vw,18px)', color:'rgba(255,255,255,0.55)', margin:'0 auto 32px', lineHeight:1.7, maxWidth:600, opacity:heroVisible?1:0, transform:heroVisible?'translateY(0)':'translateY(20px)', transition:'all 0.7s ease 0.2s' }}>
            Upload your meeting audio in Urdu, English or any language. Our AI transcribes, summarizes, and extracts action items in seconds.
          </p>

          <div style={{ opacity:heroVisible?1:0, transform:heroVisible?'translateY(0)':'translateY(20px)', transition:'all 0.7s ease 0.3s' }}>
            <button onClick={() => navigate('/login')} style={{ background:'linear-gradient(135deg,#6457F9,#8B7FF7)', border:'none', color:'white', padding:'clamp(12px,2vw,16px) clamp(28px,4vw,48px)', borderRadius:14, fontSize:'clamp(14px,2vw,17px)', fontWeight:800, cursor:'pointer', boxShadow:'0 8px 32px rgba(100,87,249,0.5)', transition:'all 0.2s', letterSpacing:'-0.3px' }}>
              Get Started Free →
            </button>
          </div>

          <div className="hero-social-proof" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginTop:28, flexWrap:'wrap', opacity:heroVisible?1:0, transition:'all 0.7s ease 0.4s' }}>
            <div style={{ display:'flex' }}>
              {['#6457F9','#8B7FF7','#22c55e','#f59e0b','#3b82f6'].map((c,i) => (
                <div key={i} style={{ width:28, height:28, borderRadius:'50%', background:c, border:'2px solid #05050f', marginLeft:i>0?-7:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white', fontWeight:700 }}>
                  {['A','S','U','F','R'][i]}
                </div>
              ))}
            </div>
            <span style={{ fontSize:'clamp(11px,1.5vw,13.5px)', color:'rgba(255,255,255,0.5)' }}><strong style={{ color:'white' }}>500+</strong> teams using Notivo AI</span>
            <div style={{ display:'flex', gap:2 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color:'#f59e0b', fontSize:13 }}>★</span>)}</div>
          </div>

          {/* Dashboard preview */}
          <div className="hero-preview" style={{ marginTop:52, position:'relative', opacity:heroVisible?1:0, transform:heroVisible?'translateY(0) perspective(1000px) rotateX(0deg)':'translateY(40px) perspective(1000px) rotateX(8deg)', transition:'all 1s ease 0.5s' }}>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'clamp(12px,2vw,20px)', boxShadow:'0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(100,87,249,0.1)', backdropFilter:'blur(20px)' }}>
              <div className="stat-mini-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'clamp(8px,1.5vw,16px)', marginBottom:14 }}>
                {[{label:'Total Meetings',val:'128',color:'#6457F9'},{label:'Minutes Generated',val:'96',color:'#22c55e'},{label:'Hours Saved',val:'32h',color:'#f59e0b'},{label:'Action Items',val:'47',color:'#3b82f6'}].map(s => (
                  <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'clamp(10px,1.5vw,14px)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize:'clamp(9px,1vw,11px)', color:'rgba(255,255,255,0.4)', marginBottom:4 }}>{s.label}</div>
                    <div style={{ fontSize:'clamp(16px,2.5vw,22px)', fontWeight:800, color:'white' }}>{s.val}</div>
                    <div style={{ fontSize:10, color:s.color, marginTop:3 }}>↑ +18%</div>
                  </div>
                ))}
              </div>
              <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:10, padding:'clamp(10px,1.5vw,16px)', border:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:10, fontWeight:600 }}>RECENT MEETINGS</div>
                {['Product Roadmap Discussion','Marketing Strategy Sync','Weekly Team Standup'].map((m,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:i<2?'1px solid rgba(255,255,255,0.04)':'none', gap:8 }}>
                    <span style={{ fontSize:'clamp(11px,1.5vw,13px)', color:'rgba(255,255,255,0.7)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m}</span>
                    <span style={{ fontSize:10, background:'rgba(34,197,94,0.15)', color:'#22c55e', padding:'2px 8px', borderRadius:20, fontWeight:600, flexShrink:0 }}>Done</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ ...sec(), borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'clamp(20px,4vw,60px)' }}>
          <StatItem value={500} suffix="+" label="Teams using Notivo" />
          <StatItem value={10000} suffix="+" label="Meetings processed" />
          <StatItem value={99} suffix="%" label="Transcription accuracy" />
          <StatItem value={50} suffix="+" label="Languages supported" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={sec()}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'clamp(32px,6vw,72px)' }}>
            <SectionTag label="FEATURES" color="#a5b4fc" bg="rgba(100,87,249,0.12)" border="rgba(100,87,249,0.25)" />
            <h2 style={{ fontSize:'clamp(24px,4vw,48px)', fontWeight:800, color:'white', margin:'0 0 14px', letterSpacing:-1 }}>Everything you need for<br />smarter meetings</h2>
            <p style={{ fontSize:'clamp(13px,1.5vw,16px)', color:'rgba(255,255,255,0.45)', margin:'0 auto', maxWidth:500 }}>Built specifically for Pakistani and South Asian teams who meet in multiple languages.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'clamp(12px,2vw,20px)' }}>
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ ...sec(), background:'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'clamp(32px,6vw,72px)' }}>
            <SectionTag label="HOW IT WORKS" color="#4ade80" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.25)" />
            <h2 style={{ fontSize:'clamp(24px,4vw,48px)', fontWeight:800, color:'white', margin:'0 0 14px', letterSpacing:-1 }}>From upload to minutes<br />in 4 simple steps</h2>
            <p style={{ fontSize:'clamp(13px,1.5vw,16px)', color:'rgba(255,255,255,0.45)', margin:'0 auto', maxWidth:480 }}>No setup required. Upload and get your meeting minutes in under a minute.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'clamp(10px,2vw,16px)', marginBottom:48 }}>
            {steps.map(s => <StepCard key={s.num} {...s} />)}
          </div>
          <div className="flow-connector" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(100,87,249,0.15)', borderRadius:20, padding:'clamp(16px,3vw,28px) clamp(16px,3vw,32px)', display:'flex', alignItems:'center', justifyContent:'center', gap:'clamp(6px,2vw,24px)', flexWrap:'wrap' }}>
            {[{label:'Your Audio',icon:'🎙',color:'#6457F9'},{label:'→',icon:'',color:'rgba(255,255,255,0.2)'},{label:'Transcription',icon:'📝',color:'#8B7FF7'},{label:'→',icon:'',color:'rgba(255,255,255,0.2)'},{label:'AI Summary',icon:'🧠',color:'#22c55e'},{label:'→',icon:'',color:'rgba(255,255,255,0.2)'},{label:'Action Items',icon:'✅',color:'#f59e0b'}].map((item,i) => (
              item.icon ? (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`${item.color}18`, border:`1px solid ${item.color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{item.icon}</div>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:600, textAlign:'center' }}>{item.label}</span>
                </div>
              ) : <span key={i} style={{ fontSize:20, color:'rgba(255,255,255,0.2)', fontWeight:300 }}>→</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={sec()}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'clamp(32px,6vw,72px)' }}>
            <SectionTag label="TESTIMONIALS" color="#f9a8d4" bg="rgba(236,72,153,0.1)" border="rgba(236,72,153,0.25)" />
            <h2 style={{ fontSize:'clamp(24px,4vw,48px)', fontWeight:800, color:'white', margin:'0 0 14px', letterSpacing:-1 }}>Loved by teams across Pakistan</h2>
            <p style={{ fontSize:'clamp(13px,1.5vw,16px)', color:'rgba(255,255,255,0.45)', margin:'0 auto', maxWidth:440 }}>Real teams. Real time saved. Real results.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'clamp(12px,2vw,20px)' }}>
            {testimonials.map(t => <TestimonialCard key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ ...sec(), background:'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div className="about-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(24px,5vw,80px)', alignItems:'center' }}>
            <div>
              <SectionTag label="ABOUT" color="#a5b4fc" bg="rgba(100,87,249,0.12)" border="rgba(100,87,249,0.25)" />
              <h2 style={{ fontSize:'clamp(22px,4vw,44px)', fontWeight:800, color:'white', margin:'0 0 18px', letterSpacing:-1, lineHeight:1.1 }}>
                We're on a mission to make meetings{' '}
                <span style={{ background:'linear-gradient(135deg,#6457F9,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>actually useful</span>
              </h2>
              <p style={{ fontSize:'clamp(13px,1.5vw,15px)', color:'rgba(255,255,255,0.5)', lineHeight:1.8, margin:'0 0 18px' }}>
                Notivo AI was born out of frustration with endless meetings where nothing gets done. Pakistani teams especially face a unique challenge — meetings happen in Urdu, English, or a mix — and existing tools simply don't understand that.
              </p>
              <p style={{ fontSize:'clamp(13px,1.5vw,15px)', color:'rgba(255,255,255,0.5)', lineHeight:1.8, margin:'0 0 28px' }}>
                We built Notivo AI to be the intelligent meeting assistant that understands your language, your context, and your team — so every meeting becomes a clear set of actions.
              </p>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                <div style={{ textAlign:'center' }}><div style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:'white' }}>2026</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Founded</div></div>
                <div style={{ width:1, background:'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign:'center' }}><div style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:'white' }}>500+</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Teams served</div></div>
                <div style={{ width:1, background:'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign:'center' }}><div style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:'white' }}>🇵🇰</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Made in Pakistan</div></div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {aboutPoints.map((p, i) => (
                <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'clamp(14px,2vw,20px) clamp(14px,2vw,22px)', transition:'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor='rgba(100,87,249,0.3)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,0.07)'}
                >
                  <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:'rgba(100,87,249,0.12)', border:'1px solid rgba(100,87,249,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{p.icon}</div>
                  <div>
                    <div style={{ fontSize:'clamp(13px,1.5vw,15px)', fontWeight:700, color:'white', marginBottom:4 }}>{p.title}</div>
                    <div style={{ fontSize:'clamp(11px,1.2vw,13px)', color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{ ...sec(), textAlign:'center' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <div style={{ background:'linear-gradient(135deg,rgba(100,87,249,0.2),rgba(139,127,247,0.1))', border:'1px solid rgba(100,87,249,0.25)', borderRadius:32, padding:'clamp(32px,6vw,80px) clamp(20px,4vw,60px)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:300, height:300, borderRadius:'50%', background:'rgba(100,87,249,0.15)', filter:'blur(60px)', pointerEvents:'none' }} />
            <h2 style={{ fontSize:'clamp(22px,4vw,48px)', fontWeight:800, color:'white', margin:'0 0 14px', letterSpacing:-1, position:'relative' }}>Ready to transform your meetings?</h2>
            <p style={{ fontSize:'clamp(13px,1.5vw,16px)', color:'rgba(255,255,255,0.55)', margin:'0 0 28px', position:'relative' }}>Join 500+ teams who save hours every week with Notivo AI.<br />Free to start, no credit card required.</p>
            <button onClick={() => navigate('/login')} style={{ background:'linear-gradient(135deg,#6457F9,#8B7FF7)', border:'none', color:'white', padding:'clamp(12px,2vw,18px) clamp(28px,4vw,48px)', borderRadius:14, fontSize:'clamp(14px,2vw,18px)', fontWeight:800, cursor:'pointer', boxShadow:'0 8px 32px rgba(100,87,249,0.5)', transition:'all 0.2s', position:'relative' }}>Get Started Free →</button>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:14, position:'relative' }}>No credit card · Free forever plan · Setup in 2 minutes</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:'clamp(24px,5vw,60px) clamp(16px,5vw,80px)', borderTop:'1px solid rgba(255,255,255,0.06)', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,#6457F9,#8B7FF7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'white' }}>N</div>
            <span style={{ fontSize:15, fontWeight:800, color:'white' }}>Notivo <span style={{ color:'#8B7FF7' }}>AI</span></span>
          </div>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            {['Privacy','Terms','Support','Contact'].map(link => (
              <a key={link} href="#" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:13, transition:'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color='white')}
                onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.4)')}
              >{link}</a>
            ))}
          </div>
          <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.3)' }}>© 2026 Notivo AI. Built for Pakistan 🇵🇰</p>
        </div>
      </footer>
    </div>
  )
}