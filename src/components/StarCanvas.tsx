import { useEffect, useRef } from 'react'

export default function StarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    let W = 0, H = 0
    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.7 + 0.1,
      blink: Math.random() * Math.PI * 2,
    }))
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      stars.forEach(s => {
        s.blink += 0.015
        const a = s.a * (0.5 + 0.5 * Math.sin(s.blink))
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,195,255,${a})`
        ctx.fill()
        s.y += 0.00007; if (s.y > 1) s.y = 0
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position:'fixed', inset:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none' }} />
}