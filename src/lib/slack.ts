// type ActionItem = {
//   task: string;
//   assignee: string | null;
//   deadline: string | null;
// };

// type SendMeetingParams = {
//   id: string;
//   title: string;
//   summary: string;
//   actionItems: ActionItem[];
// };

// export async function sendMeetingToSlack(
//   params: SendMeetingParams
// ): Promise<{ success: boolean; error?: string }> {
//   try {
//     const apiUrl = import.meta.env.VITE_API_URL;

//     if (!apiUrl) {
//       return { success: false, error: "VITE_API_URL is not set in .env" };
//     }

//     // Strip trailing slash if any
//     const base = apiUrl.replace(/\/$/, "");

//     const response = await fetch(`${base}/api/slack/send`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         meetingTitle: params.title,
//         summary: params.summary,
//         actionItems: params.actionItems,
//         meetingId: params.id,
//       }),
//     });

//     // Guard: if response is not JSON (e.g. HTML 404 page), catch it early
//     const contentType = response.headers.get("content-type") || "";
//     if (!contentType.includes("application/json")) {
//       const text = await response.text();
//       console.error("[Slack] Non-JSON response:", text.slice(0, 200));
//       return {
//         success: false,
//         error: `Server returned HTML instead of JSON. Check VITE_API_URL and that your backend is running.`,
//       };
//     }

//     const data = await response.json();
//     if (!response.ok) return { success: false, error: data.error || "Failed to send" };
//     return { success: true };
//   } catch (err: any) {
//     return { success: false, error: err.message };
//   }
// }

// export type ActionItem = {
//   task: string;
//   assignee: string | null;
//   deadline: string | null;
// };

// export type SendMeetingParams = {
//   id: string;
//   title: string;
//   summary: string;
//   actionItems: ActionItem[];
// };

// export async function sendMeetingToSlack(
//   params: SendMeetingParams
// ): Promise<{ success: boolean; error?: string }> {
//   try {
//     const apiUrl = import.meta.env.VITE_API_URL;

//     if (!apiUrl) {
//       return { success: false, error: "VITE_API_URL is not set in .env" };
//     }

//     const base = apiUrl.replace(/\/$/, "");

//     const response = await fetch(`${base}/api/slack/send`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         meetingId: params.id,
//         meetingTitle: params.title,
//         summary: params.summary,
//         actionItems: params.actionItems,
//       }),
//     });

//     const contentType = response.headers.get("content-type") || "";
//     if (!contentType.includes("application/json")) {
//       const text = await response.text();
//       console.error("[Slack Proxy Error] Non-JSON payload returned:", text.slice(0, 200));
//       return {
//         success: false,
//         error: `Server endpoint down or misconfigured (Returned HTML instead of JSON).`,
//       };
//     }

//     const data = await response.json();
//     if (!response.ok) {
//       return { success: false, error: data.error || "Failed to dispatch notification to webhook backend." };
//     }

//     return { success: true };
//   } catch (err: any) {
//     console.error("[Slack Integration Handler Exception]:", err);
//     return { success: false, error: err.message };
//   }
// }

// src/lib/slack.ts
// Drop this into src/lib/slack.ts
// This is the file MeetingDetail.tsx imports from '../lib/slack'

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