import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '32px', textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
          background: 'linear-gradient(135deg, #0a0a0f, #0f0a1a)'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>😵</div>
          <h2 style={{ color: 'white', fontSize: '22px', margin: '0 0 12px', fontWeight: '700' }}>
            Something went wrong
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.45)', fontSize: '14px',
            margin: '0 0 28px', maxWidth: '420px', lineHeight: 1.6,
            background: 'rgba(239,68,68,0.08)', padding: '12px 16px',
            borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)'
          }}>
            {this.state.error || 'An unexpected error occurred'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white', padding: '11px 24px',
                borderRadius: '12px', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer'
              }}
            >← Go Back</button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
                border: 'none', color: 'white', padding: '11px 24px',
                borderRadius: '12px', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', boxShadow: '0 8px 24px rgba(100,87,249,0.4)'
              }}
            >🔄 Reload App</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}