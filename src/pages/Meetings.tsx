// import { useEffect, useRef, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { supabase } from '../lib/supabase'

// type Meeting = {
//   id: string
//   title: string
//   date: string
//   duration_minutes: number
//   status: string
//   recording_url: string
//   transcript: string
//   summary: string
//   progress_message?: string
// }

// const CACHE_KEY = 'meetmin_meetings_v2'

// const css = `
//   .meetings-scroll::-webkit-scrollbar { width: 4px; }
//   .meetings-scroll::-webkit-scrollbar-track { background: transparent; }
//   .meetings-scroll::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }

//   @keyframes shimmer {
//     0%   { background-position: -600px 0; }
//     100% { background-position:  600px 0; }
//   }
//   .skeleton {
//     border-radius: 6px;
//     background: linear-gradient(90deg,
//       rgba(255,255,255,0.04) 25%,
//       rgba(255,255,255,0.09) 50%,
//       rgba(255,255,255,0.04) 75%
//     );
//     background-size: 600px 100%;
//     animation: shimmer 1.4s infinite linear;
//   }

//   @keyframes spin { to { transform: rotate(360deg); } }

//   @keyframes pulse-dot {
//     0%, 100% { opacity: 1; transform: scale(1); }
//     50%       { opacity: 0.3; transform: scale(1.6); }
//   }

//   @keyframes progress-bar {
//     0%   { width: 5%; }
//     20%  { width: 30%; }
//     50%  { width: 60%; }
//     80%  { width: 80%; }
//     100% { width: 92%; }
//   }

//   @keyframes fade-in {
//     from { opacity: 0; transform: translateY(6px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
// `

// function SkeletonRow() {
//   return (
//     <div style={{
//       display: 'grid',
//       gridTemplateColumns: '2fr 1fr 1fr 1.4fr 0.8fr 0.5fr',
//       padding: '14px 20px',
//       borderBottom: '1px solid rgba(255,255,255,0.04)',
//       alignItems: 'center', gap: 8,
//     }}>
//       <div className="skeleton" style={{ height: 14, width: '70%' }} />
//       <div className="skeleton" style={{ height: 12, width: '80%' }} />
//       <div className="skeleton" style={{ height: 12, width: '50%' }} />
//       <div className="skeleton" style={{ height: 22, width: 160, borderRadius: 8 }} />
//       <div className="skeleton" style={{ height: 28, width: 60, borderRadius: 7 }} />
//       <div className="skeleton" style={{ height: 20, width: 20, borderRadius: 4 }} />
//     </div>
//   )
// }

// // ── Live progress indicator shown inline in the row ────────────────────────
// function ProcessingCell({ message }: { message?: string }) {
//   const steps = [
//     '📥 Downloading audio file...',
//     '🗜 Compressing audio for faster processing...',
//     '🎙 Transcribing audio with Whisper AI...',
//     '🤖 Generating meeting minutes with LLaMA AI...',
//     '💾 Saving minutes to database...',
//   ]

//   const currentStep = message
//     ? steps.findIndex(s => message.startsWith(s.slice(0, 12)))
//     : -1

//   const progressPct = currentStep === -1
//     ? 10
//     : Math.round(((currentStep + 1) / steps.length) * 90)

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 5, animation: 'fade-in 0.3s ease' }}>
//       {/* Progress bar */}
//       <div style={{
//         height: 4, borderRadius: 2,
//         background: 'rgba(59,130,246,0.2)',
//         overflow: 'hidden', width: '100%',
//       }}>
//         <div style={{
//           height: '100%',
//           width: `${progressPct}%`,
//           background: 'linear-gradient(90deg, #3B82F6, #6457F9)',
//           borderRadius: 2,
//           transition: 'width 0.8s ease',
//           boxShadow: '0 0 8px rgba(100,87,249,0.5)',
//         }} />
//       </div>

//       {/* Status text */}
//       <div style={{
//         fontSize: 11, color: '#93c5fd',
//         display: 'flex', alignItems: 'center', gap: 5,
//         whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
//       }}>
//         <div style={{
//           width: 5, height: 5, borderRadius: '50%', background: '#3B82F6',
//           flexShrink: 0,
//           animation: 'pulse-dot 1s ease-in-out infinite',
//         }} />
//         {message ? message: 'Initialising...'}
//       </div>
//     </div>
//   )
// }

// // ── Status badge ───────────────────────────────────────────────────────────
// function StatusBadge({ status }: { status: string }) {
//   const map: Record<string, { text: string; bg: string; dot: string; pulse: boolean }> = {
//     pending:     { text: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  dot: '#F59E0B', pulse: false },
//     processing: { text: '#3B82F6', bg: 'rgba(59,130,246,0.12)', dot: '#3B82F6', pulse: true  },
//     done:       { text: '#22C55E', bg: 'rgba(34,197,94,0.12)',  dot: '#22C55E', pulse: false },
//     failed:     { text: '#EF4444', bg: 'rgba(239,68,68,0.12)',  dot: '#EF4444', pulse: false },
//   }
//   const s = map[status] || map.pending

//   return (
//     <span style={{
//       background: s.bg, color: s.text,
//       padding: '4px 10px', borderRadius: 20,
//       fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
//       display: 'inline-flex', alignItems: 'center', gap: 5,
//     }}>
//       <span style={{
//         width: 5, height: 5, borderRadius: '50%',
//         background: s.dot, display: 'inline-block',
//         animation: s.pulse ? 'pulse-dot 1s ease-in-out infinite' : 'none',
//       }} />
//       {status}
//     </span>
//   )
// }

// // ── Main component ─────────────────────────────────────────────────────────
// export default function Meetings() {
//   const navigate = useNavigate()

//   const [meetings, setMeetings] = useState<Meeting[]>(() => {
//     try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') } catch { return [] }
//   })
//   const [loading, setLoading]     = useState(true)
//   const [error, setError]         = useState<string | null>(null)
//   const [isOffline, setIsOffline] = useState(!navigator.onLine)
//   const [showUpload, setShowUpload] = useState(false)
//   const [uploadFile, setUploadFile] = useState<File | null>(null)
//   const [uploading, setUploading]   = useState(false)
//   const [search, setSearch]         = useState('')
//   const [language, setLanguage]       = useState('auto')
//   const userIdRef = useRef<string | null>(null)


//   // ── Init ─────────────────────────────────────────────────────────────────
//   const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

//   useEffect(() => {
//     const init = async () => {
//       // getSession reads localStorage — no network call needed
//       const { data: { session } } = await supabase.auth.getSession()
//       if (!session?.user?.id) {
//         setError('Session expired. Please log in again.')
//         setLoading(false)
//         return
//       }

//       const userId = session.user.id
//       userIdRef.current = userId

//       // ── Clean up any lingering active channel reference from double-renders ──
//       if (channelRef.current) {
//         await supabase.removeChannel(channelRef.current)
//         channelRef.current = null
//       }

//       // Create a clean channel instance and store it immediately in the ref
//       const newChannel = supabase.channel(`meetings-rt-${userId}`)
//       channelRef.current = newChannel

//       newChannel
//         .on(
//           'postgres_changes',
//           {
//             event: '*',
//             schema: 'public',
//             table: 'meetings',
//             filter: `user_id=eq.${userId}`,
//           },
//           (payload) => {
//             console.log('📡 Realtime:', payload.eventType, (payload.new as any)?.status, (payload.new as any)?.progress_message)

//             if (payload.eventType === 'UPDATE') {
//               const updated = payload.new as Meeting
//               setMeetings(prev => {
//                 const next = prev.map(m => m.id === updated.id ? { ...m, ...updated } : m)
//                 localStorage.setItem(CACHE_KEY, JSON.stringify(next))
//                 return next
//               })

//               if (updated.status === 'done') {
//                 triggerNotification(updated.title)
//               }
//             }

//             if (payload.eventType === 'INSERT') {
//               const newM = payload.new as Meeting
//               setMeetings(prev => {
//                 if (prev.find(m => m.id === newM.id)) return prev
//                 const next = [newM, ...prev]
//                 localStorage.setItem(CACHE_KEY, JSON.stringify(next))
//                 return next
//               })
//             }

//             if (payload.eventType === 'DELETE') {
//               const deleted = payload.old as { id: string }
//               setMeetings(prev => {
//                 const next = prev.filter(m => m.id !== deleted.id)
//                 localStorage.setItem(CACHE_KEY, JSON.stringify(next))
//                 return next
//               })
//             }
//           }
//         )

//       // Only fire subscribe if this initialization thread is still the active one
//       if (channelRef.current === newChannel) {
//         newChannel.subscribe((status) => {
//           console.log('📡 Realtime subscription status:', status)
//         })
//       }

//       // Fetch row history safely down here
//       await fetchMeetings(userId)
//     }

//     init()

//     // Online/offline window handling
//     const onOnline  = () => { setIsOffline(false); setError(null); if (userIdRef.current) fetchMeetings(userIdRef.current) }
//     const onOffline = () => setIsOffline(true)
//     window.addEventListener('online',  onOnline)
//     window.addEventListener('offline', onOffline)
//     window.addEventListener('app-online', onOnline)

//     return () => {
//       // Disconnect cleanly on actual unmounts
//       if (channelRef.current) {
//         supabase.removeChannel(channelRef.current)
//         channelRef.current = null
//       }
//       window.removeEventListener('online',  onOnline)
//       window.removeEventListener('offline', onOffline)
//       window.removeEventListener('app-online', onOnline)
//     }
//   }, [])

//   // ── Fetch ─────────────────────────────────────────────────────────────────
//   const fetchMeetings = async (userId: string) => {
//     try {
//       const { data, error: dbErr } = await supabase
//         .from('meetings')
//         .select('*')
//         .eq('user_id', userId)
//         .order('created_at', { ascending: false })

//       if (dbErr) throw dbErr
//       const rows = data || []
//       setMeetings(rows)
//       localStorage.setItem(CACHE_KEY, JSON.stringify(rows))
//       setError(null)
//     } catch (err: any) {
//       const isNetwork = !navigator.onLine || err.message?.includes('fetch') || err.message?.includes('NetworkError')
//       if (!isNetwork) setError('Failed to load: ' + err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ── Upload ─────────────────────────────────────────────────────────────────
//   const handleUpload = async () => {
//     if (!uploadFile) return
//     setUploading(true)
//     try {
//       const { data: { session } } = await supabase.auth.getSession()
//       const user = session?.user
//       if (!user) throw new Error('Not logged in')

//       const fileName = `${user.id}/${Date.now()}-${uploadFile.name}`
//       const { error: storageErr } = await supabase.storage.from('recordings').upload(fileName, uploadFile)
//       if (storageErr) throw storageErr

//       const { data: urlData } = supabase.storage.from('recordings').getPublicUrl(fileName)

//       const { data: meeting, error: dbErr } = await supabase
//         .from('meetings')
//         .insert({
//           user_id: user.id,
//           title: uploadFile.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
//           recording_url: urlData.publicUrl,
//           status: 'processing',
//           progress_message: '📥 Starting upload...',
//           date: new Date().toISOString(),
//         })
//         .select().single()
//       if (dbErr) throw dbErr

//       // Optimistic insert into local state
//       setMeetings(prev => {
//         const next = [{ ...meeting } as Meeting, ...prev]
//         localStorage.setItem(CACHE_KEY, JSON.stringify(next))
//         return next
//       })

//       setShowUpload(false)
//       setUploadFile(null)
//       setLanguage('auto')

//       // Fire-and-forget backend call
//       fetch(`${import.meta.env.VITE_API_URL}/api/transcribe`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session?.access_token}`,
//         },
//         body: JSON.stringify({
//           meetingId: meeting.id,
//           fileUrl: urlData.publicUrl,
//           fileName: uploadFile.name,
//           language,
//         }),
//       }).catch(e => console.warn('Transcribe call:', e.message))

//     } catch (err: any) {
//       alert('Upload failed: ' + err.message)
//     } finally {
//       setUploading(false)
//     }
//   }

//   // ── Delete ─────────────────────────────────────────────────────────────────
//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this meeting?')) return
//     setMeetings(prev => {
//       const next = prev.filter(m => m.id !== id)
//       localStorage.setItem(CACHE_KEY, JSON.stringify(next))
//       return next
//     })
//     await supabase.from('meetings').delete().eq('id', id)
//   }

//   const filtered = meetings.filter(m =>
//     m.title?.toLowerCase().includes(search.toLowerCase())
//   )

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div
//       className="meetings-scroll"
//       style={{
//         padding: '24px 28px', fontFamily: "'DM Sans', sans-serif",
//         color: '#f0f0ff', height: '100%', overflowY: 'auto', boxSizing: 'border-box',
//       }}
//     >
//       <style>{css}</style>

//       {/* Offline banner */}
//       {isOffline && (
//         <div style={{
//           background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.28)',
//           borderRadius: 10, padding: '10px 16px', marginBottom: 16,
//           fontSize: 13, color: '#F59E0B',
//         }}>
//           📡 Offline — showing cached data. Reconnect to sync.
//         </div>
//       )}

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
//         <div>
//           <h1 style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 700, color: '#f0f0ff' }}>Meetings</h1>
//           <p style={{ margin: 0, fontSize: 12, color: 'rgba(240,240,255,0.4)' }}>
//             {isOffline ? '🔴 Offline mode' : '📡 Live — status updates automatically'}
//           </p>
//         </div>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <button onClick={() => navigate('/record')} style={{
//             background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
//             color: '#f87171', padding: '9px 16px', borderRadius: 10,
//             fontWeight: 600, fontSize: 13, cursor: 'pointer',
//             display: 'flex', alignItems: 'center', gap: 6,
//           }}>🔴 Record</button>
//           <button onClick={() => setShowUpload(true)} style={{
//             background: 'linear-gradient(135deg,#6457F9,#8B7FF7)', color: 'white',
//             border: 'none', padding: '9px 20px', borderRadius: 10,
//             fontWeight: 700, fontSize: 13, cursor: 'pointer',
//             display: 'flex', alignItems: 'center', gap: 7,
//             boxShadow: '0 4px 16px rgba(100,87,249,0.4)', transition: 'all 0.2s',
//           }}
//             onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-1px)'; b.style.boxShadow = '0 8px 24px rgba(100,87,249,0.55)' }}
//             onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = ''; b.style.boxShadow = '0 4px 16px rgba(100,87,249,0.4)' }}
//           >⬆ Upload Meeting</button>
//         </div>
//       </div>

//       {/* Search */}
//       <div style={{ position: 'relative', marginBottom: 18 }}>
//         <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,240,255,0.3)', fontSize: 15 }}>🔍</span>
//         <input
//           placeholder="Search meetings..."
//           value={search} onChange={e => setSearch(e.target.value)}
//           style={{
//             width: '100%', padding: '11px 40px 11px 42px', borderRadius: 10,
//             border: '1px solid rgba(100,87,249,0.2)', fontSize: 13, outline: 'none',
//             background: 'rgba(255,255,255,0.05)', color: '#f0f0ff',
//             boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
//           }}
//           onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.5)'}
//           onBlur={e => e.target.style.border = '1px solid rgba(100,87,249,0.2)'}
//         />
//         {search && (
//           <button onClick={() => setSearch('')} style={{
//             position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
//             background: 'none', border: 'none', color: 'rgba(240,240,255,0.4)',
//             cursor: 'pointer', fontSize: 16,
//           }}>✕</button>
//         )}
//       </div>

//       {/* Error */}
//       {error && (
//         <div style={{
//           background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)',
//           borderRadius: 10, padding: '12px 16px', marginBottom: 16,
//           color: '#EF4444', fontSize: 13,
//           display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//         }}>
//           <span>⚠️ {error}</span>
//           <button onClick={() => userIdRef.current && fetchMeetings(userIdRef.current)} style={{
//             background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.28)',
//             color: '#EF4444', borderRadius: 6, padding: '4px 12px',
//             fontSize: 12, cursor: 'pointer', fontWeight: 600,
//           }}>🔄 Retry</button>
//         </div>
//       )}

//       {/* Table */}
//       <div style={{
//         background: 'rgba(255,255,255,0.04)', borderRadius: 16,
//         border: '1px solid rgba(100,87,249,0.15)',
//         overflow: 'hidden', backdropFilter: 'blur(10px)',
//       }}>
//         {/* Header row */}
//         <div style={{
//           display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.4fr 0.8fr 0.5fr',
//           padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
//           background: 'rgba(100,87,249,0.06)',
//         }}>
//           {['Meeting Title', 'Date', 'Duration', 'Status / Progress', 'Minutes', ''].map(h => (
//             <div key={h} style={{ fontSize: 10, color: 'rgba(240,240,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
//           ))}
//         </div>

//         {/* Skeleton while loading with empty cache */}
//         {loading && meetings.length === 0
//           ? [1, 2, 3].map(n => <SkeletonRow key={n} />)
//           : filtered.length === 0
//           ? (
//             <div style={{ padding: 60, textAlign: 'center' }}>
//               <div style={{ fontSize: 40, marginBottom: 12 }}>🎙</div>
//               <p style={{ color: 'rgba(240,240,255,0.4)', fontSize: 14, margin: '0 0 16px' }}>
//                 {search ? `No meetings match "${search}"` : 'No meetings yet. Upload your first!'}
//               </p>
//               {!search && (
//                 <button onClick={() => setShowUpload(true)} style={{
//                   background: 'linear-gradient(135deg,#6457F9,#8B7FF7)', border: 'none',
//                   color: 'white', padding: '10px 22px', borderRadius: 10,
//                   fontSize: 13, fontWeight: 700, cursor: 'pointer',
//                 }}>⬆ Upload Meeting</button>
//               )}
//             </div>
//           )
//           : filtered.map((m, i) => (
//             <div
//               key={m.id}
//               style={{
//                 display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.4fr 0.8fr 0.5fr',
//                 padding: '14px 20px',
//                 borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
//                 alignItems: 'center', transition: 'background 0.15s',
//               }}
//               onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(100,87,249,0.05)'}
//               onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
//             >
//               {/* Title */}
//               <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0ff', paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                 {m.title}
//               </div>

//               {/* Date */}
//               <div style={{ fontSize: 12, color: 'rgba(240,240,255,0.5)' }}>
//                 {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//               </div>

//               {/* Duration */}
//               <div style={{ fontSize: 12, color: 'rgba(240,240,255,0.5)' }}>
//                 {m.duration_minutes ? `${m.duration_minutes} min` : '—'}
//               </div>

//               {/* Status / Progress */}
//               <div>
//                 {m.status === 'processing' ? (
//                   <ProcessingCell message={m.progress_message} />
//                 ) : (
//                   <StatusBadge status={m.status || 'pending'} />
//                 )}
//               </div>

//               {/* View button */}
//               <button
//                 onClick={() => { if (m.status === 'done') navigate(`/meetings/${m.id}`) }}
//                 disabled={m.status !== 'done'}
//                 style={{
//                   background: m.status === 'done' ? 'rgba(100,87,249,0.15)' : 'rgba(255,255,255,0.04)',
//                   border: m.status === 'done' ? '1px solid rgba(100,87,249,0.3)' : '1px solid rgba(255,255,255,0.07)',
//                   color: m.status === 'done' ? '#a89fff' : 'rgba(240,240,255,0.25)',
//                   padding: '5px 13px', borderRadius: 7, fontSize: 12, fontWeight: 600,
//                   cursor: m.status === 'done' ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
//                 }}
//               >View</button>

//               {/* Delete */}
//               <button
//                 onClick={() => handleDelete(m.id)}
//                 style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 4, transition: 'color 0.2s' }}
//                 onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'}
//                 onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)'}
//               >🗑</button>
//             </div>
//           ))
//         }
//       </div>

//       {/* Upload Modal */}
//       {showUpload && (
//         <div
//           style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)', padding: 16 }}
//           onClick={e => { if (e.target === e.currentTarget) { setShowUpload(false); setUploadFile(null) } }}
//         >
//           <div style={{ background: 'rgba(18,18,30,0.98)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(100,87,249,0.25)' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
//               <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#f0f0ff' }}>Upload Meeting</h3>
//               <button onClick={() => { setShowUpload(false); setUploadFile(null); setLanguage('auto') }} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', width: 30, height: 30, borderRadius: 8, fontSize: 16, cursor: 'pointer', color: 'rgba(240,240,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
//             </div>

//             <div
//               onClick={() => document.getElementById('meeting-file')?.click()}
//               onDragOver={e => e.preventDefault()}
//               onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setUploadFile(f) }}
//               style={{ border: `2px dashed ${uploadFile ? 'rgba(100,87,249,0.7)' : 'rgba(100,87,249,0.25)'}`, borderRadius: 14, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', background: uploadFile ? 'rgba(100,87,249,0.08)' : 'rgba(255,255,255,0.02)', marginBottom: 16, transition: 'all 0.2s' }}
//             >
//               <div style={{ fontSize: 34, marginBottom: 10 }}>🎙</div>
//               <p style={{ margin: '0 0 6px', fontWeight: 600, color: uploadFile ? '#a89fff' : 'rgba(240,240,255,0.7)', fontSize: 14 }}>
//                 {uploadFile ? `✅ ${uploadFile.name}` : 'Click or drag to upload audio/video'}
//               </p>
//               <p style={{ margin: 0, fontSize: 12, color: 'rgba(240,240,255,0.35)' }}>MP3, MP4, WAV, M4A — max 500MB</p>
//               <input id="meeting-file" type="file" accept="audio/*,video/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
//             </div>

//             <div style={{ marginBottom: 16 }}>
//               <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,240,255,0.5)', display: 'block', marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Audio Language</label>
//               <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(100,87,249,0.25)', fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.05)', color: '#f0f0ff', cursor: 'pointer', boxSizing: 'border-box' as const }}>
//                 <option value="auto" style={{ background: '#12121e' }}>🌐 Auto Detect</option>
//                 <option value="en"   style={{ background: '#12121e' }}>🇺🇸 English</option>
//                 <option value="ur"   style={{ background: '#12121e' }}>🇵🇰 Urdu</option>
//                 <option value="hi"   style={{ background: '#12121e' }}>🇮🇳 Hindi</option>
//                 <option value="ar"   style={{ background: '#12121e' }}>🇸🇦 Arabic</option>
//                 <option value="fr"   style={{ background: '#12121e' }}>🇫🇷 French</option>
//                 <option value="es"   style={{ background: '#12121e' }}>🇪🇸 Spanish</option>
//               </select>
//             </div>

//             <button onClick={handleUpload} disabled={!uploadFile || uploading} style={{
//               width: '100%', padding: 13, borderRadius: 11,
//               background: uploadFile && !uploading ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'rgba(255,255,255,0.07)',
//               color: uploadFile && !uploading ? 'white' : 'rgba(240,240,255,0.3)',
//               border: 'none', fontSize: 14, fontWeight: 700,
//               cursor: uploadFile && !uploading ? 'pointer' : 'not-allowed',
//               boxShadow: uploadFile && !uploading ? '0 4px 16px rgba(100,87,249,0.4)' : 'none',
//               transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
//             }}>
//               {uploading
//                 ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.7s linear infinite' }} /> Uploading...</>
//                 : '⬆ Upload & Generate Minutes'
//               }
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// // Browser notification
// function triggerNotification(title: string) {
//   if (!('Notification' in window)) return
//   const show = () => {
//     try {
//       new Notification('✅ Meeting Ready — MeetMin AI', {
//         body: `"${title}" minutes are ready. Click to view.`,
//         icon: '/favicon.ico', tag: 'meeting-ready',
//       })
//     } catch {}
//   }
//   if (Notification.permission === 'granted') show()
//   else if (Notification.permission !== 'denied') {
//     Notification.requestPermission().then(p => { if (p === 'granted') show() })
//   }
// }

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Meeting = {
  id: string
  title: string
  date: string
  duration_minutes: number
  status: string
  recording_url: string
  transcript: string
  summary: string
  progress_message?: string
}

const CACHE_KEY = 'meetmin_meetings_v2'

const css = `
  .meetings-scroll::-webkit-scrollbar { width: 4px; }
  .meetings-scroll::-webkit-scrollbar-track { background: transparent; }
  .meetings-scroll::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }

  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .skeleton {
    border-radius: 6px;
    background: linear-gradient(90deg,
      rgba(255,255,255,0.04) 25%,
      rgba(255,255,255,0.09) 50%,
      rgba(255,255,255,0.04) 75%
    );
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.3; transform: scale(1.6); }
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Desktop table layout ── */
  .tbl-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.4fr 0.8fr 0.5fr;
    padding: 13px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(100,87,249,0.06);
  }
  .tbl-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.4fr 0.8fr 0.5fr;
    padding: 14px 20px;
    align-items: center;
    gap: 8px;
    transition: background 0.15s;
  }
  .skeleton-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.4fr 0.8fr 0.5fr;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    align-items: center;
    gap: 8px;
  }

  /* ── Mobile card layout ── */
  @media (max-width: 680px) {
    .tbl-header { display: none !important; }

    .tbl-row {
      display: grid !important;
      grid-template-columns: 1fr auto !important;
      grid-template-rows: auto auto auto !important;
      grid-template-areas:
        "title  del"
        "status status"
        "date   view" !important;
      padding: 14px 16px !important;
      gap: 8px 12px !important;
    }
    .tbl-col-title  { grid-area: title;  white-space: normal !important; font-size: 13px !important; }
    .tbl-col-date   { grid-area: date;   font-size: 11px !important; align-self: center; }
    .tbl-col-dur    { display: none !important; }
    .tbl-col-status { grid-area: status; }
    .tbl-col-view   { grid-area: view;   align-self: center; justify-self: end; }
    .tbl-col-del    { grid-area: del;    align-self: start;  justify-self: end; }

    .skeleton-row {
      grid-template-columns: 1fr auto !important;
      grid-template-rows: auto auto !important;
    }

    .meetings-header-row { flex-wrap: wrap !important; }
    .meetings-header-row h1 { font-size: 17px !important; }
    .meetings-header-btns { gap: 8px !important; }
    .meetings-header-btns button { font-size: 12px !important; padding: 8px 12px !important; }
  }

  @media (max-width: 400px) {
    .meetings-scroll { padding: 16px 12px !important; }
  }
`

function SkeletonRow() {
  return (
    <div className="skeleton-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="skeleton" style={{ height: 14, width: '70%' }} />
      <div className="skeleton" style={{ height: 12, width: '80%' }} />
      <div className="skeleton" style={{ height: 12, width: '50%' }} />
      <div className="skeleton" style={{ height: 22, width: 160, borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 28, width: 60, borderRadius: 7 }} />
      <div className="skeleton" style={{ height: 20, width: 20, borderRadius: 4 }} />
    </div>
  )
}

function ProcessingCell({ message }: { message?: string }) {
  const steps = [
    '📥 Downloading audio file...',
    '🗜 Compressing audio for faster processing...',
    '🎙 Transcribing audio with Whisper AI...',
    '🤖 Generating meeting minutes with LLaMA AI...',
    '💾 Saving minutes to database...',
  ]
  const currentStep = message
    ? steps.findIndex(s => message.startsWith(s.slice(0, 12)))
    : -1
  const progressPct = currentStep === -1 ? 10 : Math.round(((currentStep + 1) / steps.length) * 90)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, animation: 'fade-in 0.3s ease' }}>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(59,130,246,0.2)', overflow: 'hidden', width: '100%' }}>
        <div style={{
          height: '100%', width: `${progressPct}%`,
          background: 'linear-gradient(90deg, #3B82F6, #6457F9)',
          borderRadius: 2, transition: 'width 0.8s ease',
          boxShadow: '0 0 8px rgba(100,87,249,0.5)',
        }} />
      </div>
      <div style={{
        fontSize: 11, color: '#93c5fd',
        display: 'flex', alignItems: 'center', gap: 5,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: '50%', background: '#3B82F6', flexShrink: 0,
          animation: 'pulse-dot 1s ease-in-out infinite',
        }} />
        {message ? message : 'Initialising...'}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; bg: string; dot: string; pulse: boolean }> = {
    pending:    { text: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  dot: '#F59E0B', pulse: false },
    processing: { text: '#3B82F6', bg: 'rgba(59,130,246,0.12)', dot: '#3B82F6', pulse: true  },
    done:       { text: '#22C55E', bg: 'rgba(34,197,94,0.12)',  dot: '#22C55E', pulse: false },
    failed:     { text: '#EF4444', bg: 'rgba(239,68,68,0.12)',  dot: '#EF4444', pulse: false },
  }
  const s = map[status] || map.pending
  return (
    <span style={{
      background: s.bg, color: s.text,
      padding: '4px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block',
        animation: s.pulse ? 'pulse-dot 1s ease-in-out infinite' : 'none',
      }} />
      {status}
    </span>
  )
}

export default function Meetings() {
  const navigate = useNavigate()

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') } catch { return [] }
  })
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading]   = useState(false)
  const [search, setSearch]         = useState('')
  const [language, setLanguage]     = useState('auto')
  const userIdRef = useRef<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        setError('Session expired. Please log in again.')
        setLoading(false)
        return
      }
      const userId = session.user.id
      userIdRef.current = userId

      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      const newChannel = supabase.channel(`meetings-rt-${userId}`)
      channelRef.current = newChannel

      newChannel.on('postgres_changes', { event: '*', schema: 'public', table: 'meetings', filter: `user_id=eq.${userId}` }, (payload) => {
        console.log('📡 Realtime:', payload.eventType, (payload.new as any)?.status)
        if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Meeting
          setMeetings(prev => {
            const next = prev.map(m => m.id === updated.id ? { ...m, ...updated } : m)
            localStorage.setItem(CACHE_KEY, JSON.stringify(next))
            return next
          })
          if (updated.status === 'done') triggerNotification(updated.title)
        }
        if (payload.eventType === 'INSERT') {
          const newM = payload.new as Meeting
          setMeetings(prev => {
            if (prev.find(m => m.id === newM.id)) return prev
            const next = [newM, ...prev]
            localStorage.setItem(CACHE_KEY, JSON.stringify(next))
            return next
          })
        }
        if (payload.eventType === 'DELETE') {
          const deleted = payload.old as { id: string }
          setMeetings(prev => {
            const next = prev.filter(m => m.id !== deleted.id)
            localStorage.setItem(CACHE_KEY, JSON.stringify(next))
            return next
          })
        }
      })

      if (channelRef.current === newChannel) {
        newChannel.subscribe((status) => { console.log('📡 Realtime subscription status:', status) })
      }
      await fetchMeetings(userId)
    }

    init()

    const onOnline  = () => { setIsOffline(false); setError(null); if (userIdRef.current) fetchMeetings(userIdRef.current) }
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('app-online', onOnline)

    return () => {
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null }
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('app-online', onOnline)
    }
  }, [])

  const fetchMeetings = async (userId: string) => {
    try {
      const { data, error: dbErr } = await supabase
        .from('meetings').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      if (dbErr) throw dbErr
      const rows = data || []
      setMeetings(rows)
      localStorage.setItem(CACHE_KEY, JSON.stringify(rows))
      setError(null)
    } catch (err: any) {
      const isNetwork = !navigator.onLine || err.message?.includes('fetch') || err.message?.includes('NetworkError')
      if (!isNetwork) setError('Failed to load: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) return
    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) throw new Error('Not logged in')
      const fileName = `${user.id}/${Date.now()}-${uploadFile.name}`
      const { error: storageErr } = await supabase.storage.from('recordings').upload(fileName, uploadFile)
      if (storageErr) throw storageErr
      const { data: urlData } = supabase.storage.from('recordings').getPublicUrl(fileName)
      const { data: meeting, error: dbErr } = await supabase.from('meetings').insert({
        user_id: user.id,
        title: uploadFile.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        recording_url: urlData.publicUrl,
        status: 'processing',
        progress_message: '📥 Starting upload...',
        date: new Date().toISOString(),
      }).select().single()
      if (dbErr) throw dbErr
      setMeetings(prev => {
        const next = [{ ...meeting } as Meeting, ...prev]
        localStorage.setItem(CACHE_KEY, JSON.stringify(next))
        return next
      })
      setShowUpload(false)
      setUploadFile(null)
      setLanguage('auto')
      fetch(`${import.meta.env.VITE_API_URL}/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ meetingId: meeting.id, fileUrl: urlData.publicUrl, fileName: uploadFile.name, language }),
      }).catch(e => console.warn('Transcribe call:', e.message))
    } catch (err: any) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meeting?')) return
    setMeetings(prev => {
      const next = prev.filter(m => m.id !== id)
      localStorage.setItem(CACHE_KEY, JSON.stringify(next))
      return next
    })
    await supabase.from('meetings').delete().eq('id', id)
  }

  const filtered = meetings.filter(m => m.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="meetings-scroll" style={{
      padding: '24px 28px', fontFamily: "'DM Sans', sans-serif",
      color: '#f0f0ff', height: '100%', overflowY: 'auto', boxSizing: 'border-box',
    }}>
      <style>{css}</style>

      {isOffline && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.28)',
          borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#F59E0B',
        }}>
          📡 Offline — showing cached data. Reconnect to sync.
        </div>
      )}

      {/* Header */}
      <div className="meetings-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 700, color: '#f0f0ff' }}>Meetings</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(240,240,255,0.4)' }}>
            {isOffline ? '🔴 Offline mode' : '📡 Live — status updates automatically'}
          </p>
        </div>
        <div className="meetings-header-btns" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/record')} style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#f87171', padding: '9px 16px', borderRadius: 10,
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>🔴 Record</button>
          <button onClick={() => setShowUpload(true)} style={{
            background: 'linear-gradient(135deg,#6457F9,#8B7FF7)', color: 'white',
            border: 'none', padding: '9px 20px', borderRadius: 10,
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: '0 4px 16px rgba(100,87,249,0.4)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-1px)'; b.style.boxShadow = '0 8px 24px rgba(100,87,249,0.55)' }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = ''; b.style.boxShadow = '0 4px 16px rgba(100,87,249,0.4)' }}
          >⬆ Upload Meeting</button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 18 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,240,255,0.3)', fontSize: 15 }}>🔍</span>
        <input
          placeholder="Search meetings..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '11px 40px 11px 42px', borderRadius: 10,
            border: '1px solid rgba(100,87,249,0.2)', fontSize: 13, outline: 'none',
            background: 'rgba(255,255,255,0.05)', color: '#f0f0ff',
            boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
          }}
          onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.5)'}
          onBlur={e => e.target.style.border = '1px solid rgba(100,87,249,0.2)'}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'rgba(240,240,255,0.4)', cursor: 'pointer', fontSize: 16,
          }}>✕</button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#EF4444', fontSize: 13,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <span>⚠️ {error}</span>
          <button onClick={() => userIdRef.current && fetchMeetings(userIdRef.current)} style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.28)',
            color: '#EF4444', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
          }}>🔄 Retry</button>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', borderRadius: 16,
        border: '1px solid rgba(100,87,249,0.15)',
        overflow: 'hidden', backdropFilter: 'blur(10px)',
      }}>
        {/* Header row */}
        <div className="tbl-header">
          {['Meeting Title', 'Date', 'Duration', 'Status / Progress', 'Minutes', ''].map(h => (
            <div key={h} style={{ fontSize: 10, color: 'rgba(240,240,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
          ))}
        </div>

        {loading && meetings.length === 0
          ? [1, 2, 3].map(n => <SkeletonRow key={n} />)
          : filtered.length === 0
          ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎙</div>
              <p style={{ color: 'rgba(240,240,255,0.4)', fontSize: 14, margin: '0 0 16px' }}>
                {search ? `No meetings match "${search}"` : 'No meetings yet. Upload your first!'}
              </p>
              {!search && (
                <button onClick={() => setShowUpload(true)} style={{
                  background: 'linear-gradient(135deg,#6457F9,#8B7FF7)', border: 'none',
                  color: 'white', padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>⬆ Upload Meeting</button>
              )}
            </div>
          )
          : filtered.map((m, i) => (
            <div
              key={m.id}
              className="tbl-row"
              style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(100,87,249,0.05)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
            >
              {/* Title */}
              <div className="tbl-col-title" style={{ fontSize: 13, fontWeight: 600, color: '#f0f0ff', paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.title}
              </div>

              {/* Date */}
              <div className="tbl-col-date" style={{ fontSize: 12, color: 'rgba(240,240,255,0.5)' }}>
                {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Duration */}
              <div className="tbl-col-dur" style={{ fontSize: 12, color: 'rgba(240,240,255,0.5)' }}>
                {m.duration_minutes ? `${m.duration_minutes} min` : '—'}
              </div>

              {/* Status / Progress */}
              <div className="tbl-col-status">
                {m.status === 'processing' ? (
                  <ProcessingCell message={m.progress_message} />
                ) : (
                  <StatusBadge status={m.status || 'pending'} />
                )}
              </div>

              {/* View button */}
              <button
                className="tbl-col-view"
                onClick={() => { if (m.status === 'done') navigate(`/meetings/${m.id}`) }}
                disabled={m.status !== 'done'}
                style={{
                  background: m.status === 'done' ? 'rgba(100,87,249,0.15)' : 'rgba(255,255,255,0.04)',
                  border: m.status === 'done' ? '1px solid rgba(100,87,249,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  color: m.status === 'done' ? '#a89fff' : 'rgba(240,240,255,0.25)',
                  padding: '5px 13px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  cursor: m.status === 'done' ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                }}
              >View</button>

              {/* Delete */}
              <button
                className="tbl-col-del"
                onClick={() => handleDelete(m.id)}
                style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 4, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)'}
              >🗑</button>
            </div>
          ))
        }
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowUpload(false); setUploadFile(null) } }}
        >
          <div style={{ background: 'rgba(18,18,30,0.98)', borderRadius: 20, padding: 'clamp(20px, 4vw, 32px)', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(100,87,249,0.25)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#f0f0ff' }}>Upload Meeting</h3>
              <button onClick={() => { setShowUpload(false); setUploadFile(null); setLanguage('auto') }} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', width: 30, height: 30, borderRadius: 8, fontSize: 16, cursor: 'pointer', color: 'rgba(240,240,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div
              onClick={() => document.getElementById('meeting-file')?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setUploadFile(f) }}
              style={{ border: `2px dashed ${uploadFile ? 'rgba(100,87,249,0.7)' : 'rgba(100,87,249,0.25)'}`, borderRadius: 14, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', background: uploadFile ? 'rgba(100,87,249,0.08)' : 'rgba(255,255,255,0.02)', marginBottom: 16, transition: 'all 0.2s' }}
            >
              <div style={{ fontSize: 34, marginBottom: 10 }}>🎙</div>
              <p style={{ margin: '0 0 6px', fontWeight: 600, color: uploadFile ? '#a89fff' : 'rgba(240,240,255,0.7)', fontSize: 14 }}>
                {uploadFile ? `✅ ${uploadFile.name}` : 'Click or drag to upload audio/video'}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(240,240,255,0.35)' }}>MP3, MP4, WAV, M4A — max 500MB</p>
              <input id="meeting-file" type="file" accept="audio/*,video/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,240,255,0.5)', display: 'block', marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Audio Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(100,87,249,0.25)', fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.05)', color: '#f0f0ff', cursor: 'pointer', boxSizing: 'border-box' as const }}>
                <option value="auto" style={{ background: '#12121e' }}>🌐 Auto Detect</option>
                <option value="en"   style={{ background: '#12121e' }}>🇺🇸 English</option>
                <option value="ur"   style={{ background: '#12121e' }}>🇵🇰 Urdu</option>
                <option value="hi"   style={{ background: '#12121e' }}>🇮🇳 Hindi</option>
                <option value="ar"   style={{ background: '#12121e' }}>🇸🇦 Arabic</option>
                <option value="fr"   style={{ background: '#12121e' }}>🇫🇷 French</option>
                <option value="es"   style={{ background: '#12121e' }}>🇪🇸 Spanish</option>
              </select>
            </div>

            <button onClick={handleUpload} disabled={!uploadFile || uploading} style={{
              width: '100%', padding: 13, borderRadius: 11,
              background: uploadFile && !uploading ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'rgba(255,255,255,0.07)',
              color: uploadFile && !uploading ? 'white' : 'rgba(240,240,255,0.3)',
              border: 'none', fontSize: 14, fontWeight: 700,
              cursor: uploadFile && !uploading ? 'pointer' : 'not-allowed',
              boxShadow: uploadFile && !uploading ? '0 4px 16px rgba(100,87,249,0.4)' : 'none',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {uploading
                ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.7s linear infinite' }} /> Uploading...</>
                : '⬆ Upload & Generate Minutes'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function triggerNotification(title: string) {
  if (!('Notification' in window)) return
  const show = () => {
    try {
      new Notification('✅ Meeting Ready — MeetMin AI', {
        body: `"${title}" minutes are ready. Click to view.`,
        icon: '/favicon.ico', tag: 'meeting-ready',
      })
    } catch {}
  }
  if (Notification.permission === 'granted') show()
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => { if (p === 'granted') show() })
  }
}