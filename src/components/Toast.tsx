import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'
type ToastItem = { id: number; message: string; type: ToastType }

let addToastFn: ((msg: string, type: ToastType) => void) | null = null

export function toast(message: string, type: ToastType = 'success') {
  addToastFn?.(message, type)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    addToastFn = (message, type) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    }
    return () => { addToastFn = null }
  }, [])

  const colors: Record<ToastType, { bg: string; border: string; color: string }> = {
    success: { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  color: '#22C55E' },
    error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  color: '#EF4444' },
    info:    { bg: 'rgba(100,87,249,0.12)', border: 'rgba(100,87,249,0.3)', color: '#a89fff' },
  }

  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => {
        const c = colors[t.type]
        return (
          <div key={t.id} style={{
            background: c.bg, border: `1px solid ${c.border}`, color: c.color,
            padding:'12px 18px', borderRadius:12, fontSize:13, fontWeight:600,
            fontFamily:"'DM Sans',sans-serif", maxWidth:320,
            backdropFilter:'blur(12px)', boxShadow:'0 4px 24px rgba(0,0,0,0.3)',
            animation:'slideIn 0.2s ease',
          }}>
            {t.message}
          </div>
        )
      })}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </div>
  )
}