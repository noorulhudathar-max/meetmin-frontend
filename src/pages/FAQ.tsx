
import { useState } from 'react'

const FAQ_DATA = [
  {
    cat: 'Getting Started',
    items: [
      { q: 'What is Notivo AI?', a: 'Notivo AI is an AI-powered meeting minutes platform. Upload any audio or video recording and our AI transcribes it, generates a structured summary, extracts action items with deadlines, and delivers everything to your team — automatically.' },
      { q: 'Do I need a credit card to sign up?', a: 'No. The free tier requires no credit card. You can process up to 5 meetings per month and generate up to 10 AI summaries completely free. Upgrade only when you need more.' },
      { q: 'What file formats are supported?', a: 'We support MP3, MP4, WAV, M4A, WEBM, OGG, and most common audio/video formats. Files up to 2GB on the Pro plan; free tier supports up to 200MB per upload.' },
    ],
  },
  {
    cat: 'Features',
    items: [
      { q: 'How accurate is the AI transcription?', a: 'Our engine achieves 95%+ accuracy for clear English audio. We support 40+ languages. Background noise or heavy accents may reduce accuracy, but our post-processing layer significantly improves raw output.' },
      { q: 'Can it identify different speakers?', a: 'Yes. Speaker diarization is available on Pro and Enterprise plans. The AI labels each segment by speaker, and you can rename them after processing.' },
      { q: 'What integrations are available?', a: 'Slack, Google Calendar, Microsoft Teams, Notion, Jira, Asana, Zoom, and more. Push summaries and action items directly to your existing workflow tools in one click.' },
    ],
  },
  {
    cat: 'Pricing & Plans',
    items: [
      { q: 'What does the free plan include?', a: '5 meetings/month, 10 AI summaries, basic integrations (Slack, email), 200MB max file size, and 7-day storage. Perfect for individuals and small teams trying us out.' },
      { q: 'Can I cancel anytime?', a: 'Yes, anytime. No lock-in, no cancellation fees. If you cancel mid-billing-cycle, you retain access until the cycle ends. Your data is kept 30 days after cancellation before permanent deletion.' },
    ],
  },
  {
    cat: 'Privacy & Security',
    items: [
      { q: 'Is my meeting data secure?', a: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never train our AI models on your meeting content. You own your data entirely and can delete it at any time.' },
      { q: 'Is Notivo AI GDPR compliant?', a: 'Yes, fully GDPR-compliant. You can request a full data export or deletion at any time. We also offer a Data Processing Agreement (DPA) for Enterprise customers.' },
    ],
  },
]

function AccordionItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: open ? 'rgba(100,87,249,0.08)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${open ? 'rgba(100,87,249,0.32)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius:14, overflow:'hidden',
      boxShadow: open ? '0 0 0 1px rgba(100,87,249,0.1), 0 6px 28px rgba(0,0,0,0.28)' : 'none',
      animation:'slideUp 0.5s ease both', animationDelay:`${delay}s`,
      transition:'border-color 0.25s, background 0.25s, box-shadow 0.25s',
    }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'clamp(14px,2.5vw,18px) clamp(14px,2.5vw,22px)', cursor:'pointer', gap:12,
        background:'transparent', border:'none',
        fontWeight:600, fontSize:'clamp(13px,2vw,15px)', fontFamily:'var(--font-head)',
        color: open ? '#c4b8ff' : 'rgba(240,238,255,0.95)',
        textAlign:'left' as const, transition:'color 0.2s',
      }}>
        <span style={{ flex:1 }}>{q}</span>
        <div style={{
          width:24, height:24, borderRadius:7, flexShrink:0,
          background: open ? 'rgba(100,87,249,0.18)' : 'rgba(255,255,255,0.07)',
          border:`1px solid ${open ? 'rgba(100,87,249,0.35)' : 'rgba(255,255,255,0.1)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:16, fontWeight:300,
          transform: open ? 'rotate(45deg)' : 'none',
          transition:'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          color: open ? '#c4b8ff' : 'rgba(200,195,255,0.7)',
        }}>+</div>
      </button>
      <div style={{ maxHeight: open ? 320 : 0, overflow:'hidden', transition:'max-height 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <p style={{ fontSize:'clamp(12px,1.5vw,14px)', color:'rgba(220,215,255,0.85)', lineHeight:1.75, padding:`0 clamp(14px,2.5vw,22px) clamp(14px,2vw,20px)` }}>{a}</p>
      </div>
    </div>
  )
}

export default function FAQ({ onGoLogin }: { onGoLogin: () => void }) {
  let idx = 0
  const btn: React.CSSProperties = {
    display:'inline-flex', alignItems:'center', gap:7,
    background:'linear-gradient(135deg,#6457F9,#8B7FF7)', color:'white',
    padding:'11px 20px', borderRadius:11,
    fontSize:'clamp(12px,1.5vw,13px)', fontWeight:600, cursor:'pointer',
    border:'none', fontFamily:'var(--font-body)',
    boxShadow:'0 4px 18px rgba(100,87,249,0.4)',
    transition:'all 0.22s',
    whiteSpace:'nowrap' as const,
  }
  const hover = (e: React.MouseEvent, on: boolean) => {
    const el = e.currentTarget as HTMLButtonElement
    el.style.transform = on ? 'translateY(-2px)' : ''
    el.style.boxShadow = on ? '0 8px 28px rgba(100,87,249,0.58)' : '0 4px 18px rgba(100,87,249,0.4)'
  }
  return (
    <div style={{ maxWidth:740, margin:'0 auto', padding:'clamp(24px,4vw,40px) clamp(16px,4vw,20px) 80px', boxSizing:'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom:36 }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:7,
          background:'rgba(100,87,249,0.12)', border:'1px solid rgba(100,87,249,0.25)',
          borderRadius:100, padding:'5px 13px', fontSize:10,
          color:'#c4b8ff', fontWeight:700, letterSpacing:'0.06em',
          textTransform:'uppercase' as const, marginBottom:16,
        }}>✦ Help Center</div>

        <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(24px,5vw,46px)', fontWeight:800, lineHeight:1.1, marginBottom:12, color:'rgba(245,243,255,0.97)', margin:'0 0 12px' }}>
          Got questions?<br />
          <span style={{ background:'linear-gradient(90deg,#8B7FF7,#c4b8ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>We've got answers.</span>
        </h1>
        <p style={{ fontSize:'clamp(12px,1.5vw,14px)', color:'rgba(210,205,255,0.75)', lineHeight:1.7, maxWidth:500, marginBottom:20, margin:'12px 0 20px' }}>
          Everything you need to know about Notivo AI before you get started.
        </p>
        <button style={btn} onClick={onGoLogin} onMouseEnter={e => hover(e,true)} onMouseLeave={e => hover(e,false)}>
          Get started free →
        </button>
      </div>

      {/* Accordion */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {FAQ_DATA.map(group => (
          <div key={group.cat}>
            <div style={{
              fontFamily:'var(--font-head)', fontSize:10, fontWeight:700,
              textTransform:'uppercase' as const, letterSpacing:'0.08em',
              color:'#a89fff', padding:'20px 0 8px',
            }}>
              {group.cat}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {group.items.map(item => {
                const d = idx * 0.055; idx++
                return <AccordionItem key={item.q} q={item.q} a={item.a} delay={d} />
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{
        marginTop:44, background:'rgba(100,87,249,0.08)',
        border:'1px solid rgba(100,87,249,0.2)',
        borderRadius:18, padding:'clamp(20px,3vw,32px) clamp(16px,3vw,28px)',
        display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap',
        boxSizing:'border-box',
      }}>
        <div>
          <h3 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(15px,2vw,18px)', fontWeight:700, marginBottom:6, color:'rgba(245,243,255,0.97)', margin:'0 0 6px' }}>Still have questions?</h3>
          <p style={{ color:'rgba(210,205,255,0.72)', fontSize:'clamp(11px,1.5vw,13px)', margin:0 }}>Our team responds within 24 hours.</p>
        </div>
        <button style={btn} onMouseEnter={e => hover(e,true)} onMouseLeave={e => hover(e,false)}>✉ Contact support</button>
      </div>
    </div>
  )
}