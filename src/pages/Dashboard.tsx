import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Stats = {
  totalMeetings: number; minutesGenerated: number; hoursSaved: number
  actionItems: number; completedItems: number; pendingItems: number
}

type Meeting = {
  id: string; title: string; date: string
  duration_minutes: number; status: string; action_items: any[]
}

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return count
}

function StatCard({ icon, label, value, suffix = '', color, delay, trend }: {
  icon: string; label: string; value: number; suffix?: string
  color: string; delay: number; trend?: string
}) {
  const count = useCountUp(value)
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), delay) }, [])
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: 'clamp(14px,2vw,24px)',
      position: 'relative', overflow: 'hidden',
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'default', backdropFilter: 'blur(20px)',
      boxSizing: 'border-box',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform='translateY(-4px) scale(1.02)'; el.style.border=`1px solid ${color}44`; el.style.boxShadow=`0 20px 40px ${color}22` }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform='translateY(0) scale(1)'; el.style.border='1px solid rgba(255,255,255,0.08)'; el.style.boxShadow='none' }}
    >
      <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:color, opacity:0.12, filter:'blur(30px)', pointerEvents:'none' }} />
      <div style={{ fontSize: 'clamp(20px,3vw,28px)', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: '800', color: 'white', letterSpacing: '-1px', lineHeight: 1 }}>{count}{suffix}</div>
      <div style={{ fontSize: 'clamp(10px,1.2vw,13px)', color: 'rgba(255,255,255,0.5)', marginTop: '5px', fontWeight: '500' }}>{label}</div>
      {trend && <div style={{ marginTop: '8px', fontSize: '11px', color: '#4ade80', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}><span>↑</span>{trend}</div>}
    </div>
  )
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => { setTimeout(() => setWidth((value / max) * 100), 300) }, [value, max])
  return (
    <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: '2px', transition: 'width 1s ease' }} />
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ totalMeetings:0, minutesGenerated:0, hoursSaved:0, actionItems:0, completedItems:0, pendingItems:0 })
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [user, setUser] = useState<any>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [language, setLanguage] = useState('auto')
  const [headerVisible, setHeaderVisible] = useState(false)
  const [time, setTime] = useState(new Date())
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setTimeout(() => setHeaderVisible(true), 100)
    const timer = setInterval(() => setTime(new Date()), 1000)
    fetchData()
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight
    const particles: { x:number;y:number;vx:number;vy:number;r:number;o:number }[] = []
    for (let i = 0; i < 50; i++) {
      particles.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, r:Math.random()*1.5+0.5, o:Math.random()*0.4+0.1 })
    }
    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(139,127,247,${p.o})`; ctx.fill()
      })
      particles.forEach((p, i) => {
        particles.slice(i+1).forEach(q => {
          const d = Math.hypot(p.x-q.x, p.y-q.y)
          if (d < 80) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.strokeStyle=`rgba(139,127,247,${0.08*(1-d/80)})`; ctx.stroke() }
        })
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [])

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setUser(session.user)
    const { data: meetingsData } = await supabase.from('meetings').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
    if (meetingsData) {
      setMeetings(meetingsData.slice(0, 5))
      const done = meetingsData.filter(m => m.status === 'done')
      const totalMinutes = done.reduce((acc, m) => acc + (m.duration_minutes || 5), 0)
      const { data: actionData } = await supabase.from('action_items').select('*').eq('user_id', session.user.id)
      const completed = actionData?.filter(a => a.is_completed).length || 0
      const pending = (actionData?.length || 0) - completed
      setStats({ totalMeetings:meetingsData.length, minutesGenerated:done.length, hoursSaved:Math.round(totalMinutes/60*10)/10||done.length*0.5, actionItems:actionData?.length||0, completedItems:completed, pendingItems:pending })
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) return
    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user; if (!user) throw new Error('Not logged in')
      const fileName = `${user.id}/${Date.now()}-${uploadFile.name}`
      const { error: storageError } = await supabase.storage.from('recordings').upload(fileName, uploadFile)
      if (storageError) throw storageError
      const { data: urlData } = supabase.storage.from('recordings').getPublicUrl(fileName)
      const { data: meeting, error: dbError } = await supabase.from('meetings').insert({ user_id:user.id, title:uploadFile.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '), recording_url:urlData.publicUrl, status:'processing', date:new Date().toISOString() }).select().single()
      if (dbError) throw dbError
      await fetch(`${import.meta.env.VITE_API_URL}/api/transcribe`, { method:'POST', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${session?.access_token}` }, body:JSON.stringify({ meetingId:meeting.id, fileUrl:urlData.publicUrl, fileName:uploadFile.name, language }) })
      setShowUpload(false); setUploadFile(null); fetchData()
      alert('✅ Meeting uploaded! Processing it now.')
    } catch (err: any) { alert('Upload failed: ' + err.message) }
    setUploading(false)
  }

  const statusColor: Record<string, string> = { pending:'#f59e0b', processing:'#3b82f6', done:'#22c55e', failed:'#ef4444' }
  const greeting = () => { const h = time.getHours(); if (h < 12) return 'Good morning'; if (h < 17) return 'Good afternoon'; return 'Good evening' }
  const completionPct = stats.actionItems > 0 ? Math.round((stats.completedItems / stats.actionItems) * 100) : 0

  return (
    <div style={{ minHeight:'100vh', width:'100%', background:'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)', fontFamily:"'DM Sans', sans-serif", position:'relative', overflow:'hidden', boxSizing:'border-box' }}>
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', top:'-200px', left:'-200px', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(100,87,249,0.15) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-200px', right:'-200px', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,127,247,0.1) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1, padding:'clamp(12px,2vw,32px)' }}>

        {/* ── Top bar ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'clamp(16px,2.5vw,36px)', transform:headerVisible?'translateY(0)':'translateY(-20px)', opacity:headerVisible?1:0, transition:'all 0.7s ease', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <div style={{ fontSize:'clamp(16px,2.5vw,28px)', fontWeight:'800', color:'white', letterSpacing:'-0.5px' }}>{greeting()}{user?.email?`, ${user.email.split('@')[0]}`:''} 👋</div>
            <div style={{ fontSize:'clamp(11px,1.2vw,13px)', color:'rgba(255,255,255,0.4)', marginTop:'3px' }}>
              {time.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · {time.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/ai-assistant')} style={{ background:'rgba(100,87,249,0.15)', border:'1px solid rgba(100,87,249,0.3)', color:'#a5b4fc', padding:'9px 14px', borderRadius:'10px', fontSize:'clamp(11px,1.3vw,13px)', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', transition:'all 0.2s', backdropFilter:'blur(10px)', whiteSpace:'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(100,87,249,0.3)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(100,87,249,0.15)' }}
            >🤖 AI Assistant</button>
            <button onClick={() => setShowUpload(true)} style={{ background:'linear-gradient(135deg, #6457F9, #8B7FF7)', border:'none', color:'white', padding:'9px 16px', borderRadius:'10px', fontSize:'clamp(11px,1.3vw,13px)', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', boxShadow:'0 8px 24px rgba(100,87,249,0.4)', transition:'all 0.2s', whiteSpace:'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform='translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform='translateY(0)' }}
            >⬆ Upload</button>
          </div>
        </div>

        {/* ── Hero banner ── */}
        <div style={{ background:'linear-gradient(135deg, rgba(100,87,249,0.3) 0%, rgba(139,127,247,0.15) 50%, rgba(34,197,94,0.1) 100%)', border:'1px solid rgba(100,87,249,0.2)', borderRadius:'20px', padding:'clamp(16px,2.5vw,36px)', marginBottom:'clamp(12px,2vw,28px)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px', backdropFilter:'blur(20px)', overflow:'hidden', position:'relative', transform:headerVisible?'translateY(0)':'translateY(20px)', opacity:headerVisible?1:0, transition:'all 0.7s ease 0.1s', boxSizing:'border-box' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'linear-gradient(135deg, rgba(100,87,249,0.05), transparent)', pointerEvents:'none' }} />
          <div style={{ zIndex:1, flex:1, minWidth:0 }}>
            <h2 style={{ color:'white', fontSize:'clamp(15px,2.5vw,26px)', fontWeight:'800', margin:'0 0 6px', letterSpacing:'-0.5px', lineHeight:1.2 }}>Turn meetings into<br />actionable minutes with AI ✨</h2>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'clamp(11px,1.3vw,14px)', margin:'0 0 16px' }}>Upload, transcribe and summarize your meetings in seconds.</p>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              <button onClick={() => setShowUpload(true)} style={{ background:'white', color:'#6457F9', border:'none', padding:'9px 16px', borderRadius:'10px', fontWeight:'700', fontSize:'clamp(11px,1.3vw,13px)', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', transition:'all 0.2s', boxShadow:'0 4px 16px rgba(0,0,0,0.2)', whiteSpace:'nowrap' }}>⬆ Upload Meeting</button>
              <button onClick={() => navigate('/meetings')} style={{ background:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.2)', padding:'9px 16px', borderRadius:'10px', fontWeight:'600', fontSize:'clamp(11px,1.3vw,13px)', cursor:'pointer', backdropFilter:'blur(10px)', whiteSpace:'nowrap' }}>📋 View All</button>
            </div>
          </div>
          {/* Floating card — hidden on small screens */}
          <div className="hero-float-card" style={{ background:'rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px', width:'clamp(100px,12vw,160px)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0, transform:'perspective(500px) rotateY(-8deg) rotateX(4deg)', boxShadow:'20px 20px 40px rgba(0,0,0,0.3)', animation:'float 4s ease-in-out infinite' }}>
            {[85,60,90,45,75].map((w,i) => (
              <div key={i} style={{ height:'7px', borderRadius:'4px', marginBottom:'8px', background:`rgba(139,127,247,${0.3+i*0.1})`, width:`${w}%` }} />
            ))}
            <div style={{ marginTop:'10px', display:'flex', gap:'5px' }}>
              {['#6457F9','#22c55e','#f59e0b'].map((c,i) => (
                <div key={i} style={{ width:'16px', height:'16px', borderRadius:'50%', background:c, border:'2px solid rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'clamp(8px,1.5vw,16px)', marginBottom:'clamp(12px,2vw,28px)' }}>
          <StatCard icon="🎙" label="Total Meetings" value={stats.totalMeetings} color="#6457F9" delay={200} trend={stats.totalMeetings>0?'Active':undefined} />
          <StatCard icon="✅" label="Minutes Generated" value={stats.minutesGenerated} color="#22c55e" delay={300} />
          <StatCard icon="⏱" label="Hours Saved" value={stats.hoursSaved} suffix="h" color="#f59e0b" delay={400} />
          <StatCard icon="📋" label="Action Items" value={stats.actionItems} color="#3b82f6" delay={500} />
          <StatCard icon="🎯" label="Completed" value={stats.completedItems} color="#8b5cf6" delay={600} />
          <StatCard icon="⚡" label="Pending" value={stats.pendingItems} color="#ef4444" delay={700} />
        </div>

        {/* ── Bottom grid ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'clamp(8px,1.5vw,20px)' }}>

          {/* Recent meetings */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'18px', padding:'clamp(16px,2vw,24px)', backdropFilter:'blur(20px)', gridColumn:'span 2' }} className="recent-meetings-col">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
              <h3 style={{ margin:0, fontSize:'clamp(13px,1.5vw,16px)', fontWeight:'700', color:'white' }}>Recent Meetings</h3>
              <button onClick={() => navigate('/meetings')} style={{ background:'rgba(100,87,249,0.15)', border:'none', color:'#a5b4fc', padding:'5px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:'600', cursor:'pointer' }}>View all →</button>
            </div>
            {meetings.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px', color:'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize:'36px', marginBottom:'8px' }}>🎙</div>
                <p style={{ margin:0, fontSize:'13px' }}>No meetings yet. Upload your first one!</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {meetings.map((m, i) => (
                  <div key={m.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', borderRadius:'10px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', cursor:'pointer', transition:'all 0.2s', animation:`slideIn 0.4s ease ${i*0.08}s both`, gap:'8px' }}
                    onClick={() => m.status==='done'&&navigate(`/meetings/${m.id}`)}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background='rgba(100,87,249,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor='rgba(100,87,249,0.2)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.03)'; (e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,0.05)' }}
                  >
                    <div style={{ display:'flex', gap:'10px', alignItems:'center', flex:1, minWidth:0 }}>
                      <div style={{ width:'32px', height:'32px', borderRadius:'9px', flexShrink:0, background:`${statusColor[m.status]||'#6b7280'}22`, border:`1px solid ${statusColor[m.status]||'#6b7280'}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>
                        {m.status==='done'?'✅':m.status==='processing'?'⏳':m.status==='failed'?'❌':'📋'}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:'clamp(11px,1.3vw,13.5px)', fontWeight:'600', color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'clamp(140px,20vw,280px)' }}>{m.title}</div>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>
                          {new Date(m.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                          {m.duration_minutes?` · ${m.duration_minutes} min`:''}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize:'10px', padding:'3px 8px', borderRadius:'20px', fontWeight:'600', background:`${statusColor[m.status]||'#6b7280'}22`, color:statusColor[m.status]||'#6b7280', flexShrink:0, textTransform:'capitalize' as const }}>{m.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress card */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'18px', padding:'clamp(16px,2vw,24px)', backdropFilter:'blur(20px)' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:'clamp(13px,1.5vw,16px)', fontWeight:'700', color:'white' }}>Task Progress</h3>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'16px' }}>
              <div style={{ position:'relative', width:'100px', height:'100px' }}>
                <svg width="100" height="100" style={{ transform:'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad2)" strokeWidth="8"
                    strokeDasharray={`${completionPct*2.51} 251`} strokeLinecap="round"
                    style={{ transition:'stroke-dasharray 1.5s ease' }} />
                  <defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6457F9" /><stop offset="100%" stopColor="#22c55e" /></linearGradient></defs>
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'20px', fontWeight:'800', color:'white' }}>{completionPct}%</span>
                  <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.4)' }}>done</span>
                </div>
              </div>
            </div>
            {[{label:'Completed',value:stats.completedItems,total:stats.actionItems,color:'#22c55e'},{label:'Pending',value:stats.pendingItems,total:stats.actionItems,color:'#f59e0b'}].map(item => (
              <div key={item.label} style={{ marginBottom:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                  <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', fontWeight:'500' }}>{item.label}</span>
                  <span style={{ fontSize:'12px', color:'white', fontWeight:'700' }}>{item.value}</span>
                </div>
                <MiniBar value={item.value} max={Math.max(item.total,1)} color={item.color} />
              </div>
            ))}
            <button onClick={() => navigate('/action-items')} style={{ width:'100%', marginTop:'12px', padding:'9px', background:'rgba(100,87,249,0.15)', border:'1px solid rgba(100,87,249,0.3)', color:'#a5b4fc', borderRadius:'9px', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s' }}>View Action Items →</button>
          </div>

          {/* Quick actions */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'18px', padding:'clamp(16px,2vw,24px)', backdropFilter:'blur(20px)' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:'clamp(13px,1.5vw,16px)', fontWeight:'700', color:'white' }}>Quick Actions</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {[
                { icon:'⬆', label:'Upload Meeting', sub:'Transcribe & generate minutes', color:'#6457F9', action:() => setShowUpload(true) },
                { icon:'🤖', label:'AI Assistant', sub:'Ask questions about meetings', color:'#8b5cf6', action:() => navigate('/ai-assistant') },
                { icon:'✅', label:'Action Items', sub:'Track your tasks & deadlines', color:'#22c55e', action:() => navigate('/action-items') },
                { icon:'📋', label:'All Meetings', sub:'Browse meeting history', color:'#f59e0b', action:() => navigate('/meetings') },
              ].map((item, i) => (
                <button key={i} onClick={item.action} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', padding:'10px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', textAlign:'left' as const, transition:'all 0.2s', width:'100%', boxSizing:'border-box' }}
                  onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.background=`${item.color}15`; b.style.borderColor=`${item.color}30`; b.style.transform='translateX(3px)' }}
                  onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.background='rgba(255,255,255,0.03)'; b.style.borderColor='rgba(255,255,255,0.06)'; b.style.transform='translateX(0)' }}
                >
                  <div style={{ width:'32px', height:'32px', borderRadius:'9px', flexShrink:0, background:`${item.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize:'clamp(11px,1.3vw,13.5px)', fontWeight:'600', color:'white' }}>{item.label}</div>
                    <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', marginTop:'1px' }}>{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Upload modal ── */}
      {showUpload && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, backdropFilter:'blur(8px)', padding:'16px', boxSizing:'border-box' }}>
          <div style={{ background:'linear-gradient(135deg, #0f0a1a, #1a0f2e)', border:'1px solid rgba(100,87,249,0.3)', borderRadius:'20px', padding:'clamp(20px,3vw,32px)', width:'100%', maxWidth:'440px', boxShadow:'0 40px 80px rgba(0,0,0,0.6)', boxSizing:'border-box' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h3 style={{ margin:0, fontSize:'clamp(15px,2vw,18px)', fontWeight:'700', color:'white' }}>Upload Meeting</h3>
              <button onClick={() => { setShowUpload(false); setUploadFile(null) }} style={{ background:'rgba(255,255,255,0.08)', border:'none', color:'white', width:'30px', height:'30px', borderRadius:'8px', cursor:'pointer', fontSize:'14px' }}>✕</button>
            </div>
            <div onClick={() => document.getElementById('dash-file')?.click()} style={{ border:`2px dashed ${uploadFile?'#6457F9':'rgba(255,255,255,0.1)'}`, borderRadius:'14px', padding:'clamp(24px,4vw,40px) 16px', textAlign:'center' as const, cursor:'pointer', background:uploadFile?'rgba(100,87,249,0.1)':'rgba(255,255,255,0.02)', marginBottom:'14px', transition:'all 0.2s', boxSizing:'border-box' }}>
              <div style={{ fontSize:'36px', marginBottom:'10px' }}>🎙</div>
              <p style={{ margin:'0 0 4px', fontWeight:'600', color:'white', fontSize:'13px' }}>{uploadFile?`✅ ${uploadFile.name}`:'Click to select audio or video'}</p>
              <p style={{ margin:0, fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>MP3, MP4, WAV, M4A — max 500MB</p>
              <input id="dash-file" type="file" accept="audio/*,video/*" onChange={e => setUploadFile(e.target.files?.[0]||null)} style={{ display:'none' }} />
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:'6px', fontWeight:'500' }}>Audio Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:'9px', border:'1px solid rgba(255,255,255,0.1)', fontSize:'13px', outline:'none', background:'rgba(255,255,255,0.05)', color:'white', cursor:'pointer', boxSizing:'border-box' }}>
                <option value="auto" style={{ background:'#1a0f2e' }}>🌐 Auto Detect</option>
                <option value="en" style={{ background:'#1a0f2e' }}>🇺🇸 English</option>
                <option value="ur" style={{ background:'#1a0f2e' }}>🇵🇰 Urdu</option>
                <option value="hi" style={{ background:'#1a0f2e' }}>🇮🇳 Hindi</option>
                <option value="ar" style={{ background:'#1a0f2e' }}>🇸🇦 Arabic</option>
              </select>
            </div>
            <button onClick={handleUpload} disabled={!uploadFile||uploading} style={{ width:'100%', padding:'13px', borderRadius:'11px', background:uploadFile&&!uploading?'linear-gradient(135deg, #6457F9, #8B7FF7)':'rgba(255,255,255,0.08)', color:uploadFile&&!uploading?'white':'rgba(255,255,255,0.3)', border:'none', fontSize:'13px', fontWeight:'700', cursor:uploadFile&&!uploading?'pointer':'not-allowed', boxShadow:uploadFile&&!uploading?'0 8px 24px rgba(100,87,249,0.4)':'none', boxSizing:'border-box' }}>
              {uploading?'⏳ Processing...':'⬆ Upload & Generate Minutes'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: perspective(500px) rotateY(-8deg) rotateX(4deg) translateY(0px); }
          50% { transform: perspective(500px) rotateY(-8deg) rotateX(4deg) translateY(-10px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 3px; }
        @media (max-width: 640px) {
          .hero-float-card { display: none !important; }
          .recent-meetings-col { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  )
}