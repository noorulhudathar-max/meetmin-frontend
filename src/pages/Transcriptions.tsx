// import { useEffect, useState } from 'react'
// import { supabase } from '../lib/supabase'

// interface Transcription {
//   id: string
//   title: string
//   content: string
//   meeting_date: string
// }

// const customScrollbar = `
//   .transcripts-container::-webkit-scrollbar { width: 4px; }
//   .transcripts-container::-webkit-scrollbar-track { background: transparent; }
//   .transcripts-container::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }
//   .reader-pane::-webkit-scrollbar { width: 4px; }
//   .reader-pane::-webkit-scrollbar-track { background: transparent; }
//   .reader-pane::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }
// `

// export default function TranscriptionsPage() {
//   const [transcripts, setTranscripts] = useState<Transcription[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedTranscript, setSelectedTranscript] = useState<Transcription | null>(null)

//   useEffect(() => {
//     fetchTranscriptions()
//   }, [])

//   const fetchTranscriptions = async () => {
//     const { data: { user } } = await supabase.auth.getUser()
//     if (!user) return

//     const { data, error } = await supabase
//       .from('transcriptions')
//       .select('*')
//       .order('meeting_date', { ascending: false })

//     if (!error && data) setTranscripts(data)
//     setLoading(false)
//   }

//   const surface = 'rgba(255,255,255,0.04)'
//   const borderP = '1px solid rgba(100,87,249,0.18)'

//   return (
//     <div style={{
//       padding: '32px 40px',
//       background: 'radial-gradient(circle at 50% 0%, #141233 0%, #070610 100%)',
//       minHeight: '100vh',
//       color: '#f0f0ff',
//       fontFamily: "'DM Sans', sans-serif",
//       boxSizing: 'border-box'
//     }}>
//       <style>{customScrollbar}</style>

//       {/* Header Area */}
//       <div style={{ marginBottom: 32 }}>
//         <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px 0', color: '#f0f0ff', letterSpacing: '-0.02em' }}>
//           📝 Saved Transcriptions
//         </h1>
//         <p style={{ color: 'rgba(240,240,255,0.45)', fontSize: 13.5, margin: 0 }}>
//           Review your historical records, translations, and raw workspace insights.
//         </p>
//       </div>

//       {loading ? (
//         <div style={{ color: '#8B7FF7', fontSize: 14, fontWeight: 500 }}>⏳ Syncing with database matrix...</div>
//       ) : (
//         /* The main flexible dashboard columns */
//         <div style={{ 
//           display: 'grid', 
//           gridTemplateColumns: selectedTranscript ? 'minmax(300px, 400px) 1fr' : '1fr', 
//           gap: '24px',
//           alignItems: 'start'
//         }}>
          
//           {/* Left/Main Column: Transcripts Grid List */}
//           <div className="transcripts-container" style={{ 
//             display: 'flex', 
//             flexDirection: 'column', 
//             gap: 12,
//             maxHeight: 'calc(100vh - 160px)',
//             overflowY: 'auto',
//             paddingRight: 4
//           }}>
//             {transcripts.map((t) => {
//               const isActive = selectedTranscript?.id === t.id
//               return (
//                 <div 
//                   key={t.id} 
//                   onClick={() => setSelectedTranscript(t)}
//                   style={{
//                     background: isActive ? 'rgba(100,87,249,0.1)' : surface,
//                     border: isActive ? '1px solid #6457F9' : '1px solid rgba(255,255,255,0.06)',
//                     borderRadius: 14,
//                     padding: '18px 20px',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s',
//                     backdropFilter: 'blur(12px)',
//                     boxShadow: isActive ? '0 4px 20px rgba(100,87,249,0.15)' : 'none'
//                   }}
//                   onMouseEnter={e => {
//                     if (!isActive) e.currentTarget.style.borderColor = 'rgba(100,87,249,0.3)'
//                   }}
//                   onMouseLeave={e => {
//                     if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
//                   }}
//                 >
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
//                     <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: '#f0f0ff', lineHeight: 1.4 }}>
//                       {t.title}
//                     </h3>
//                     <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.35)', whiteSpace: 'nowrap', marginTop: 2 }}>
//                       {new Date(t.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                     </span>
//                   </div>
//                   <p style={{ 
//                     fontSize: 13, 
//                     color: 'rgba(240,240,255,0.5)', 
//                     margin: 0, 
//                     overflow: 'hidden', 
//                     textOverflow: 'ellipsis', 
//                     display: '-webkit-box',
//                     WebkitLineClamp: 2,
//                     WebkitBoxOrient: 'vertical',
//                     lineHeight: 1.5
//                   }}>
//                     {t.content}
//                   </p>
//                 </div>
//               )
//             })}
            
//             {transcripts.length === 0 && (
//               <div style={{ padding: '40px', background: surface, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
//                 <span style={{ fontSize: 24 }}>📁</span>
//                 <p style={{ color: 'rgba(240,240,255,0.4)', fontSize: 13.5, margin: '8px 0 0 0' }}>No transcription logs discovered inside database layers.</p>
//               </div>
//             )}
//           </div>

//           {/* Right Column: Expanded Dynamic Text Document Reader View */}
//           {selectedTranscript && (
//             <div className="reader-pane" style={{
//               background: 'rgba(10, 10, 25, 0.5)',
//               border: borderP,
//               borderRadius: 16,
//               padding: '24px 28px',
//               backdropFilter: 'blur(20px)',
//               maxHeight: 'calc(100vh - 160px)',
//               overflowY: 'auto',
//               boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
//               position: 'sticky',
//               top: 0
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
//                 <div>
//                   <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: '#f0f0ff' }}>{selectedTranscript.title}</h2>
//                   <span style={{ fontSize: 12, color: '#8B7FF7' }}>
//                     📅 Date: {new Date(selectedTranscript.meeting_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
//                   </span>
//                 </div>
//                 <button 
//                   onClick={() => setSelectedTranscript(null)}
//                   style={{ 
//                     background: 'rgba(255,255,255,0.05)', 
//                     border: '1px solid rgba(255,255,255,0.08)', 
//                     color: 'rgba(240,240,255,0.6)', 
//                     cursor: 'pointer', 
//                     padding: '6px 12px', 
//                     borderRadius: 8, 
//                     fontSize: 12,
//                     fontWeight: 500,
//                     transition: 'all 0.2s'
//                   }}
//                   onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
//                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
//                 >✕ Close Panel</button>
//               </div>
              
//               <p style={{ 
//                 fontSize: 13.5, 
//                 color: 'rgba(240,240,255,0.8)', 
//                 lineHeight: 1.8, 
//                 whiteSpace: 'pre-wrap', 
//                 margin: 0,
//                 letterSpacing: '0.01em'
//               }}>
//                 {selectedTranscript.content}
//               </p>
//             </div>
//           )}

//         </div>
//       )}
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Transcription {
  id: string
  title: string
  content: string
  meeting_date: string
}

const customScrollbar = `
  .transcripts-container::-webkit-scrollbar { width: 4px; }
  .transcripts-container::-webkit-scrollbar-track { background: transparent; }
  .transcripts-container::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }
  .reader-pane::-webkit-scrollbar { width: 4px; }
  .reader-pane::-webkit-scrollbar-track { background: transparent; }
  .reader-pane::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }

  .transcripts-layout {
    display: grid;
    gap: 24px;
    align-items: start;
  }
  .transcripts-layout.has-selection {
    grid-template-columns: minmax(300px, 400px) 1fr;
  }
  .transcripts-layout.no-selection {
    grid-template-columns: 1fr;
  }
  .reader-sticky {
    position: sticky;
    top: 0;
  }

  @media (max-width: 768px) {
    .transcripts-layout.has-selection {
      grid-template-columns: 1fr !important;
    }
    .reader-sticky {
      position: relative !important;
      top: auto !important;
    }
    .transcripts-container {
      max-height: none !important;
    }
  }
  @media (max-width: 480px) {
    .transcripts-page-wrap {
      padding: 20px 16px !important;
    }
  }
`

export default function TranscriptionsPage() {
  const [transcripts, setTranscripts] = useState<Transcription[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTranscript, setSelectedTranscript] = useState<Transcription | null>(null)

  useEffect(() => {
    fetchTranscriptions()
  }, [])

  const fetchTranscriptions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('transcriptions')
      .select('*')
      .order('meeting_date', { ascending: false })

    if (!error && data) setTranscripts(data)
    setLoading(false)
  }

  const surface = 'rgba(255,255,255,0.04)'
  const borderP = '1px solid rgba(100,87,249,0.18)'

  return (
    <div
      className="transcripts-page-wrap"
      style={{
        padding: '32px 40px',
        background: 'radial-gradient(circle at 50% 0%, #141233 0%, #070610 100%)',
        minHeight: '100vh',
        color: '#f0f0ff',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <style>{customScrollbar}</style>

      {/* Header Area */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, margin: '0 0 6px 0', color: '#f0f0ff', letterSpacing: '-0.02em' }}>
          📝 Saved Transcriptions
        </h1>
        <p style={{ color: 'rgba(240,240,255,0.45)', fontSize: 13.5, margin: 0 }}>
          Review your historical records, translations, and raw workspace insights.
        </p>
      </div>

      {loading ? (
        <div style={{ color: '#8B7FF7', fontSize: 14, fontWeight: 500 }}>⏳ Syncing with database matrix...</div>
      ) : (
        <div className={`transcripts-layout ${selectedTranscript ? 'has-selection' : 'no-selection'}`}>

          {/* Left/Main Column: Transcripts Grid List */}
          <div className="transcripts-container" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            paddingRight: 4,
          }}>
            {transcripts.map((t) => {
              const isActive = selectedTranscript?.id === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTranscript(isActive ? null : t)}
                  style={{
                    background: isActive ? 'rgba(100,87,249,0.1)' : surface,
                    border: isActive ? '1px solid #6457F9' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14,
                    padding: '18px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(12px)',
                    boxShadow: isActive ? '0 4px 20px rgba(100,87,249,0.15)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.borderColor = 'rgba(100,87,249,0.3)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: '#f0f0ff', lineHeight: 1.4 }}>
                      {t.title}
                    </h3>
                    <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.35)', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {new Date(t.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 13,
                    color: 'rgba(240,240,255,0.5)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.5,
                  }}>
                    {t.content}
                  </p>
                </div>
              )
            })}

            {transcripts.length === 0 && (
              <div style={{ padding: '40px', background: surface, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ fontSize: 24 }}>📁</span>
                <p style={{ color: 'rgba(240,240,255,0.4)', fontSize: 13.5, margin: '8px 0 0 0' }}>No transcription logs discovered inside database layers.</p>
              </div>
            )}
          </div>

          {/* Right Column: Reader pane */}
          {selectedTranscript && (
            <div className="reader-pane reader-sticky" style={{
              background: 'rgba(10, 10, 25, 0.5)',
              border: borderP,
              borderRadius: 16,
              padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 28px)',
              backdropFilter: 'blur(20px)',
              maxHeight: 'calc(100vh - 160px)',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', fontWeight: 700, margin: '0 0 4px 0', color: '#f0f0ff', wordBreak: 'break-word' }}>{selectedTranscript.title}</h2>
                  <span style={{ fontSize: 12, color: '#8B7FF7' }}>
                    📅 Date: {new Date(selectedTranscript.meeting_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTranscript(null)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(240,240,255,0.6)',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >✕ Close Panel</button>
              </div>

              <p style={{
                fontSize: 13.5,
                color: 'rgba(240,240,255,0.8)',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                margin: 0,
                letterSpacing: '0.01em',
                wordBreak: 'break-word',
              }}>
                {selectedTranscript.content}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}