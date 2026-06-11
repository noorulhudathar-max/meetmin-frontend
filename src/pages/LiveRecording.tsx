// import { useEffect, useRef, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { supabase } from '../lib/supabase'

// type RecordingState = 'idle' | 'recording' | 'paused' | 'uploading' | 'processing' | 'done' | 'error'

// export default function LiveRecording() {
//   const navigate = useNavigate()
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const chunksRef = useRef<Blob[]>([])
//   const streamRef = useRef<MediaStream | null>(null)
//   const timerRef = useRef<NodeJS.Timeout | null>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const analyserRef = useRef<AnalyserNode | null>(null)
//   const animRef = useRef<number>(0)

//   const [state, setState] = useState<RecordingState>('idle')
//   const [seconds, setSeconds] = useState(0)
//   const [language, setLanguage] = useState('auto')
//   const [meetingTitle, setMeetingTitle] = useState('')
//   const [error, setError] = useState('')
//   const [meetingId, setMeetingId] = useState('')
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null)

//   useEffect(() => {
//     checkPermission()
//     return () => {
//       cleanup()
//     }
//   }, [])

//   const checkPermission = async () => {
//     try {
//       const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
//       setHasPermission(result.state === 'granted')
//       result.onchange = () => setHasPermission(result.state === 'granted')
//     } catch {
//       setHasPermission(null)
//     }
//   }

//   const cleanup = () => {
//     if (timerRef.current) clearInterval(timerRef.current)
//     if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
//     cancelAnimationFrame(animRef.current)
//   }

//   const drawWaveform = () => {
//     const canvas = canvasRef.current
//     const analyser = analyserRef.current
//     if (!canvas || !analyser) return
//     const ctx = canvas.getContext('2d')
//     if (!ctx) return

//     const bufferLength = analyser.frequencyBinCount
//     const dataArray = new Uint8Array(bufferLength)

//     const draw = () => {
//       animRef.current = requestAnimationFrame(draw)
//       analyser.getByteTimeDomainData(dataArray)
//       ctx.clearRect(0, 0, canvas.width, canvas.height)

//       ctx.lineWidth = 2
//       ctx.strokeStyle = '#6457F9'
//       ctx.beginPath()

//       const sliceWidth = canvas.width / bufferLength
//       let x = 0
//       for (let i = 0; i < bufferLength; i++) {
//         const v = dataArray[i] / 128.0
//         const y = (v * canvas.height) / 2
//         if (i === 0) ctx.moveTo(x, y)
//         else ctx.lineTo(x, y)
//         x += sliceWidth
//       }
//       ctx.lineTo(canvas.width, canvas.height / 2)
//       ctx.stroke()
//     }
//     draw()
//   }

//   const startRecording = async () => {
//     setError('')
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       streamRef.current = stream
//       setHasPermission(true)

//       // Set up audio analyser for waveform
//       const audioCtx = new AudioContext()
//       const source = audioCtx.createMediaStreamSource(stream)
//       const analyser = audioCtx.createAnalyser()
//       analyser.fftSize = 2048
//       source.connect(analyser)
//       analyserRef.current = analyser

//       const mediaRecorder = new MediaRecorder(stream, {
//         mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
//           ? 'audio/webm;codecs=opus'
//           : 'audio/webm'
//       })
//       mediaRecorderRef.current = mediaRecorder
//       chunksRef.current = []

//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data.size > 0) chunksRef.current.push(e.data)
//       }

//       mediaRecorder.start(1000) // Collect data every second
//       setState('recording')
//       setSeconds(0)

//       timerRef.current = setInterval(() => {
//         setSeconds(s => s + 1)
//       }, 1000)

//       drawWaveform()
//     } catch (err: any) {
//       setError('Microphone access denied. Please allow microphone access in your browser settings.')
//       setHasPermission(false)
//     }
//   }

//   const pauseRecording = () => {
//     if (mediaRecorderRef.current?.state === 'recording') {
//       mediaRecorderRef.current.pause()
//       setState('paused')
//       if (timerRef.current) clearInterval(timerRef.current)
//       cancelAnimationFrame(animRef.current)
//     }
//   }

//   const resumeRecording = () => {
//     if (mediaRecorderRef.current?.state === 'paused') {
//       mediaRecorderRef.current.resume()
//       setState('recording')
//       timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
//       drawWaveform()
//     }
//   }

//   const stopAndUpload = async () => {
//     if (!mediaRecorderRef.current) return
//     cleanup()
//     setState('uploading')

//     mediaRecorderRef.current.stop()

//     // Wait for final data
//     await new Promise<void>(resolve => {
//       if (mediaRecorderRef.current) {
//         mediaRecorderRef.current.onstop = () => resolve()
//       } else resolve()
//     })

//     try {
//       const { data: { session } } = await supabase.auth.getSession()
//       if (!session) throw new Error('Not logged in')

//       const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
//       const title = meetingTitle || `Recording ${new Date().toLocaleDateString()}`
//       const fileName = `${session.user.id}/${Date.now()}-${title.replace(/\s+/g, '-')}.webm`

//       // Upload to Supabase Storage
//       const { error: storageError } = await supabase.storage
//         .from('recordings')
//         .upload(fileName, blob, { contentType: 'audio/webm' })
//       if (storageError) throw storageError

//       const { data: urlData } = supabase.storage.from('recordings').getPublicUrl(fileName)

//       // Insert meeting row
//       const { data: meeting, error: dbError } = await supabase
//         .from('meetings')
//         .insert({
//           user_id: session.user.id,
//           title,
//           recording_url: urlData.publicUrl,
//           status: 'processing',
//           date: new Date().toISOString(),
//           duration_minutes: Math.round(seconds / 60)
//         })
//         .select().single()
//       if (dbError) throw dbError

//       setMeetingId(meeting.id)
//       setState('processing')

//       // Trigger backend transcription
//       await fetch(`${import.meta.env.VITE_API_URL}/api/transcribe`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session.access_token}`
//         },
//         body: JSON.stringify({
//           meetingId: meeting.id,
//           fileUrl: urlData.publicUrl,
//           fileName: `${title}.webm`,
//           language
//         })
//       })

//       setState('done')
//     } catch (err: any) {
//       setError(err.message)
//       setState('error')
//     }
//   }

//   const formatTime = (s: number) => {
//     const m = Math.floor(s / 60)
//     const sec = s % 60
//     return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
//   }

//   const resetRecording = () => {
//     cleanup()
//     setState('idle')
//     setSeconds(0)
//     setError('')
//     setMeetingId('')
//     chunksRef.current = []
//   }

//   return (
//     <div style={{
//       minHeight: '100vh', padding: 'clamp(16px, 3vw, 32px)',
//       fontFamily: "'DM Sans', sans-serif",
//       background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)',
//       display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
//     }}>
//       <div style={{ maxWidth: '560px', width: '100%' }}>

//         {/* Header */}
//         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
//           <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
//             🎙 Live Recording
//           </h1>
//           <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>
//             Record your meeting directly in the browser. When you stop, AI will transcribe and generate minutes automatically.
//           </p>
//         </div>

//         {/* Main card */}
//         <div style={{
//           background: 'rgba(255,255,255,0.03)',
//           border: '1px solid rgba(255,255,255,0.08)',
//           borderRadius: '24px', padding: '32px',
//           backdropFilter: 'blur(20px)',
//           textAlign: 'center'
//         }}>

//           {/* Error */}
//           {error && (
//             <div style={{
//               background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
//               borderRadius: '10px', padding: '12px 16px', color: '#ef4444',
//               fontSize: '13.5px', marginBottom: '20px', textAlign: 'left'
//             }}>{error}</div>
//           )}

//           {/* Meeting title input */}
//           {(state === 'idle' || state === 'error') && (
//             <div style={{ marginBottom: '20px', textAlign: 'left' }}>
//               <label style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '7px', fontWeight: '500' }}>
//                 Meeting Title (optional)
//               </label>
//               <input
//                 value={meetingTitle}
//                 onChange={e => setMeetingTitle(e.target.value)}
//                 placeholder="e.g. Weekly Team Standup"
//                 style={{
//                   width: '100%', padding: '11px 14px', borderRadius: '10px',
//                   border: '1px solid rgba(255,255,255,0.1)', fontSize: '13.5px',
//                   outline: 'none', background: 'rgba(255,255,255,0.05)',
//                   color: 'white', fontFamily: "'DM Sans', sans-serif",
//                   boxSizing: 'border-box'
//                 }}
//               />
//             </div>
//           )}

//           {/* Language selector */}
//           {(state === 'idle' || state === 'error') && (
//             <div style={{ marginBottom: '28px', textAlign: 'left' }}>
//               <label style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '7px', fontWeight: '500' }}>
//                 Recording Language
//               </label>
//               <select value={language} onChange={e => setLanguage(e.target.value)} style={{
//                 width: '100%', padding: '11px 14px', borderRadius: '10px',
//                 border: '1px solid rgba(255,255,255,0.1)', fontSize: '13.5px',
//                 outline: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer'
//               }}>
//                 <option value="auto" style={{ background: '#1a0f2e' }}>🌐 Auto Detect</option>
//                 <option value="en" style={{ background: '#1a0f2e' }}>🇺🇸 English</option>
//                 <option value="ur" style={{ background: '#1a0f2e' }}>🇵🇰 Urdu</option>
//                 <option value="hi" style={{ background: '#1a0f2e' }}>🇮🇳 Hindi</option>
//                 <option value="ar" style={{ background: '#1a0f2e' }}>🇸🇦 Arabic</option>
//               </select>
//             </div>
//           )}

//           {/* Timer */}
//           {(state === 'recording' || state === 'paused') && (
//             <div style={{ marginBottom: '24px' }}>
//               <div style={{
//                 fontSize: '56px', fontWeight: '800', color: 'white',
//                 letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums'
//               }}>{formatTime(seconds)}</div>
//               <div style={{ fontSize: '13px', color: state === 'recording' ? '#ef4444' : 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
//                 {state === 'recording' ? '🔴 Recording...' : '⏸ Paused'}
//               </div>
//             </div>
//           )}

//           {/* Waveform canvas */}
//           {(state === 'recording' || state === 'paused') && (
//             <canvas ref={canvasRef} width={460} height={80} style={{
//               width: '100%', height: '80px', borderRadius: '10px',
//               background: 'rgba(100,87,249,0.05)', border: '1px solid rgba(100,87,249,0.15)',
//               marginBottom: '24px'
//             }} />
//           )}

//           {/* Recording pulse indicator */}
//           {state === 'recording' && (
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
//               <div style={{
//                 width: '10px', height: '10px', borderRadius: '50%',
//                 background: '#ef4444', animation: 'pulse-red 1s ease-in-out infinite'
//               }} />
//               <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Live recording in progress</span>
//             </div>
//           )}

//           {/* States: uploading, processing, done */}
//           {state === 'uploading' && (
//             <div style={{ padding: '20px', marginBottom: '16px' }}>
//               <div style={{ fontSize: '40px', marginBottom: '12px' }}>⬆️</div>
//               <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>Uploading recording...</div>
//               <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Please wait while we upload your audio</div>
//             </div>
//           )}

//           {state === 'processing' && (
//             <div style={{ padding: '20px', marginBottom: '16px' }}>
//               <div style={{ fontSize: '40px', marginBottom: '12px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🤖</div>
//               <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>AI is processing your recording...</div>
//               <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '16px' }}>Transcribing with Groq Whisper → Generating minutes with LLaMA</div>
//               <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px' }}>
//                 This may take 1-3 minutes depending on recording length. You'll receive an email when ready.
//               </div>
//             </div>
//           )}

//           {state === 'done' && (
//             <div style={{ padding: '20px', marginBottom: '16px' }}>
//               <div style={{ fontSize: '50px', marginBottom: '12px' }}>🎉</div>
//               <div style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Recording uploaded!</div>
//               <div style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.55)', marginBottom: '24px' }}>
//                 AI is generating your minutes in the background. You'll get an email when ready.
//               </div>
//               <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
//                 <button onClick={() => navigate('/meetings')} style={{
//                   background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
//                   border: 'none', color: 'white', padding: '12px 24px',
//                   borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
//                 }}>📋 View Meetings</button>
//                 <button onClick={resetRecording} style={{
//                   background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
//                   color: 'white', padding: '12px 24px', borderRadius: '12px',
//                   fontSize: '14px', fontWeight: '600', cursor: 'pointer'
//                 }}>🎙 Record Another</button>
//               </div>
//             </div>
//           )}

//           {/* Control buttons */}
//           {state === 'idle' && (
//             <button onClick={startRecording} style={{
//               width: '100%', padding: '16px', borderRadius: '14px',
//               background: 'linear-gradient(135deg, #ef4444, #dc2626)',
//               border: 'none', color: 'white', fontSize: '16px', fontWeight: '700',
//               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
//               boxShadow: '0 8px 24px rgba(239,68,68,0.4)', transition: 'all 0.2s'
//             }}
//               onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'}
//               onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
//             >
//               🔴 Start Recording
//             </button>
//           )}

//           {(state === 'recording' || state === 'paused') && (
//             <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
//               {state === 'recording' ? (
//                 <button onClick={pauseRecording} style={{
//                   flex: 1, padding: '14px', borderRadius: '12px',
//                   background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
//                   color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
//                 }}>⏸ Pause</button>
//               ) : (
//                 <button onClick={resumeRecording} style={{
//                   flex: 1, padding: '14px', borderRadius: '12px',
//                   background: 'rgba(100,87,249,0.2)', border: '1px solid rgba(100,87,249,0.3)',
//                   color: '#a5b4fc', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
//                 }}>▶ Resume</button>
//               )}
//               <button onClick={stopAndUpload} style={{
//                 flex: 1, padding: '14px', borderRadius: '12px',
//                 background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
//                 border: 'none', color: 'white', fontSize: '14px', fontWeight: '700',
//                 cursor: 'pointer', boxShadow: '0 4px 16px rgba(100,87,249,0.4)'
//               }}>⏹ Stop & Upload</button>
//             </div>
//           )}

//           {state === 'error' && (
//             <button onClick={resetRecording} style={{
//               width: '100%', padding: '14px', borderRadius: '12px',
//               background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
//               color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
//             }}>🔄 Try Again</button>
//           )}
//         </div>

//         {/* Tips */}
//         {state === 'idle' && (
//           <div style={{
//             marginTop: '20px', background: 'rgba(100,87,249,0.08)',
//             border: '1px solid rgba(100,87,249,0.2)', borderRadius: '14px', padding: '16px'
//           }}>
//             <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#a5b4fc' }}>💡 Tips for best results</h4>
//             <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
//               <li>Use a quiet environment or a good microphone</li>
//               <li>Speak clearly and at a normal pace</li>
//               <li>Select the correct language for better accuracy</li>
//               <li>Recording is saved automatically — even if you close the tab</li>
//             </ul>
//           </div>
//         )}
//       </div>

//       <style>{`
//         @keyframes pulse-red {
//           0%, 100% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.4; transform: scale(1.3); }
//         }
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   )
// }




// import { useEffect, useRef, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { supabase } from '../lib/supabase'

// type RecordingState = 'idle' | 'recording' | 'paused' | 'uploading' | 'processing' | 'done' | 'error'

// export default function LiveRecording() {
//   const navigate = useNavigate()
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const chunksRef = useRef<Blob[]>([])
//   const streamRef = useRef<MediaStream | null>(null)
//   const timerRef = useRef<NodeJS.Timeout | null>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const analyserRef = useRef<AnalyserNode | null>(null)
//   const animRef = useRef<number>(0)

//   const [state, setState] = useState<RecordingState>('idle')
//   const [seconds, setSeconds] = useState(0)
//   const [language, setLanguage] = useState('auto')
//   const [meetingTitle, setMeetingTitle] = useState('')
//   const [error, setError] = useState('')
//   const [meetingId, setMeetingId] = useState('')
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null)

//   useEffect(() => {
//     checkPermission()
//     return () => { cleanup() }
//   }, [])

//   const checkPermission = async () => {
//     try {
//       const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
//       setHasPermission(result.state === 'granted')
//       result.onchange = () => setHasPermission(result.state === 'granted')
//     } catch {
//       setHasPermission(null)
//     }
//   }

//   const cleanup = () => {
//     if (timerRef.current) clearInterval(timerRef.current)
//     if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
//     cancelAnimationFrame(animRef.current)
//   }

//   const drawWaveform = () => {
//     const canvas = canvasRef.current
//     const analyser = analyserRef.current
//     if (!canvas || !analyser) return
//     const ctx = canvas.getContext('2d')
//     if (!ctx) return
//     const bufferLength = analyser.frequencyBinCount
//     const dataArray = new Uint8Array(bufferLength)
//     const draw = () => {
//       animRef.current = requestAnimationFrame(draw)
//       analyser.getByteTimeDomainData(dataArray)
//       ctx.clearRect(0, 0, canvas.width, canvas.height)
//       ctx.lineWidth = 2
//       ctx.strokeStyle = '#6457F9'
//       ctx.beginPath()
//       const sliceWidth = canvas.width / bufferLength
//       let x = 0
//       for (let i = 0; i < bufferLength; i++) {
//         const v = dataArray[i] / 128.0
//         const y = (v * canvas.height) / 2
//         if (i === 0) ctx.moveTo(x, y)
//         else ctx.lineTo(x, y)
//         x += sliceWidth
//       }
//       ctx.lineTo(canvas.width, canvas.height / 2)
//       ctx.stroke()
//     }
//     draw()
//   }

//   const startRecording = async () => {
//     setError('')
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       streamRef.current = stream
//       setHasPermission(true)
//       const audioCtx = new AudioContext()
//       const source = audioCtx.createMediaStreamSource(stream)
//       const analyser = audioCtx.createAnalyser()
//       analyser.fftSize = 2048
//       source.connect(analyser)
//       analyserRef.current = analyser
//       const mediaRecorder = new MediaRecorder(stream, {
//         mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
//       })
//       mediaRecorderRef.current = mediaRecorder
//       chunksRef.current = []
//       mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
//       mediaRecorder.start(1000)
//       setState('recording')
//       setSeconds(0)
//       timerRef.current = setInterval(() => { setSeconds(s => s + 1) }, 1000)
//       drawWaveform()
//     } catch (err: any) {
//       setError('Microphone access denied. Please allow microphone access in your browser settings.')
//       setHasPermission(false)
//     }
//   }

//   const pauseRecording = () => {
//     if (mediaRecorderRef.current?.state === 'recording') {
//       mediaRecorderRef.current.pause()
//       setState('paused')
//       if (timerRef.current) clearInterval(timerRef.current)
//       cancelAnimationFrame(animRef.current)
//     }
//   }

//   const resumeRecording = () => {
//     if (mediaRecorderRef.current?.state === 'paused') {
//       mediaRecorderRef.current.resume()
//       setState('recording')
//       timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
//       drawWaveform()
//     }
//   }

//   const stopAndUpload = async () => {
//     if (!mediaRecorderRef.current) return
//     cleanup()
//     setState('uploading')
//     mediaRecorderRef.current.stop()
//     await new Promise<void>(resolve => {
//       if (mediaRecorderRef.current) { mediaRecorderRef.current.onstop = () => resolve() }
//       else resolve()
//     })
//     try {
//       const { data: { session } } = await supabase.auth.getSession()
//       if (!session) throw new Error('Not logged in')
//       const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
//       const title = meetingTitle || `Recording ${new Date().toLocaleDateString()}`
//       const fileName = `${session.user.id}/${Date.now()}-${title.replace(/\s+/g, '-')}.webm`
//       const { error: storageError } = await supabase.storage.from('recordings').upload(fileName, blob, { contentType: 'audio/webm' })
//       if (storageError) throw storageError
//       const { data: urlData } = supabase.storage.from('recordings').getPublicUrl(fileName)
//       const { data: meeting, error: dbError } = await supabase.from('meetings').insert({
//         user_id: session.user.id, title,
//         recording_url: urlData.publicUrl, status: 'processing',
//         date: new Date().toISOString(), duration_minutes: Math.round(seconds / 60)
//       }).select().single()
//       if (dbError) throw dbError
//       setMeetingId(meeting.id)
//       setState('processing')
//       await fetch(`${import.meta.env.VITE_API_URL}/api/transcribe`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
//         body: JSON.stringify({ meetingId: meeting.id, fileUrl: urlData.publicUrl, fileName: `${title}.webm`, language })
//       })
//       setState('done')
//     } catch (err: any) {
//       setError(err.message)
//       setState('error')
//     }
//   }

//   const formatTime = (s: number) => {
//     const m = Math.floor(s / 60)
//     const sec = s % 60
//     return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
//   }

//   const resetRecording = () => {
//     cleanup()
//     setState('idle')
//     setSeconds(0)
//     setError('')
//     setMeetingId('')
//     chunksRef.current = []
//   }

//   return (
//     <div style={{
//       minHeight: '100vh', padding: 'clamp(16px, 3vw, 32px)',
//       fontFamily: "'DM Sans', sans-serif",
//       background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)',
//       display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
//       boxSizing: 'border-box',
//     }}>
//       <div style={{ maxWidth: '560px', width: '100%' }}>

//         {/* Header */}
//         <div style={{ textAlign: 'center', marginBottom: '24px' }}>
//           <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
//             🎙 Live Recording
//           </h1>
//           <p style={{ margin: 0, fontSize: 'clamp(12px, 2vw, 14px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
//             Record your meeting directly in the browser. When you stop, AI will transcribe and generate minutes automatically.
//           </p>
//         </div>

//         {/* Main card */}
//         <div style={{
//           background: 'rgba(255,255,255,0.03)',
//           border: '1px solid rgba(255,255,255,0.08)',
//           borderRadius: '20px', padding: 'clamp(20px, 4vw, 32px)',
//           backdropFilter: 'blur(20px)',
//           textAlign: 'center',
//           boxSizing: 'border-box',
//         }}>

//           {error && (
//             <div style={{
//               background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
//               borderRadius: '10px', padding: '12px 16px', color: '#ef4444',
//               fontSize: '13px', marginBottom: '20px', textAlign: 'left'
//             }}>{error}</div>
//           )}

//           {(state === 'idle' || state === 'error') && (
//             <div style={{ marginBottom: '16px', textAlign: 'left' }}>
//               <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '7px', fontWeight: '500' }}>
//                 Meeting Title (optional)
//               </label>
//               <input
//                 value={meetingTitle}
//                 onChange={e => setMeetingTitle(e.target.value)}
//                 placeholder="e.g. Weekly Team Standup"
//                 style={{
//                   width: '100%', padding: '11px 14px', borderRadius: '10px',
//                   border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px',
//                   outline: 'none', background: 'rgba(255,255,255,0.05)',
//                   color: 'white', fontFamily: "'DM Sans', sans-serif",
//                   boxSizing: 'border-box'
//                 }}
//               />
//             </div>
//           )}

//           {(state === 'idle' || state === 'error') && (
//             <div style={{ marginBottom: '24px', textAlign: 'left' }}>
//               <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '7px', fontWeight: '500' }}>
//                 Recording Language
//               </label>
//               <select value={language} onChange={e => setLanguage(e.target.value)} style={{
//                 width: '100%', padding: '11px 14px', borderRadius: '10px',
//                 border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px',
//                 outline: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer',
//                 boxSizing: 'border-box',
//               }}>
//                 <option value="auto" style={{ background: '#1a0f2e' }}>🌐 Auto Detect</option>
//                 <option value="en" style={{ background: '#1a0f2e' }}>🇺🇸 English</option>
//                 <option value="ur" style={{ background: '#1a0f2e' }}>🇵🇰 Urdu</option>
//                 <option value="hi" style={{ background: '#1a0f2e' }}>🇮🇳 Hindi</option>
//                 <option value="ar" style={{ background: '#1a0f2e' }}>🇸🇦 Arabic</option>
//               </select>
//             </div>
//           )}

//           {(state === 'recording' || state === 'paused') && (
//             <div style={{ marginBottom: '20px' }}>
//               <div style={{
//                 fontSize: 'clamp(40px, 10vw, 56px)', fontWeight: '800', color: 'white',
//                 letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums'
//               }}>{formatTime(seconds)}</div>
//               <div style={{ fontSize: '13px', color: state === 'recording' ? '#ef4444' : 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
//                 {state === 'recording' ? '🔴 Recording...' : '⏸ Paused'}
//               </div>
//             </div>
//           )}

//           {(state === 'recording' || state === 'paused') && (
//             <canvas ref={canvasRef} width={460} height={70} style={{
//               width: '100%', height: '70px', borderRadius: '10px',
//               background: 'rgba(100,87,249,0.05)', border: '1px solid rgba(100,87,249,0.15)',
//               marginBottom: '20px', display: 'block'
//             }} />
//           )}

//           {state === 'recording' && (
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
//               <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse-red 1s ease-in-out infinite', flexShrink: 0 }} />
//               <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Live recording in progress</span>
//             </div>
//           )}

//           {state === 'uploading' && (
//             <div style={{ padding: '20px', marginBottom: '16px' }}>
//               <div style={{ fontSize: '36px', marginBottom: '12px' }}>⬆️</div>
//               <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>Uploading recording...</div>
//               <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Please wait while we upload your audio</div>
//             </div>
//           )}

//           {state === 'processing' && (
//             <div style={{ padding: '20px', marginBottom: '16px' }}>
//               <div style={{ fontSize: '36px', marginBottom: '12px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🤖</div>
//               <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>AI is processing your recording...</div>
//               <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '16px' }}>Transcribing with Groq Whisper → Generating minutes with LLaMA</div>
//               <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px' }}>
//                 This may take 1-3 minutes depending on recording length. You'll receive an email when ready.
//               </div>
//             </div>
//           )}

//           {state === 'done' && (
//             <div style={{ padding: '16px', marginBottom: '16px' }}>
//               <div style={{ fontSize: '44px', marginBottom: '12px' }}>🎉</div>
//               <div style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Recording uploaded!</div>
//               <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '20px' }}>
//                 AI is generating your minutes in the background. You'll get an email when ready.
//               </div>
//               <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
//                 <button onClick={() => navigate('/meetings')} style={{
//                   background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
//                   border: 'none', color: 'white', padding: '12px 20px',
//                   borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
//                 }}>📋 View Meetings</button>
//                 <button onClick={resetRecording} style={{
//                   background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
//                   color: 'white', padding: '12px 20px', borderRadius: '12px',
//                   fontSize: '14px', fontWeight: '600', cursor: 'pointer'
//                 }}>🎙 Record Another</button>
//               </div>
//             </div>
//           )}

//           {state === 'idle' && (
//             <button onClick={startRecording} style={{
//               width: '100%', padding: '15px', borderRadius: '14px',
//               background: 'linear-gradient(135deg, #ef4444, #dc2626)',
//               border: 'none', color: 'white', fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: '700',
//               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
//               boxShadow: '0 8px 24px rgba(239,68,68,0.4)', transition: 'all 0.2s', boxSizing: 'border-box',
//             }}>
//               🔴 Start Recording
//             </button>
//           )}

//           {(state === 'recording' || state === 'paused') && (
//             <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
//               {state === 'recording' ? (
//                 <button onClick={pauseRecording} style={{
//                   flex: 1, padding: '13px', borderRadius: '12px',
//                   background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
//                   color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
//                 }}>⏸ Pause</button>
//               ) : (
//                 <button onClick={resumeRecording} style={{
//                   flex: 1, padding: '13px', borderRadius: '12px',
//                   background: 'rgba(100,87,249,0.2)', border: '1px solid rgba(100,87,249,0.3)',
//                   color: '#a5b4fc', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
//                 }}>▶ Resume</button>
//               )}
//               <button onClick={stopAndUpload} style={{
//                 flex: 1, padding: '13px', borderRadius: '12px',
//                 background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
//                 border: 'none', color: 'white', fontSize: '14px', fontWeight: '700',
//                 cursor: 'pointer', boxShadow: '0 4px 16px rgba(100,87,249,0.4)'
//               }}>⏹ Stop & Upload</button>
//             </div>
//           )}

//           {state === 'error' && (
//             <button onClick={resetRecording} style={{
//               width: '100%', padding: '13px', borderRadius: '12px',
//               background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
//               color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
//             }}>🔄 Try Again</button>
//           )}
//         </div>

//         {state === 'idle' && (
//           <div style={{
//             marginTop: '16px', background: 'rgba(100,87,249,0.08)',
//             border: '1px solid rgba(100,87,249,0.2)', borderRadius: '14px', padding: 'clamp(12px, 3vw, 16px)'
//           }}>
//             <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#a5b4fc' }}>💡 Tips for best results</h4>
//             <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
//               <li>Use a quiet environment or a good microphone</li>
//               <li>Speak clearly and at a normal pace</li>
//               <li>Select the correct language for better accuracy</li>
//               <li>Recording is saved automatically — even if you close the tab</li>
//             </ul>
//           </div>
//         )}
//       </div>

//       <style>{`
//         @keyframes pulse-red {
//           0%, 100% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.4; transform: scale(1.3); }
//         }
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         * { box-sizing: border-box; }
//       `}</style>
//     </div>
//   )
// }

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type RecordingState = 'idle' | 'recording' | 'paused' | 'uploading' | 'processing' | 'done' | 'error'

export default function LiveRecording() {
  const navigate = useNavigate()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)  // ✅ FIXED: was NodeJS.Timeout
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animRef = useRef<number>(0)

  const [state, setState] = useState<RecordingState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [language, setLanguage] = useState('auto')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [error, setError] = useState('')
  const [createdMeetingId, setCreatedMeetingId] = useState('')  // ✅ renamed to avoid unused warning

  useEffect(() => {
    return () => { cleanup() }
  }, [])

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    cancelAnimationFrame(animRef.current)
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 2
      ctx.strokeStyle = '#6457F9'
      ctx.beginPath()
      const sliceWidth = canvas.width / bufferLength
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        x += sliceWidth
      }
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }
    draw()
  }

  const startRecording = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mediaRecorder.start(1000)
      setState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => { setSeconds(s => s + 1) }, 1000)
      drawWaveform()
    } catch {
      setError('Microphone access denied. Please allow microphone access in your browser settings.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      setState('paused')
      if (timerRef.current) clearInterval(timerRef.current)
      cancelAnimationFrame(animRef.current)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      setState('recording')
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
      drawWaveform()
    }
  }

  const stopAndUpload = async () => {
    if (!mediaRecorderRef.current) return
    cleanup()
    setState('uploading')
    mediaRecorderRef.current.stop()
    await new Promise<void>(resolve => {
      if (mediaRecorderRef.current) { mediaRecorderRef.current.onstop = () => resolve() }
      else resolve()
    })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not logged in')
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const title = meetingTitle || `Recording ${new Date().toLocaleDateString()}`
      const fileName = `${session.user.id}/${Date.now()}-${title.replace(/\s+/g, '-')}.webm`
      const { error: storageError } = await supabase.storage.from('recordings').upload(fileName, blob, { contentType: 'audio/webm' })
      if (storageError) throw storageError
      const { data: urlData } = supabase.storage.from('recordings').getPublicUrl(fileName)
      const { data: meeting, error: dbError } = await supabase.from('meetings').insert({
        user_id: session.user.id, title,
        recording_url: urlData.publicUrl, status: 'processing',
        date: new Date().toISOString(), duration_minutes: Math.round(seconds / 60)
      }).select().single()
      if (dbError) throw dbError
      setCreatedMeetingId(meeting.id)
      setState('processing')
      await fetch(`${import.meta.env.VITE_API_URL}/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ meetingId: meeting.id, fileUrl: urlData.publicUrl, fileName: `${title}.webm`, language })
      })
      setState('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const resetRecording = () => {
    cleanup()
    setState('idle')
    setSeconds(0)
    setError('')
    setCreatedMeetingId('')
    chunksRef.current = []
  }

  // suppress unused warning for createdMeetingId — it's set but used for future features
  void createdMeetingId

  return (
    <div style={{
      minHeight: '100vh', padding: 'clamp(16px, 3vw, 32px)',
      fontFamily: "'DM Sans', sans-serif",
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: '560px', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
            🎙 Live Recording
          </h1>
          <p style={{ margin: 0, fontSize: 'clamp(12px, 2vw, 14px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
            Record your meeting directly in the browser. When you stop, AI will transcribe and generate minutes automatically.
          </p>
        </div>

        {/* Main card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: 'clamp(20px, 4vw, 32px)',
          backdropFilter: 'blur(20px)',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '12px 16px', color: '#ef4444',
              fontSize: '13px', marginBottom: '20px', textAlign: 'left'
            }}>{error}</div>
          )}

          {(state === 'idle' || state === 'error') && (
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '7px', fontWeight: '500' }}>
                Meeting Title (optional)
              </label>
              <input
                value={meetingTitle}
                onChange={e => setMeetingTitle(e.target.value)}
                placeholder="e.g. Weekly Team Standup"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px',
                  outline: 'none', background: 'rgba(255,255,255,0.05)',
                  color: 'white', fontFamily: "'DM Sans', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {(state === 'idle' || state === 'error') && (
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '7px', fontWeight: '500' }}>
                Recording Language
              </label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={{
                width: '100%', padding: '11px 14px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px',
                outline: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer',
                boxSizing: 'border-box',
              }}>
                <option value="auto" style={{ background: '#1a0f2e' }}>🌐 Auto Detect</option>
                <option value="en" style={{ background: '#1a0f2e' }}>🇺🇸 English</option>
                <option value="ur" style={{ background: '#1a0f2e' }}>🇵🇰 Urdu</option>
                <option value="hi" style={{ background: '#1a0f2e' }}>🇮🇳 Hindi</option>
                <option value="ar" style={{ background: '#1a0f2e' }}>🇸🇦 Arabic</option>
              </select>
            </div>
          )}

          {(state === 'recording' || state === 'paused') && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: 'clamp(40px, 10vw, 56px)', fontWeight: '800', color: 'white',
                letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums'
              }}>{formatTime(seconds)}</div>
              <div style={{ fontSize: '13px', color: state === 'recording' ? '#ef4444' : 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                {state === 'recording' ? '🔴 Recording...' : '⏸ Paused'}
              </div>
            </div>
          )}

          {(state === 'recording' || state === 'paused') && (
            <canvas ref={canvasRef} width={460} height={70} style={{
              width: '100%', height: '70px', borderRadius: '10px',
              background: 'rgba(100,87,249,0.05)', border: '1px solid rgba(100,87,249,0.15)',
              marginBottom: '20px', display: 'block'
            }} />
          )}

          {state === 'recording' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse-red 1s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Live recording in progress</span>
            </div>
          )}

          {state === 'uploading' && (
            <div style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⬆️</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>Uploading recording...</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Please wait while we upload your audio</div>
            </div>
          )}

          {state === 'processing' && (
            <div style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🤖</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>AI is processing your recording...</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '16px' }}>Transcribing with Groq Whisper → Generating minutes with LLaMA</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px' }}>
                This may take 1-3 minutes depending on recording length. You'll receive an email when ready.
              </div>
            </div>
          )}

          {state === 'done' && (
            <div style={{ padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>🎉</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Recording uploaded!</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '20px' }}>
                AI is generating your minutes in the background. You'll get an email when ready.
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/meetings')} style={{
                  background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
                  border: 'none', color: 'white', padding: '12px 20px',
                  borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                }}>📋 View Meetings</button>
                <button onClick={resetRecording} style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', padding: '12px 20px', borderRadius: '12px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                }}>🎙 Record Another</button>
              </div>
            </div>
          )}

          {state === 'idle' && (
            <button onClick={startRecording} style={{
              width: '100%', padding: '15px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none', color: 'white', fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: '700',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: '0 8px 24px rgba(239,68,68,0.4)', transition: 'all 0.2s', boxSizing: 'border-box',
            }}>
              🔴 Start Recording
            </button>
          )}

          {(state === 'recording' || state === 'paused') && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {state === 'recording' ? (
                <button onClick={pauseRecording} style={{
                  flex: 1, padding: '13px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                }}>⏸ Pause</button>
              ) : (
                <button onClick={resumeRecording} style={{
                  flex: 1, padding: '13px', borderRadius: '12px',
                  background: 'rgba(100,87,249,0.2)', border: '1px solid rgba(100,87,249,0.3)',
                  color: '#a5b4fc', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                }}>▶ Resume</button>
              )}
              <button onClick={stopAndUpload} style={{
                flex: 1, padding: '13px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
                border: 'none', color: 'white', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(100,87,249,0.4)'
              }}>⏹ Stop & Upload</button>
            </div>
          )}

          {state === 'error' && (
            <button onClick={resetRecording} style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>🔄 Try Again</button>
          )}
        </div>

        {state === 'idle' && (
          <div style={{
            marginTop: '16px', background: 'rgba(100,87,249,0.08)',
            border: '1px solid rgba(100,87,249,0.2)', borderRadius: '14px', padding: 'clamp(12px, 3vw, 16px)'
          }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#a5b4fc' }}>💡 Tips for best results</h4>
            <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
              <li>Use a quiet environment or a good microphone</li>
              <li>Speak clearly and at a normal pace</li>
              <li>Select the correct language for better accuracy</li>
              <li>Recording is saved automatically — even if you close the tab</li>
            </ul>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-red {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}