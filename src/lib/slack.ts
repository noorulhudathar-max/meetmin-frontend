
interface ActionItem {
  task: string
  assignee: string | null
  deadline: string | null
}

interface SendToSlackParams {
  id: string
  title: string
  summary: string
  actionItems: ActionItem[]
}

export async function sendMeetingToSlack(
  meeting: SendToSlackParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/slack/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetingId:    meeting.id,
        meetingTitle: meeting.title,
        summary:      meeting.summary,
        actionItems:  meeting.actionItems,
      }),
    })
    const data = await response.json()
    if (!response.ok) return { success: false, error: data.error || 'Slack send failed' }
    return { success: true }
  } catch {
    return { success: false, error: 'Network error — is your backend running?' }
  }
}