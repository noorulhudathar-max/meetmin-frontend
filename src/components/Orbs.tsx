export default function Orbs() {
  const base: React.CSSProperties = {
    position: 'fixed',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 0,
  }
  return (
    <>
      <div style={{ ...base, width: 500, height: 500, background: 'rgba(100,87,249,0.18)', top: -100, right: -100, animation: 'drift 18s ease-in-out infinite alternate' }} />
      <div style={{ ...base, width: 400, height: 400, background: 'rgba(139,127,247,0.12)', bottom: -80, left: -80, animation: 'drift 16s ease-in-out infinite alternate', animationDelay: '-6s' }} />
      <div style={{ ...base, width: 300, height: 300, background: 'rgba(80,200,255,0.08)', top: '40%', left: '30%', animation: 'drift 20s ease-in-out infinite alternate', animationDelay: '-12s' }} />
    </>
  )
}
