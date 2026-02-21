import { createClient } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { name, email, message, phone, subject, submission_type = "contact" } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, message" },
        { status: 400 },
      )
    }

    console.log("[v0] Submitting form:", { name, email, submission_type })

    // Insert submission
    const { data, error } = await supabase
      .from("submissions")
      .insert([
        {
          name,
          email,
          message,
          phone: phone || null,
          subject: subject || null,
          submission_type,
          status: "new",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Submission error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Submission saved successfully:", data.id)

    return NextResponse.json(
      { success: true, message: "Submission received successfully!", id: data.id },
      { status: 201 },
    )
  } catch (err: any) {
    console.error("[v0] API error:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const authHeader = request.headers.get("authorization")

    // Verify user is authenticated
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all submissions
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err: any) {
    console.error("[v0] API error:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
