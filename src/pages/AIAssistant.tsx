
// import { useEffect, useRef, useState } from 'react'
// import { supabase } from '../lib/supabase'
// import {
//   BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts'

// // ── Types ──────────────────────────────────────────────────────────────────
// type Visualization = {
//   type: 'bar' | 'line' | 'pie' | 'table'
//   title: string
//   description?: string
//   data?: { name: string; value: number; color?: string }[]
//   xKey?: string
//   yKey?: string
//   columns?: string[]
//   rows?: string[][]
// }

// type Message = {
//   role: 'user' | 'assistant'
//   content: string
//   visualizations: Visualization[]
//   timestamp: Date
// }

// type Meeting = { id: string; title: string; date: string }

// // ── Constants ──────────────────────────────────────────────────────────────
// const COLORS = ['#6457F9', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4']

// const suggestedQuestions = [
//   '📊 Bar chart: Monday=20, Tuesday=15, Wednesday=18, Thursday=25, Friday=100',
//   '🥧 Pie chart: Product=40, Marketing=30, Planning=20, HR=10',
//   '📈 Line chart: Week1=480, Week2=460, Week3=470, Week4=400',
//   '📋 Make a table of all action items from my meetings',
//   '💡 What key decisions were made in my meetings?',
//   '🎯 Who has the most action items?',
//   '📝 Summarize all meetings in bullet points',
//   '🇵🇰 Mere meetings ka summary Roman Urdu mein do',
// ]

// const extractChartFromText = (content: string, question: string): Visualization | null => {
//   const dataPoints: { name: string; value: number; color: string }[] = []
//   const pattern = /(?:\*\s*|-\s*)?([A-Za-z][A-Za-z0-9\s]{1,20}?)[\s]*[:=][\s]*(\d+(?:\.\d+)?)/g
//   let match, colorIndex = 0
//   while ((match = pattern.exec(content)) !== null) {
//     const name = match[1].trim().replace(/\*+/g, '').trim()
//     const value = parseFloat(match[2])
//     if (value > 0 && name.length > 1 && name.length < 25 && !dataPoints.find(p => p.name.toLowerCase() === name.toLowerCase())) {
//       dataPoints.push({ name, value, color: COLORS[colorIndex++ % COLORS.length] })
//     }
//   }
//   if (dataPoints.length < 2) return null
//   const isPie = /pie/i.test(question)
//   const isLine = /line|trend|over time/i.test(question)
//   return {
//     type: isPie ? 'pie' : isLine ? 'line' : 'bar',
//     title: question.length > 50 ? question.substring(0, 50) + '...' : question,
//     description: 'Auto-generated from response',
//     data: dataPoints, xKey: 'name', yKey: 'value'
//   }
// }

// // ── Pie label renderer ─────────────────────────────────────────────────────
// interface PieLabelProps {
//   name?: string
//   percent?: number
// }
// const renderPieLabel = ({ name, percent }: PieLabelProps): string =>
//   `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`

// // ── Chart renderer ─────────────────────────────────────────────────────────
// const VizRenderer = ({ viz }: { viz: Visualization }) => {
//   if (!viz) return null
//   const box: React.CSSProperties = {
//     background: 'rgba(255,255,255,0.04)',
//     borderRadius: 14, padding: 16,
//     border: '1px solid rgba(100,87,249,0.2)',
//     marginTop: 10,
//     boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
//   }

//   if (viz.type === 'table' && viz.columns && viz.rows) {
//     return (
//       <div style={box}>
//         <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#f0f0ff' }}>{viz.title}</h4>
//         <div style={{ overflowX: 'auto' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
//             <thead>
//               <tr style={{ background: 'rgba(100,87,249,0.15)' }}>
//                 {viz.columns.map((col, i) => (
//                   <th key={i} style={{ padding: '9px 12px', textAlign: 'left', color: '#a89fff', fontWeight: 600, borderBottom: '1px solid rgba(100,87,249,0.3)', whiteSpace: 'nowrap' }}>{col}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {viz.rows.map((row, i) => (
//                 <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
//                   {row.map((cell, j) => (
//                     <td key={j} style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(240,240,255,0.7)' }}>{cell}</td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {viz.description && <p style={{ margin: '8px 0 0', fontSize: 11.5, color: 'rgba(240,240,255,0.4)' }}>{viz.description}</p>}
//       </div>
//     )
//   }

//   if (!viz.data?.length) return null

//   const tooltipStyle = { background: 'rgba(18,18,30,0.95)', border: '1px solid rgba(100,87,249,0.3)', borderRadius: 10, fontSize: 12, color: '#f0f0ff' }

//   return (
//     <div style={box}>
//       <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#f0f0ff' }}>{viz.title}</h4>
//       {viz.description && <p style={{ margin: '0 0 10px', fontSize: 11.5, color: 'rgba(240,240,255,0.4)' }}>{viz.description}</p>}
//       <ResponsiveContainer width="100%" height={200}>
//         {viz.type === 'bar' ? (
//           <BarChart data={viz.data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
//             <XAxis dataKey={viz.xKey || 'name'} tick={{ fontSize: 10, fill: 'rgba(240,240,255,0.5)' }} />
//             <YAxis tick={{ fontSize: 10, fill: 'rgba(240,240,255,0.5)' }} />
//             <Tooltip contentStyle={tooltipStyle} />
//             <Bar dataKey={viz.yKey || 'value'} radius={[6, 6, 0, 0]}>
//               {viz.data.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
//             </Bar>
//           </BarChart>
//         ) : viz.type === 'line' ? (
//           <LineChart data={viz.data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
//             <XAxis dataKey={viz.xKey || 'name'} tick={{ fontSize: 10, fill: 'rgba(240,240,255,0.5)' }} />
//             <YAxis tick={{ fontSize: 10, fill: 'rgba(240,240,255,0.5)' }} />
//             <Tooltip contentStyle={tooltipStyle} />
//             <Line type="monotone" dataKey={viz.yKey || 'value'} stroke="#6457F9" strokeWidth={3} dot={{ fill: '#8B7FF7', r: 4 }} activeDot={{ r: 6, fill: '#a89fff' }} />
//           </LineChart>
//         ) : (
//           <PieChart>
//             <Pie data={viz.data} dataKey={viz.yKey || 'value'} nameKey={viz.xKey || 'name'} cx="50%" cy="50%" outerRadius={75}
//               label={renderPieLabel}
//               labelLine={false}>
//               {viz.data.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
//             </Pie>
//             <Tooltip contentStyle={tooltipStyle} />
//             <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: 'rgba(240,240,255,0.6)' }} />
//           </PieChart>
//         )}
//       </ResponsiveContainer>
//     </div>
//   )
// }

// // ── Markdown formatter ─────────────────────────────────────────────────────
// const formatMessage = (content: string) =>
//   content
//     .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c4b8ff">$1</strong>')
//     .replace(/\*(.*?)\*/g, '<em>$1</em>')
//     .replace(/^### (.*)/gm, '<h4 style="margin:10px 0 4px;font-size:14px;color:#f0f0ff">$1</h4>')
//     .replace(/^## (.*)/gm, '<h3 style="margin:12px 0 6px;font-size:15px;color:#f0f0ff">$1</h3>')
//     .replace(/^- (.*)/gm, '<li style="margin:3px 0;padding-left:2px;color:rgba(240,240,255,0.8)">$1</li>')
//     .replace(/^\d+\. (.*)/gm, '<li style="margin:3px 0;color:rgba(240,240,255,0.8)">$1</li>')
//     .replace(/\n\n/g, '<br/><br/>')
//     .replace(/\n/g, '<br/>')

// // ── Scrollbar + responsive styles ─────────────────────────────────────────
// const scrollbarStyle = `
//   .ai-messages::-webkit-scrollbar { width: 4px; }
//   .ai-messages::-webkit-scrollbar-track { background: transparent; }
//   .ai-messages::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }
//   .ai-textarea { resize: none; }
//   @keyframes aiPulse {
//     0%,100% { opacity:0.3; transform:scale(0.85); }
//     50% { opacity:1; transform:scale(1.15); }
//   }

//   /* ── Responsive ── */
//   @media (max-width: 640px) {
//     .ai-header {
//       flex-direction: column !important;
//       gap: 10px !important;
//       padding: 10px 14px !important;
//     }
//     .ai-header-controls {
//       width: 100% !important;
//       justify-content: space-between !important;
//     }
//     .ai-header-controls select {
//       flex: 1 !important;
//       max-width: unset !important;
//       font-size: 11px !important;
//     }
//     .ai-header-controls button {
//       font-size: 11px !important;
//       padding: 6px 10px !important;
//     }
//     .ai-messages {
//       padding: 12px 10px !important;
//       gap: 10px !important;
//     }
//     .ai-bubble {
//       max-width: 90% !important;
//       font-size: 12px !important;
//       padding: 12px 14px !important;
//     }
//     .ai-suggestions {
//       padding: 0 10px 10px !important;
//       gap: 5px !important;
//     }
//     .ai-suggestions button {
//       font-size: 10.5px !important;
//       padding: 5px 9px !important;
//     }
//     .ai-input-bar {
//       padding: 8px 10px !important;
//       gap: 7px !important;
//     }
//     .ai-input-bar textarea {
//       font-size: 12px !important;
//       padding: 9px 11px !important;
//     }
//     .ai-send-btn {
//       width: 36px !important;
//       height: 36px !important;
//       font-size: 14px !important;
//     }
//     .ai-avatar {
//       width: 26px !important;
//       height: 26px !important;
//       font-size: 12px !important;
//     }
//   }

//   @media (min-width: 641px) and (max-width: 1024px) {
//     .ai-header {
//       padding: 12px 18px !important;
//     }
//     .ai-messages {
//       padding: 16px 18px !important;
//     }
//     .ai-input-bar {
//       padding: 10px 18px !important;
//     }
//     .ai-suggestions {
//       padding: 0 18px 10px !important;
//     }
//   }
// `

// // ── Main Component ─────────────────────────────────────────────────────────
// export default function AIAssistant() {
//   const [messages, setMessages] = useState<Message[]>([{
//     role: 'assistant',
//     content: `👋 Hi! I'm your **Notivo AI Assistant** .\n\nI can create:\n- 📊 **Bar charts** for comparisons\n- 📈 **Line charts** for trends\n- 🥧 **Pie charts** for distributions\n- 📋 **Data tables** for structured info\n- 🇵🇰 **Roman Urdu** replies\n\nClick a suggestion or ask anything!`,
//     visualizations: [],
//     timestamp: new Date()
//   }])
//   const [input, setInput] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [meetings, setMeetings] = useState<Meeting[]>([])
//   const [selectedMeeting, setSelectedMeeting] = useState('all')
//   const bottomRef = useRef<HTMLDivElement>(null)

//   // ── FIX: always use localhost (not 127.0.0.1) to match CORS ──
//   const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('127.0.0.1', 'localhost')

//   useEffect(() => { fetchMeetings() }, [])
//   useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

//   const fetchMeetings = async () => {
//     const { data: { session } } = await supabase.auth.getSession()
//     const { data } = await supabase.from('meetings').select('id, title, date')
//       .eq('user_id', session?.user?.id).eq('status', 'done').order('date', { ascending: false })
//     setMeetings(data || [])
//   }

//   const sendMessage = async (text?: string) => {
//     const question = text || input.trim()
//     if (!question || loading) return
//     setMessages(prev => [...prev, { role: 'user', content: question, visualizations: [], timestamp: new Date() }])
//     setInput('')
//     setLoading(true)
//     try {
//       const { data: { session } } = await supabase.auth.getSession()
//       const response = await fetch(`${API_URL}/api/chat`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
//         body: JSON.stringify({ question, meetingId: selectedMeeting !== 'all' ? selectedMeeting : null, allMeetings: selectedMeeting === 'all' })
//       })
//       const data = await response.json()
//       let visualizations: Visualization[] = data.visualizations || []
//       if (visualizations.length === 0 && /chart|graph|bar|pie|line|visual/i.test(question)) {
//         const auto = extractChartFromText(data.answer || '', question)
//         if (auto) visualizations = [auto]
//       }
//       setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'Sorry, could not process that.', visualizations, timestamp: new Date() }])
//     } catch {
//       setMessages(prev => [...prev, { role: 'assistant', content: '❌ Something went wrong. Please try again.', visualizations: [], timestamp: new Date() }])
//     }
//     setLoading(false)
//   }

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'DM Sans',sans-serif", background: 'transparent', color: '#f0f0ff' }}>
//       <style>{scrollbarStyle}</style>

//       {/* ── Header ── */}
//       <div className="ai-header" style={{
//         background: 'rgba(11,11,18,0.8)', backdropFilter: 'blur(20px)',
//         padding: '14px 24px', borderBottom: '1px solid rgba(100,87,249,0.18)',
//         display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//         flexShrink: 0, flexWrap: 'wrap', gap: 8,
//       }}>
//         <div>
//           <h1 style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 700, color: '#f0f0ff', display: 'flex', alignItems: 'center', gap: 8 }}>
//             🤖 AI Assistant
//           </h1>
//           <p style={{ margin: 0, fontSize: 11, color: 'rgba(240,240,255,0.45)' }}>Charts · Tables · Insights · Roman Urdu</p>
//         </div>

//         <div className="ai-header-controls" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//           <select
//             value={selectedMeeting}
//             onChange={e => {
//               setSelectedMeeting(e.target.value)
//               const name = e.target.value === 'all' ? 'All Meetings' : meetings.find(m => m.id === e.target.value)?.title || 'meeting'
//               setMessages(prev => [...prev, { role: 'assistant', content: `✅ Switched to **${name}**. What would you like to know?`, visualizations: [], timestamp: new Date() }])
//             }}
//             style={{
//               padding: '7px 11px', borderRadius: 9, border: '1px solid rgba(100,87,249,0.3)',
//               fontSize: 12, outline: 'none', background: 'rgba(255,255,255,0.05)',
//               color: '#f0f0ff', maxWidth: 200, cursor: 'pointer',
//             }}
//           >
//             <option value="all" style={{ background: '#12121e' }}>🌐 All Meetings</option>
//             {meetings.map(m => (
//               <option key={m.id} value={m.id} style={{ background: '#12121e' }}>
//                 📋 {m.title.length > 28 ? m.title.substring(0, 28) + '...' : m.title}
//               </option>
//             ))}
//           </select>
//           <button
//             onClick={() => setMessages([{ role: 'assistant', content: '🔄 Chat cleared! How can I help?', visualizations: [], timestamp: new Date() }])}
//             style={{
//               background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
//               padding: '7px 12px', borderRadius: 9, fontSize: 12,
//               cursor: 'pointer', color: 'rgba(240,240,255,0.6)', whiteSpace: 'nowrap',
//             }}
//           >🗑 Clear</button>
//         </div>
//       </div>

//       {/* ── Messages ── */}
//       <div className="ai-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
//         {messages.map((msg, i) => (
//           <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
//             <div className="ai-avatar" style={{
//               width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
//               background: msg.role === 'assistant' ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'rgba(255,255,255,0.1)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
//               boxShadow: msg.role === 'assistant' ? '0 4px 12px rgba(100,87,249,0.4)' : 'none',
//             }}>{msg.role === 'assistant' ? '🤖' : '👤'}</div>

//             <div style={{ maxWidth: '80%', minWidth: 0 }}>
//               <div className="ai-bubble" style={{
//                 background: msg.role === 'user' ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'rgba(255,255,255,0.05)',
//                 color: '#f0f0ff',
//                 padding: '12px 16px',
//                 borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
//                 boxShadow: msg.role === 'user' ? '0 4px 16px rgba(100,87,249,0.35)' : '0 2px 8px rgba(0,0,0,0.2)',
//                 border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.07)' : 'none',
//                 fontSize: 13, lineHeight: 1.7, wordBreak: 'break-word',
//               }}>
//                 <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
//                 <div style={{ fontSize: 10, marginTop: 5, opacity: 0.45, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
//                   {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
//                 </div>
//               </div>
//               {msg.visualizations?.map((viz, vi) => <VizRenderer key={vi} viz={viz} />)}
//             </div>
//           </div>
//         ))}

//         {loading && (
//           <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
//             <div className="ai-avatar" style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6457F9,#8B7FF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 4px 12px rgba(100,87,249,0.4)' }}>🤖</div>
//             <div style={{ background: 'rgba(255,255,255,0.05)', padding: '13px 16px', borderRadius: '4px 18px 18px 18px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 5, alignItems: 'center' }}>
//               {[0, 1, 2].map(i => (
//                 <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6457F9', animation: `aiPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
//               ))}
//               <span style={{ fontSize: 12, color: 'rgba(240,240,255,0.4)', marginLeft: 6 }}>Thinking...</span>
//             </div>
//           </div>
//         )}
//         <div ref={bottomRef} />
//       </div>

//       {/* ── Suggested questions ── */}
//       {messages.length <= 2 && (
//         <div className="ai-suggestions" style={{ padding: '0 24px 12px', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
//           {suggestedQuestions.map((q, i) => (
//             <button key={i} onClick={() => sendMessage(q)} style={{
//               background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(100,87,249,0.2)',
//               padding: '6px 12px', borderRadius: 20, fontSize: 11.5, cursor: 'pointer',
//               color: 'rgba(240,240,255,0.6)', fontWeight: 500, transition: 'all 0.2s',
//             }}
//               onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(100,87,249,0.6)'; b.style.color = '#a89fff'; b.style.background = 'rgba(100,87,249,0.1)' }}
//               onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(100,87,249,0.2)'; b.style.color = 'rgba(240,240,255,0.6)'; b.style.background = 'rgba(255,255,255,0.04)' }}
//             >{q}</button>
//           ))}
//         </div>
//       )}

//       {/* ── Input ── */}
//       <div className="ai-input-bar" style={{
//         background: 'rgba(11,11,18,0.8)', backdropFilter: 'blur(20px)',
//         padding: '12px 24px', borderTop: '1px solid rgba(100,87,249,0.15)',
//         display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0,
//       }}>
//         <textarea
//           className="ai-textarea"
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
//           placeholder="Ask anything — charts, tables, analysis, Roman Urdu... (Enter to send)"
//           rows={1}
//           style={{
//             flex: 1, padding: '11px 14px', borderRadius: 12,
//             border: '1px solid rgba(100,87,249,0.25)', fontSize: 13,
//             outline: 'none', resize: 'none', fontFamily: "'DM Sans',sans-serif",
//             boxSizing: 'border-box', maxHeight: 100,
//             background: 'rgba(255,255,255,0.05)', color: '#f0f0ff',
//           }}
//           onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.6)'}
//           onBlur={e => e.target.style.border = '1px solid rgba(100,87,249,0.25)'}
//         />
//         <button
//           className="ai-send-btn"
//           onClick={() => sendMessage()}
//           disabled={!input.trim() || loading}
//           style={{
//             width: 42, height: 42, borderRadius: 11, border: 'none',
//             background: input.trim() && !loading ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'rgba(255,255,255,0.07)',
//             cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 17, flexShrink: 0,
//             boxShadow: input.trim() && !loading ? '0 4px 16px rgba(100,87,249,0.4)' : 'none',
//             transition: 'all 0.2s',
//           }}
//         >➤</button>
//       </div>
//     </div>
//   )
// }
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ── Types ──────────────────────────────────────────────────────────────────
type Visualization = {
  type: 'bar' | 'line' | 'pie' | 'table'
  title: string
  description?: string
  data?: { name: string; value: number; color?: string }[]
  xKey?: string
  yKey?: string
  columns?: string[]
  rows?: string[][]
}

type Message = {
  role: 'user' | 'assistant'
  content: string
  visualizations: Visualization[]
  timestamp: Date
}

type Meeting = { id: string; title: string; date: string }

// ── Constants ──────────────────────────────────────────────────────────────
const COLORS = ['#6457F9', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4']

const suggestedQuestions = [
  '📊 Bar chart: Monday=20, Tuesday=15, Wednesday=18, Thursday=25, Friday=100',
  '🥧 Pie chart: Product=40, Marketing=30, Planning=20, HR=10',
  '📈 Line chart: Week1=480, Week2=460, Week3=470, Week4=400',
  '📋 Make a table of all action items from my meetings',
  '💡 What key decisions were made in my meetings?',
  '🎯 Who has the most action items?',
  '📝 Summarize all meetings in bullet points',
  '🇵🇰 Mere meetings ka summary Roman Urdu mein do',
]

const extractChartFromText = (content: string, question: string): Visualization | null => {
  const dataPoints: { name: string; value: number; color: string }[] = []
  const pattern = /(?:\*\s*|-\s*)?([A-Za-z][A-Za-z0-9\s]{1,20}?)[\s]*[:=][\s]*(\d+(?:\.\d+)?)/g
  let match, colorIndex = 0
  while ((match = pattern.exec(content)) !== null) {
    const name = match[1].trim().replace(/\*+/g, '').trim()
    const value = parseFloat(match[2])
    if (value > 0 && name.length > 1 && name.length < 25 && !dataPoints.find(p => p.name.toLowerCase() === name.toLowerCase())) {
      dataPoints.push({ name, value, color: COLORS[colorIndex++ % COLORS.length] })
    }
  }
  if (dataPoints.length < 2) return null
  const isPie = /pie/i.test(question)
  const isLine = /line|trend|over time/i.test(question)
  return {
    type: isPie ? 'pie' : isLine ? 'line' : 'bar',
    title: question.length > 50 ? question.substring(0, 50) + '...' : question,
    description: 'Auto-generated from response',
    data: dataPoints, xKey: 'name', yKey: 'value'
  }
}

// ── Pie label renderer ─────────────────────────────────────────────────────
interface PieLabelProps {
  name?: string
  percent?: number
}
const renderPieLabel = ({ name, percent }: PieLabelProps): string =>
  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`

// ── Chart renderer ─────────────────────────────────────────────────────────
const VizRenderer = ({ viz }: { viz: Visualization }) => {
  if (!viz) return null
  const box: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 14, padding: 16,
    border: '1px solid rgba(100,87,249,0.2)',
    marginTop: 10,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  }

  if (viz.type === 'table' && viz.columns && viz.rows) {
    return (
      <div style={box}>
        <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#f0f0ff' }}>{viz.title}</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: 'rgba(100,87,249,0.15)' }}>
                {viz.columns.map((col, i) => (
                  <th key={i} style={{ padding: '9px 12px', textAlign: 'left', color: '#a89fff', fontWeight: 600, borderBottom: '1px solid rgba(100,87,249,0.3)', whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viz.rows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(240,240,255,0.7)' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {viz.description && <p style={{ margin: '8px 0 0', fontSize: 11.5, color: 'rgba(240,240,255,0.4)' }}>{viz.description}</p>}
      </div>
    )
  }

  if (!viz.data?.length) return null

  const tooltipStyle = { background: 'rgba(18,18,30,0.95)', border: '1px solid rgba(100,87,249,0.3)', borderRadius: 10, fontSize: 12, color: '#f0f0ff' }

  return (
    <div style={box}>
      <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#f0f0ff' }}>{viz.title}</h4>
      {viz.description && <p style={{ margin: '0 0 10px', fontSize: 11.5, color: 'rgba(240,240,255,0.4)' }}>{viz.description}</p>}
      <ResponsiveContainer width="100%" height={200}>
        {viz.type === 'bar' ? (
          <BarChart data={viz.data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey={viz.xKey || 'name'} tick={{ fontSize: 10, fill: 'rgba(240,240,255,0.5)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(240,240,255,0.5)' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={viz.yKey || 'value'} radius={[6, 6, 0, 0]}>
              {viz.data.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        ) : viz.type === 'line' ? (
          <LineChart data={viz.data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey={viz.xKey || 'name'} tick={{ fontSize: 10, fill: 'rgba(240,240,255,0.5)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(240,240,255,0.5)' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={viz.yKey || 'value'} stroke="#6457F9" strokeWidth={3} dot={{ fill: '#8B7FF7', r: 4 }} activeDot={{ r: 6, fill: '#a89fff' }} />
          </LineChart>
        ) : (
          <PieChart>
            <Pie data={viz.data} dataKey={viz.yKey || 'value'} nameKey={viz.xKey || 'name'} cx="50%" cy="50%" outerRadius={75}
              label={renderPieLabel}
              labelLine={false}>
              {viz.data.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: 'rgba(240,240,255,0.6)' }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

// ── Markdown formatter ─────────────────────────────────────────────────────
const formatMessage = (content: string) =>
  content
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c4b8ff">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*)/gm, '<h4 style="margin:10px 0 4px;font-size:14px;color:#f0f0ff">$1</h4>')
    .replace(/^## (.*)/gm, '<h3 style="margin:12px 0 6px;font-size:15px;color:#f0f0ff">$1</h3>')
    .replace(/^- (.*)/gm, '<li style="margin:3px 0;padding-left:2px;color:rgba(240,240,255,0.8)">$1</li>')
    .replace(/^\d+\. (.*)/gm, '<li style="margin:3px 0;color:rgba(240,240,255,0.8)">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')

// ── Scrollbar + responsive styles ─────────────────────────────────────────
const scrollbarStyle = `
  .ai-messages::-webkit-scrollbar { width: 4px; }
  .ai-messages::-webkit-scrollbar-track { background: transparent; }
  .ai-messages::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }
  .ai-textarea { resize: none; }
  @keyframes aiPulse {
    0%,100% { opacity:0.3; transform:scale(0.85); }
    50% { opacity:1; transform:scale(1.15); }
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .ai-header {
      flex-direction: column !important;
      gap: 10px !important;
      padding: 10px 14px !important;
    }
    .ai-header-controls {
      width: 100% !important;
      justify-content: space-between !important;
    }
    .ai-header-controls select {
      flex: 1 !important;
      max-width: unset !important;
      font-size: 11px !important;
    }
    .ai-header-controls button {
      font-size: 11px !important;
      padding: 6px 10px !important;
    }
    .ai-messages {
      padding: 12px 10px !important;
      gap: 10px !important;
    }
    .ai-bubble {
      max-width: 90% !important;
      font-size: 12px !important;
      padding: 12px 14px !important;
    }
    .ai-suggestions {
      padding: 0 10px 10px !important;
      gap: 5px !important;
    }
    .ai-suggestions button {
      font-size: 10.5px !important;
      padding: 5px 9px !important;
    }
    .ai-input-bar {
      padding: 8px 10px !important;
      gap: 7px !important;
    }
    .ai-input-bar textarea {
      font-size: 12px !important;
      padding: 9px 11px !important;
    }
    .ai-send-btn {
      width: 36px !important;
      height: 36px !important;
      font-size: 14px !important;
    }
    .ai-avatar {
      width: 26px !important;
      height: 26px !important;
      font-size: 12px !important;
    }
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .ai-header {
      padding: 12px 18px !important;
    }
    .ai-messages {
      padding: 16px 18px !important;
    }
    .ai-input-bar {
      padding: 10px 18px !important;
    }
    .ai-suggestions {
      padding: 0 18px 10px !important;
    }
  }
`

// ── Main Component ─────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: `👋 Hi! I'm your **Notivo AI Assistant** .\n\nI can create:\n- 📊 **Bar charts** for comparisons\n- 📈 **Line charts** for trends\n- 🥧 **Pie charts** for distributions\n- 📋 **Data tables** for structured info\n- 🇵🇰 **Roman Urdu** replies\n\nClick a suggestion or ask anything!`,
    visualizations: [],
    timestamp: new Date()
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState('all')
  const bottomRef = useRef<HTMLDivElement>(null)

  // ── FIX: always use localhost (not 127.0.0.1) to match CORS ──
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('127.0.0.1', 'localhost')

  useEffect(() => { fetchMeetings() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchMeetings = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const { data } = await supabase.from('meetings').select('id, title, date')
      .eq('user_id', session?.user?.id).eq('status', 'done').order('date', { ascending: false })
    setMeetings(data || [])
  }

  const sendMessage = async (text?: string) => {
    const question = text || input.trim()
    if (!question || loading) return
    setMessages(prev => [...prev, { role: 'user', content: question, visualizations: [], timestamp: new Date() }])
    setInput('')
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ question, meetingId: selectedMeeting !== 'all' ? selectedMeeting : null, allMeetings: selectedMeeting === 'all' })
      })
      const data = await response.json()
      let visualizations: Visualization[] = data.visualizations || []
      if (visualizations.length === 0 && /chart|graph|bar|pie|line|visual/i.test(question)) {
        const auto = extractChartFromText(data.answer || '', question)
        if (auto) visualizations = [auto]
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'Sorry, could not process that.', visualizations, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Something went wrong. Please try again.', visualizations: [], timestamp: new Date() }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'DM Sans',sans-serif", background: 'transparent', color: '#f0f0ff' }}>
      <style>{scrollbarStyle}</style>

      {/* ── Header ── */}
      <div className="ai-header" style={{
        background: 'rgba(11,11,18,0.8)', backdropFilter: 'blur(20px)',
        padding: '14px 24px', borderBottom: '1px solid rgba(100,87,249,0.18)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0, flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 700, color: '#f0f0ff', display: 'flex', alignItems: 'center', gap: 8 }}>
            🤖 AI Assistant
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(240,240,255,0.45)' }}>Charts · Tables · Insights · Roman Urdu</p>
        </div>

        <div className="ai-header-controls" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={selectedMeeting}
            onChange={e => {
              setSelectedMeeting(e.target.value)
              const name = e.target.value === 'all' ? 'All Meetings' : meetings.find(m => m.id === e.target.value)?.title || 'meeting'
              setMessages(prev => [...prev, { role: 'assistant', content: `✅ Switched to **${name}**. What would you like to know?`, visualizations: [], timestamp: new Date() }])
            }}
            style={{
              padding: '7px 11px', borderRadius: 9, border: '1px solid rgba(100,87,249,0.3)',
              fontSize: 12, outline: 'none', background: 'rgba(255,255,255,0.05)',
              color: '#f0f0ff', maxWidth: 200, cursor: 'pointer',
            }}
          >
            <option value="all" style={{ background: '#12121e' }}>🌐 All Meetings</option>
            {meetings.map(m => (
              <option key={m.id} value={m.id} style={{ background: '#12121e' }}>
                📋 {m.title.length > 28 ? m.title.substring(0, 28) + '...' : m.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => setMessages([{ role: 'assistant', content: '🔄 Chat cleared! How can I help?', visualizations: [], timestamp: new Date() }])}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              padding: '7px 12px', borderRadius: 9, fontSize: 12,
              cursor: 'pointer', color: 'rgba(240,240,255,0.6)', whiteSpace: 'nowrap',
            }}
          >🗑 Clear</button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="ai-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <div className="ai-avatar" style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'assistant' ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              boxShadow: msg.role === 'assistant' ? '0 4px 12px rgba(100,87,249,0.4)' : 'none',
            }}>{msg.role === 'assistant' ? '🤖' : '👤'}</div>

            <div style={{ maxWidth: '80%', minWidth: 0 }}>
              <div className="ai-bubble" style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'rgba(255,255,255,0.05)',
                color: '#f0f0ff',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                boxShadow: msg.role === 'user' ? '0 4px 16px rgba(100,87,249,0.35)' : '0 2px 8px rgba(0,0,0,0.2)',
                border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.07)' : 'none',
                fontSize: 13, lineHeight: 1.7, wordBreak: 'break-word',
              }}>
                <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                <div style={{ fontSize: 10, marginTop: 5, opacity: 0.45, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.visualizations?.map((viz, vi) => <VizRenderer key={vi} viz={viz} />)}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div className="ai-avatar" style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6457F9,#8B7FF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 4px 12px rgba(100,87,249,0.4)' }}>🤖</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '13px 16px', borderRadius: '4px 18px 18px 18px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6457F9', animation: `aiPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
              <span style={{ fontSize: 12, color: 'rgba(240,240,255,0.4)', marginLeft: 6 }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggested questions ── */}
      {messages.length <= 2 && (
        <div className="ai-suggestions" style={{ padding: '0 24px 12px', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {suggestedQuestions.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(100,87,249,0.2)',
              padding: '6px 12px', borderRadius: 20, fontSize: 11.5, cursor: 'pointer',
              color: 'rgba(240,240,255,0.6)', fontWeight: 500, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(100,87,249,0.6)'; b.style.color = '#a89fff'; b.style.background = 'rgba(100,87,249,0.1)' }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(100,87,249,0.2)'; b.style.color = 'rgba(240,240,255,0.6)'; b.style.background = 'rgba(255,255,255,0.04)' }}
            >{q}</button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="ai-input-bar" style={{
        background: 'rgba(11,11,18,0.8)', backdropFilter: 'blur(20px)',
        padding: '12px 24px', borderTop: '1px solid rgba(100,87,249,0.15)',
        display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0,
      }}>
        <textarea
          className="ai-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder="Ask anything — charts, tables, analysis, Roman Urdu... (Enter to send)"
          rows={1}
          style={{
            flex: 1, padding: '11px 14px', borderRadius: 12,
            border: '1px solid rgba(100,87,249,0.25)', fontSize: 13,
            outline: 'none', resize: 'none', fontFamily: "'DM Sans',sans-serif",
            boxSizing: 'border-box', maxHeight: 100,
            background: 'rgba(255,255,255,0.05)', color: '#f0f0ff',
          }}
          onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.6)'}
          onBlur={e => e.target.style.border = '1px solid rgba(100,87,249,0.25)'}
        />
        <button
          className="ai-send-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            width: 42, height: 42, borderRadius: 11, border: 'none',
            background: input.trim() && !loading ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'rgba(255,255,255,0.07)',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, flexShrink: 0,
            boxShadow: input.trim() && !loading ? '0 4px 16px rgba(100,87,249,0.4)' : 'none',
            transition: 'all 0.2s',
          }}
        >➤</button>
      </div>
    </div>
  )
}
