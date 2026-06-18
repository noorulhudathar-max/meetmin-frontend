import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ── useRealtimeMeetings ─────────────────────────────────────────────────────
// Drop this hook into any page that shows meetings.
// It automatically re-fetches whenever a meeting row changes in the DB.
// No more manual refresh needed!
//
// Usage:
//   const { meetings, loading, refetch } = useRealtimeMeetings()

type Meeting = {
  id: string
  title: string
  date: string
  duration_minutes: number
  status: string
  recording_url: string
  transcript: string
  summary: string
  action_items: any[]
  created_at: string
}

export function useRealtimeMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error: fetchError } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setMeetings(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()

    // Subscribe to real-time changes on the meetings table
    const channel = supabase
      .channel('meetings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'meetings',
        },
        (payload) => {
          console.log('📡 Real-time update:', payload.eventType, payload.new)

          if (payload.eventType === 'INSERT') {
            setMeetings(prev => [payload.new as Meeting, ...prev])
          }

          if (payload.eventType === 'UPDATE') {
            setMeetings(prev =>
              prev.map(m => m.id === (payload.new as Meeting).id ? payload.new as Meeting : m)
            )
            // Show browser notification if meeting finished processing
            if ((payload.new as Meeting).status === 'done') {
              showNotification((payload.new as Meeting).title)
            }
          }

          if (payload.eventType === 'DELETE') {
            setMeetings(prev => prev.filter(m => m.id !== (payload.old as any).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { meetings, loading, error, refetch: fetchMeetings }
}

// Browser notification when meeting is ready
function showNotification(title: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification('✅ Meeting Ready!', {
      body: `"${title}" has been processed. View your minutes now.`,
      icon: '/favicon.ico'
    })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('✅ Meeting Ready!', {
          body: `"${title}" has been processed.`,
          icon: '/favicon.ico'
        })
      }
    })
  }
}