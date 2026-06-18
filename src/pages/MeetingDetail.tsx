// import { useEffect, useState } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { supabase } from '../lib/supabase'

// type ActionItem = { task: string; assignee: string | null; deadline: string | null }

// type Meeting = {
//   id: string; title: string; date: string; duration_minutes: number
//   status: string; transcript: string; summary: string; action_items: ActionItem[]
// }

// const scrollbarStyle = `
//   .detail-outer::-webkit-scrollbar { width: 4px; }
//   .detail-outer::-webkit-scrollbar-track { background: transparent; }
//   .detail-outer::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }
//   .transcript-box::-webkit-scrollbar { width: 4px; }
//   .transcript-box::-webkit-scrollbar-track { background: transparent; }
//   .transcript-box::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }
//   .translation-box::-webkit-scrollbar { width: 4px; }
//   .translation-box::-webkit-scrollbar-track { background: transparent; }
//   .translation-box::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.4); border-radius: 2px; }

//   .detail-header-card {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//   }
//   .detail-tabs-bar {
//     display: flex;
//     gap: 3px;
//     flex-wrap: wrap;
//   }
//   .translate-row {
//     display: flex;
//     gap: 10px;
//     align-items: center;
//     margin-bottom: 14px;
//     flex-wrap: wrap;
//   }

//   @media (max-width: 600px) {
//     .detail-header-card {
//       flex-direction: column !important;
//       gap: 12px !important;
//     }
//     .detail-tabs-bar {
//       width: 100%;
//     }
//     .detail-tabs-bar button {
//       flex: 1;
//       text-align: center;
//       font-size: 11px !important;
//       padding: 7px 10px !important;
//     }
//     .detail-outer > div {
//       padding: 16px !important;
//     }
//     .action-item-row {
//       flex-wrap: wrap !important;
//     }
//   }
//   @media (max-width: 400px) {
//     .translate-row button { font-size: 11px !important; padding: 6px 10px !important; }
//   }
// `

// export default function MeetingDetail() {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [meeting, setMeeting] = useState<Meeting | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState<'summary'|'transcript'|'actions'>('summary')
//   const [translating, setTranslating] = useState(false)
//   const [translation, setTranslation] = useState('')
//   const [translationLang, setTranslationLang] = useState<'en'|'ur'|null>(null)
//   const [showTranslation, setShowTranslation] = useState(false)

//   useEffect(() => { fetchMeeting() }, [id])

//   const fetchMeeting = async () => {
//     const { data } = await supabase.from('meetings').select('*').eq('id', id).single()
//     setMeeting(data)
//     setLoading(false)
//   }

//   const handleTranslate = async (targetLang: 'en'|'ur') => {
//     if (!meeting?.transcript) return
//     setTranslating(true); setTranslationLang(targetLang)
//     setShowTranslation(true); setTranslation('')
//     try {
//       const { data: { session } } = await supabase.auth.getSession()
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/translate/${targetLang}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
//         body: JSON.stringify({ text: meeting.transcript })
//       })
//       const data = await response.json()
//       setTranslation(data.translation || 'Translation failed.')
//     } catch {
//       setTranslation('Translation failed. Please try again.')
//     }
//     setTranslating(false)
//   }

//   const surface = 'rgba(255,255,255,0.04)'
//   const borderP = '1px solid rgba(100,87,249,0.18)'

//   if (loading) return (
//     <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontFamily:"'DM Sans',sans-serif", color:'rgba(240,240,255,0.4)' }}>
//       <div style={{ textAlign:'center' }}>
//         <div style={{ fontSize:32, marginBottom:10 }}>⏳</div>
//         Loading meeting...
//       </div>
//     </div>
//   )

//   if (!meeting) return (
//     <div style={{ padding:32, fontFamily:"'DM Sans',sans-serif", color:'#f0f0ff' }}>
//       <p>Meeting not found.</p>
//       <button onClick={() => navigate('/meetings')} style={{ color:'#a89fff', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
//     </div>
//   )

//   const tabs = [
//     { key:'summary',    label:'📋 Summary' },
//     { key:'transcript', label:'📝 Transcript' },
//     { key:'actions',    label:`✅ Actions (${meeting.action_items?.length || 0})` },
//   ]

//   return (
//     <div className="detail-outer" style={{ height:'100%', overflowY:'auto', fontFamily:"'DM Sans',sans-serif", color:'#f0f0ff', boxSizing:'border-box' }}>
//       <style>{scrollbarStyle}</style>

//       <div style={{ padding:'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 28px)', maxWidth:900 }}>
//         {/* Back */}
//         <button onClick={() => navigate('/meetings')} style={{ background:'none', border:'none', color:'#8B7FF7', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20, display:'flex', alignItems:'center', gap:6, padding:0, transition:'color 0.2s' }}
//           onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#c4b8ff'}
//           onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#8B7FF7'}
//         >← Back to Meetings</button>

//         {/* Header card */}
//         <div style={{ background:surface, borderRadius:16, padding:'clamp(16px, 3vw, 22px) clamp(16px, 3vw, 24px)', border:borderP, marginBottom:18, backdropFilter:'blur(12px)', boxShadow:'0 4px 24px rgba(0,0,0,0.2)' }}>
//           <div className="detail-header-card">
//             <div style={{ flex: 1, minWidth: 0 }}>
//               <h1 style={{ margin:'0 0 8px', fontSize:'clamp(16px, 2.5vw, 20px)', fontWeight:700, color:'#f0f0ff', wordBreak:'break-word' }}>{meeting.title}</h1>
//               <div style={{ display:'flex', gap:16, fontSize:12, color:'rgba(240,240,255,0.5)', flexWrap:'wrap' }}>
//                 <span>📅 {new Date(meeting.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
//                 {meeting.duration_minutes && <span>⏱ {meeting.duration_minutes} min</span>}
//               </div>
//             </div>
//             <span style={{ background:'rgba(34,197,94,0.12)', color:'#22C55E', padding:'5px 14px', borderRadius:20, fontSize:11, fontWeight:600, border:'1px solid rgba(34,197,94,0.2)', whiteSpace:'nowrap', flexShrink: 0 }}>✓ Processed</span>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="detail-tabs-bar" style={{ marginBottom:18, background:surface, padding:5, borderRadius:12, border:borderP, backdropFilter:'blur(10px)', width:'fit-content', maxWidth:'100%' }}>
//           {tabs.map(tab => (
//             <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
//               padding:'8px clamp(10px, 2vw, 18px)', borderRadius:9, border:'none',
//               background: activeTab===tab.key ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'transparent',
//               color: activeTab===tab.key ? 'white' : 'rgba(240,240,255,0.5)',
//               fontSize:'clamp(11px, 1.5vw, 12.5px)', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
//               boxShadow: activeTab===tab.key ? '0 2px 10px rgba(100,87,249,0.4)' : 'none',
//               whiteSpace: 'nowrap',
//             }}>{tab.label}</button>
//           ))}
//         </div>

//         {/* Tab content */}
//         <div style={{ background:surface, borderRadius:16, padding:'clamp(16px, 3vw, 22px) clamp(16px, 3vw, 24px)', border:borderP, backdropFilter:'blur(12px)' }}>

//           {/* ── SUMMARY ── */}
//           {activeTab==='summary' && (
//             <div>
//               <h3 style={{ margin:'0 0 12px', fontSize:15, fontWeight:700, color:'#f0f0ff' }}>AI Summary</h3>
//               <p style={{ fontSize:13.5, color:'rgba(240,240,255,0.75)', lineHeight:1.75, margin:'0 0 22px', background:'rgba(100,87,249,0.06)', padding:16, borderRadius:12, border:'1px solid rgba(100,87,249,0.12)' }}>
//                 {meeting.summary || 'No summary available.'}
//               </p>

//               {meeting.action_items?.length > 0 && (
//                 <>
//                   <h3 style={{ margin:'0 0 12px', fontSize:15, fontWeight:700, color:'#f0f0ff' }}>Key Action Items</h3>
//                   {meeting.action_items.map((item, i) => (
//                     <div key={i} className="action-item-row" style={{ display:'flex', gap:12, padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10, marginBottom:8, border:'1px solid rgba(255,255,255,0.07)' }}>
//                       <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(100,87,249,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#a89fff', fontWeight:700, flexShrink:0, marginTop:1, border:'1px solid rgba(100,87,249,0.3)' }}>{i+1}</div>
//                       <div style={{ flex:1 }}>
//                         <p style={{ margin:'0 0 5px', fontSize:13, color:'#f0f0ff', fontWeight:500 }}>{item.task}</p>
//                         <div style={{ display:'flex', gap:10, fontSize:11, color:'rgba(240,240,255,0.4)', flexWrap:'wrap' }}>
//                           {item.assignee && <span>👤 {item.assignee}</span>}
//                           {item.deadline && <span>📅 {item.deadline}</span>}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </>
//               )}
//             </div>
//           )}

//           {/* ── TRANSCRIPT ── */}
//           {activeTab==='transcript' && (
//             <div>
//               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
//                 <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#f0f0ff' }}>Full Transcript</h3>
//                 <button onClick={() => navigator.clipboard.writeText(meeting.transcript)} style={{ background:'rgba(100,87,249,0.12)', border:'1px solid rgba(100,87,249,0.25)', color:'#a89fff', padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>📋 Copy</button>
//               </div>

//               <div className="transcript-box" style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'16px 18px', fontSize:13, color:'rgba(240,240,255,0.7)', lineHeight:1.8, whiteSpace:'pre-wrap', height:260, overflowY:'auto', border:'1px solid rgba(255,255,255,0.07)', marginBottom:16 }}>
//                 {meeting.transcript || 'No transcript available.'}
//               </div>

//               {/* Translation row */}
//               <div className="translate-row">
//                 <span style={{ fontSize:12, color:'rgba(240,240,255,0.5)', fontWeight:500 }}>🌐 Translate to:</span>
//                 {([['en','🇺🇸 English'],['ur','🇵🇰 Roman Urdu']] as const).map(([lang, label]) => (
//                   <button key={lang} onClick={() => handleTranslate(lang)} disabled={translating} style={{
//                     background: translationLang===lang && showTranslation ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'rgba(100,87,249,0.1)',
//                     color: translationLang===lang && showTranslation ? 'white' : '#a89fff',
//                     border: `1px solid ${translationLang===lang && showTranslation ? 'transparent' : 'rgba(100,87,249,0.3)'}`,
//                     padding:'7px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:translating?'not-allowed':'pointer',
//                     opacity: translating ? 0.6 : 1, transition:'all 0.2s',
//                   }}>{label}</button>
//                 ))}
//                 {showTranslation && (
//                   <button onClick={() => { setShowTranslation(false); setTranslation('') }} style={{ background:'none', border:'none', color:'rgba(240,240,255,0.4)', fontSize:12, cursor:'pointer' }}>✕ Hide</button>
//                 )}
//               </div>

//               {/* Translation Panel */}
//               {showTranslation && (
//                 <div style={{ background:'rgba(100,87,249,0.07)', borderRadius:12, border:'1px solid rgba(100,87,249,0.22)', overflow:'hidden' }}>
//                   <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid rgba(100,87,249,0.15)', flexWrap:'wrap', gap:8 }}>
//                     <span style={{ fontSize:13, fontWeight:600, color:'#a89fff' }}>
//                       {translationLang==='en' ? '🇺🇸 English Translation' : '🇵🇰 Roman Urdu Translation'}
//                     </span>
//                     {translation && (
//                       <button onClick={() => navigator.clipboard.writeText(translation)} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'#a89fff', padding:'4px 12px', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer' }}>📋 Copy</button>
//                     )}
//                   </div>
//                   <div className="translation-box" style={{ height:220, overflowY:'auto', padding:'14px 16px' }}>
//                     {translating ? (
//                       <div style={{ textAlign:'center', padding:'30px 0', color:'#8B7FF7' }}>
//                         <div style={{ fontSize:28, marginBottom:10 }}>⏳</div>
//                         <p style={{ margin:0, fontSize:13 }}>Translating...</p>
//                       </div>
//                     ) : (
//                       <p style={{ margin:0, fontSize:13, color:'rgba(240,240,255,0.75)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{translation}</p>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ── ACTION ITEMS TAB ── */}
//           {activeTab==='actions' && (
//             <div>
//               <h3 style={{ margin:'0 0 14px', fontSize:15, fontWeight:700, color:'#f0f0ff' }}>Action Items</h3>
//               {!meeting.action_items?.length ? (
//                 <div style={{ textAlign:'center', padding:'30px 0' }}>
//                   <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
//                   <p style={{ color:'rgba(240,240,255,0.4)', fontSize:14, margin:0 }}>No action items found.</p>
//                 </div>
//               ) : (
//                 meeting.action_items.map((item, i) => (
//                   <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'13px 14px', borderRadius:11, marginBottom:9, border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)', transition:'border-color 0.2s' }}
//                     onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor='rgba(100,87,249,0.25)'}
//                     onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,0.07)'}
//                   >
//                     <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(100,87,249,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#a89fff', fontSize:12, fontWeight:700, flexShrink:0, border:'1px solid rgba(100,87,249,0.28)' }}>✓</div>
//                     <div style={{ flex:1 }}>
//                       <p style={{ margin:'0 0 6px', fontSize:13.5, fontWeight:500, color:'#f0f0ff' }}>{item.task}</p>
//                       <div style={{ display:'flex', gap:10, fontSize:11, flexWrap:'wrap' }}>
//                         {item.assignee && <span style={{ background:'rgba(100,87,249,0.1)', color:'#8B7FF7', padding:'2px 10px', borderRadius:20, fontWeight:500 }}>👤 {item.assignee}</span>}
//                         {item.deadline && <span style={{ background:'rgba(245,158,11,0.1)', color:'#F59E0B', padding:'2px 10px', borderRadius:20, fontWeight:500 }}>📅 {item.deadline}</span>}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type ActionItem = { task: string; assignee: string | null; deadline: string | null }

type Meeting = {
  id: string; title: string; date: string; duration_minutes: number
  status: string; transcript: string; summary: string; action_items: ActionItem[]
}

const scrollbarStyle = `
  .detail-outer::-webkit-scrollbar { width: 4px; }
  .detail-outer::-webkit-scrollbar-track { background: transparent; }
  .detail-outer::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }
  .transcript-box::-webkit-scrollbar { width: 4px; }
  .transcript-box::-webkit-scrollbar-track { background: transparent; }
  .transcript-box::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }
  .translation-box::-webkit-scrollbar { width: 4px; }
  .translation-box::-webkit-scrollbar-track { background: transparent; }
  .translation-box::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.4); border-radius: 2px; }

  .detail-header-card {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .detail-tabs-bar {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
  }
  .translate-row {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .detail-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .detail-header-card {
      flex-direction: column !important;
      gap: 12px !important;
    }
    .detail-header-actions {
      width: 100%;
      justify-content: flex-start;
    }
    .detail-tabs-bar {
      width: 100%;
    }
    .detail-tabs-bar button {
      flex: 1;
      text-align: center;
      font-size: 11px !important;
      padding: 7px 10px !important;
    }
    .detail-outer > div {
      padding: 16px !important;
    }
    .action-item-row {
      flex-wrap: wrap !important;
    }
  }
  @media (max-width: 400px) {
    .translate-row button { font-size: 11px !important; padding: 6px 10px !important; }
  }
`

export default function MeetingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'summary'|'transcript'|'actions'>('summary')
  const [translating, setTranslating] = useState(false)
  const [translation, setTranslation] = useState('')
  const [translationLang, setTranslationLang] = useState<'en'|'ur'|null>(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [slackSending, setSlackSending] = useState(false)
  const [slackStatus, setSlackStatus] = useState<'idle'|'success'|'error'>('idle')

  useEffect(() => { fetchMeeting() }, [id])

  const fetchMeeting = async () => {
    const { data } = await supabase.from('meetings').select('*').eq('id', id).single()
    setMeeting(data)
    setLoading(false)
  }

  const handleTranslate = async (targetLang: 'en'|'ur') => {
    if (!meeting?.transcript) return
    setTranslating(true); setTranslationLang(targetLang)
    setShowTranslation(true); setTranslation('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/translate/${targetLang}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ text: meeting.transcript })
      })
      const data = await response.json()
      setTranslation(data.translation || 'Translation failed.')
    } catch {
      setTranslation('Translation failed. Please try again.')
    }
    setTranslating(false)
  }

  // ── Send to Slack ──────────────────────────────────────────────────────────
  const handleSendToSlack = async () => {
    if (!meeting) return
    setSlackSending(true)
    setSlackStatus('idle')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/slack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          id: meeting.id,
          title: meeting.title,
          summary: meeting.summary,
          actionItems: meeting.action_items || []
        })
      })
      if (response.ok) {
        setSlackStatus('success')
        setTimeout(() => setSlackStatus('idle'), 3000)
      } else {
        setSlackStatus('error')
        setTimeout(() => setSlackStatus('idle'), 3000)
      }
    } catch {
      setSlackStatus('error')
      setTimeout(() => setSlackStatus('idle'), 3000)
    }
    setSlackSending(false)
  }

  const surface = 'rgba(255,255,255,0.04)'
  const borderP = '1px solid rgba(100,87,249,0.18)'

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontFamily:"'DM Sans',sans-serif", color:'rgba(240,240,255,0.4)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:10 }}>⏳</div>
        Loading meeting...
      </div>
    </div>
  )

  if (!meeting) return (
    <div style={{ padding:32, fontFamily:"'DM Sans',sans-serif", color:'#f0f0ff' }}>
      <p>Meeting not found.</p>
      <button onClick={() => navigate('/meetings')} style={{ color:'#a89fff', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600 }}>← Back</button>
    </div>
  )

  const tabs = [
    { key:'summary',    label:'📋 Summary' },
    { key:'transcript', label:'📝 Transcript' },
    { key:'actions',    label:`✅ Actions (${meeting.action_items?.length || 0})` },
  ]

  // Slack button label
  const slackLabel = slackSending
    ? '⏳ Sending...'
    : slackStatus === 'success'
    ? '✅ Sent!'
    : slackStatus === 'error'
    ? '❌ Failed'
    : '💬 Send to Slack'

  const slackBg = slackStatus === 'success'
    ? 'rgba(34,197,94,0.15)'
    : slackStatus === 'error'
    ? 'rgba(239,68,68,0.15)'
    : 'rgba(255,255,255,0.06)'

  const slackBorder = slackStatus === 'success'
    ? '1px solid rgba(34,197,94,0.35)'
    : slackStatus === 'error'
    ? '1px solid rgba(239,68,68,0.35)'
    : '1px solid rgba(255,255,255,0.12)'

  const slackColor = slackStatus === 'success'
    ? '#22C55E'
    : slackStatus === 'error'
    ? '#EF4444'
    : 'rgba(240,240,255,0.6)'

  return (
    <div className="detail-outer" style={{ height:'100%', overflowY:'auto', fontFamily:"'DM Sans',sans-serif", color:'#f0f0ff', boxSizing:'border-box' }}>
      <style>{scrollbarStyle}</style>

      <div style={{ padding:'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 28px)', maxWidth:900 }}>

        {/* Back */}
        <button onClick={() => navigate('/meetings')} style={{ background:'none', border:'none', color:'#8B7FF7', cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:20, display:'flex', alignItems:'center', gap:6, padding:0, transition:'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#c4b8ff'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#8B7FF7'}
        >← Back to Meetings</button>

        {/* Header card */}
        <div style={{ background:surface, borderRadius:16, padding:'clamp(16px, 3vw, 22px) clamp(16px, 3vw, 24px)', border:borderP, marginBottom:18, backdropFilter:'blur(12px)', boxShadow:'0 4px 24px rgba(0,0,0,0.2)' }}>
          <div className="detail-header-card">
            <div style={{ flex:1, minWidth:0 }}>
              <h1 style={{ margin:'0 0 8px', fontSize:'clamp(16px, 2.5vw, 20px)', fontWeight:700, color:'#f0f0ff', wordBreak:'break-word' }}>{meeting.title}</h1>
              <div style={{ display:'flex', gap:16, fontSize:12, color:'rgba(240,240,255,0.5)', flexWrap:'wrap' }}>
                <span>📅 {new Date(meeting.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
                {meeting.duration_minutes && <span>⏱ {meeting.duration_minutes} min</span>}
              </div>
            </div>

            {/* Status badge + Slack button */}
            <div className="detail-header-actions">
              <span style={{ background:'rgba(34,197,94,0.12)', color:'#22C55E', padding:'5px 14px', borderRadius:20, fontSize:11, fontWeight:600, border:'1px solid rgba(34,197,94,0.2)', whiteSpace:'nowrap' }}>✓ Processed</span>
              <button
                onClick={handleSendToSlack}
                disabled={slackSending}
                style={{
                  background: slackBg,
                  border: slackBorder,
                  color: slackColor,
                  padding:'6px 14px', borderRadius:9, fontSize:12,
                  fontWeight:600, cursor: slackSending ? 'not-allowed' : 'pointer',
                  transition:'all 0.2s', whiteSpace:'nowrap',
                }}
                onMouseEnter={e => {
                  if (!slackSending && slackStatus === 'idle') {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,87,249,0.15)'
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(100,87,249,0.4)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#a89fff'
                  }
                }}
                onMouseLeave={e => {
                  if (!slackSending && slackStatus === 'idle') {
                    (e.currentTarget as HTMLButtonElement).style.background = slackBg
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = slackBorder
                    ;(e.currentTarget as HTMLButtonElement).style.color = slackColor
                  }
                }}
              >{slackLabel}</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs-bar" style={{ marginBottom:18, background:surface, padding:5, borderRadius:12, border:borderP, backdropFilter:'blur(10px)', width:'fit-content', maxWidth:'100%' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as 'summary'|'transcript'|'actions')} style={{
              padding:'8px clamp(10px, 2vw, 18px)', borderRadius:9, border:'none',
              background: activeTab===tab.key ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'transparent',
              color: activeTab===tab.key ? 'white' : 'rgba(240,240,255,0.5)',
              fontSize:'clamp(11px, 1.5vw, 12.5px)', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              boxShadow: activeTab===tab.key ? '0 2px 10px rgba(100,87,249,0.4)' : 'none',
              whiteSpace: 'nowrap',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ background:surface, borderRadius:16, padding:'clamp(16px, 3vw, 22px) clamp(16px, 3vw, 24px)', border:borderP, backdropFilter:'blur(12px)' }}>

          {/* ── SUMMARY ── */}
          {activeTab==='summary' && (
            <div>
              <h3 style={{ margin:'0 0 12px', fontSize:15, fontWeight:700, color:'#f0f0ff' }}>AI Summary</h3>
              <p style={{ fontSize:13.5, color:'rgba(240,240,255,0.75)', lineHeight:1.75, margin:'0 0 22px', background:'rgba(100,87,249,0.06)', padding:16, borderRadius:12, border:'1px solid rgba(100,87,249,0.12)', whiteSpace:'pre-wrap' }}>
                {meeting.summary || 'No summary available.'}
              </p>

              {meeting.action_items?.length > 0 && (
                <>
                  <h3 style={{ margin:'0 0 12px', fontSize:15, fontWeight:700, color:'#f0f0ff' }}>Key Action Items</h3>
                  {meeting.action_items.map((item, i) => (
                    <div key={i} className="action-item-row" style={{ display:'flex', gap:12, padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10, marginBottom:8, border:'1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(100,87,249,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#a89fff', fontWeight:700, flexShrink:0, marginTop:1, border:'1px solid rgba(100,87,249,0.3)' }}>{i+1}</div>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:'0 0 5px', fontSize:13, color:'#f0f0ff', fontWeight:500 }}>{item.task}</p>
                        <div style={{ display:'flex', gap:10, fontSize:11, color:'rgba(240,240,255,0.4)', flexWrap:'wrap' }}>
                          {item.assignee && <span>👤 {item.assignee}</span>}
                          {item.deadline && <span>📅 {item.deadline}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── TRANSCRIPT ── */}
          {activeTab==='transcript' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
                <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#f0f0ff' }}>Full Transcript</h3>
                <button onClick={() => navigator.clipboard.writeText(meeting.transcript)} style={{ background:'rgba(100,87,249,0.12)', border:'1px solid rgba(100,87,249,0.25)', color:'#a89fff', padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>📋 Copy</button>
              </div>

              <div className="transcript-box" style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'16px 18px', fontSize:13, color:'rgba(240,240,255,0.7)', lineHeight:1.8, whiteSpace:'pre-wrap', height:260, overflowY:'auto', border:'1px solid rgba(255,255,255,0.07)', marginBottom:16 }}>
                {meeting.transcript || 'No transcript available.'}
              </div>

              {/* Translation row */}
              <div className="translate-row">
                <span style={{ fontSize:12, color:'rgba(240,240,255,0.5)', fontWeight:500 }}>🌐 Translate to:</span>
                {([['en','🇺🇸 English'],['ur','🇵🇰 Roman Urdu']] as const).map(([lang, label]) => (
                  <button key={lang} onClick={() => handleTranslate(lang)} disabled={translating} style={{
                    background: translationLang===lang && showTranslation ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'rgba(100,87,249,0.1)',
                    color: translationLang===lang && showTranslation ? 'white' : '#a89fff',
                    border: `1px solid ${translationLang===lang && showTranslation ? 'transparent' : 'rgba(100,87,249,0.3)'}`,
                    padding:'7px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:translating?'not-allowed':'pointer',
                    opacity: translating ? 0.6 : 1, transition:'all 0.2s',
                  }}>{label}</button>
                ))}
                {showTranslation && (
                  <button onClick={() => { setShowTranslation(false); setTranslation('') }} style={{ background:'none', border:'none', color:'rgba(240,240,255,0.4)', fontSize:12, cursor:'pointer' }}>✕ Hide</button>
                )}
              </div>

              {/* Translation Panel */}
              {showTranslation && (
                <div style={{ background:'rgba(100,87,249,0.07)', borderRadius:12, border:'1px solid rgba(100,87,249,0.22)', overflow:'hidden' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid rgba(100,87,249,0.15)', flexWrap:'wrap', gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'#a89fff' }}>
                      {translationLang==='en' ? '🇺🇸 English Translation' : '🇵🇰 Roman Urdu Translation'}
                    </span>
                    {translation && (
                      <button onClick={() => navigator.clipboard.writeText(translation)} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'#a89fff', padding:'4px 12px', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer' }}>📋 Copy</button>
                    )}
                  </div>
                  <div className="translation-box" style={{ height:220, overflowY:'auto', padding:'14px 16px' }}>
                    {translating ? (
                      <div style={{ textAlign:'center', padding:'30px 0', color:'#8B7FF7' }}>
                        <div style={{ fontSize:28, marginBottom:10 }}>⏳</div>
                        <p style={{ margin:0, fontSize:13 }}>Translating...</p>
                      </div>
                    ) : (
                      <p style={{ margin:0, fontSize:13, color:'rgba(240,240,255,0.75)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{translation}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ACTION ITEMS TAB ── */}
          {activeTab==='actions' && (
            <div>
              <h3 style={{ margin:'0 0 14px', fontSize:15, fontWeight:700, color:'#f0f0ff' }}>Action Items</h3>
              {!meeting.action_items?.length ? (
                <div style={{ textAlign:'center', padding:'30px 0' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
                  <p style={{ color:'rgba(240,240,255,0.4)', fontSize:14, margin:0 }}>No action items found.</p>
                </div>
              ) : (
                meeting.action_items.map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'13px 14px', borderRadius:11, marginBottom:9, border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)', transition:'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor='rgba(100,87,249,0.25)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,0.07)'}
                  >
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(100,87,249,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#a89fff', fontSize:12, fontWeight:700, flexShrink:0, border:'1px solid rgba(100,87,249,0.28)' }}>✓</div>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:'0 0 6px', fontSize:13.5, fontWeight:500, color:'#f0f0ff' }}>{item.task}</p>
                      <div style={{ display:'flex', gap:10, fontSize:11, flexWrap:'wrap' }}>
                        {item.assignee && <span style={{ background:'rgba(100,87,249,0.1)', color:'#8B7FF7', padding:'2px 10px', borderRadius:20, fontWeight:500 }}>👤 {item.assignee}</span>}
                        {item.deadline && <span style={{ background:'rgba(245,158,11,0.1)', color:'#F59E0B', padding:'2px 10px', borderRadius:20, fontWeight:500 }}>📅 {item.deadline}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}