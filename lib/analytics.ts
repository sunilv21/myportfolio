import { createClient } from "./supabase"

export async function trackEvent(contentId: string, eventType: "view" | "click" | "embed_clicked") {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("analytics").insert({
      content_id: contentId,
      event_type: eventType,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
    })

    if (error) console.error("Analytics error:", error)
  } catch (err) {
    console.error("Failed to track event:", err)
  }
}
