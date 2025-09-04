import { NextRequest, NextResponse } from "next/server"

/**
 * API Route for handling feedback submissions
 * Supports bug reports and feature requests with email notifications
 */

interface FeedbackData {
  toolName: string
  feedbackType: "bug" | "feature"
  email: string | null
  message: string
  url: string
  userAgent: string
  timestamp: string
}

// Email service configuration
const EMAIL_CONFIG = {
  // You can use any email service here:
  // - Resend: https://resend.com
  // - SendGrid: https://sendgrid.com
  // - Mailgun: https://www.mailgun.com
  // - Or any SMTP provider

  // For now, we'll log to console and return success
  // Replace this with your actual email service
  service: "console", // Change to "resend", "sendgrid", etc.
  fromEmail: "feedback@smartgenerators.dev",
  toEmail: process.env.FEEDBACK_EMAIL || "your-email@example.com",
  resendApiKey: process.env.RESEND_API_KEY,
}

async function sendEmail(feedback: FeedbackData) {
  const subject = `${feedback.feedbackType === "bug" ? "🐛 Bug Report" : "✨ Feature Request"} - ${feedback.toolName}`
  const body = `
New ${feedback.feedbackType} feedback received:

Tool: ${feedback.toolName}
Type: ${feedback.feedbackType}
Email: ${feedback.email || "Not provided"}
URL: ${feedback.url}
Timestamp: ${new Date(feedback.timestamp).toLocaleString()}
User Agent: ${feedback.userAgent}

Message:
${feedback.message}

---
This feedback was submitted via Smart Generators feedback system.
  `.trim()

  // Log to console for development
  console.log("📧 Feedback Email:")
  console.log("Subject:", subject)
  console.log("Body:", body)
  console.log("---")

  // Here you would integrate with your email service
  if (EMAIL_CONFIG.service === "resend" && EMAIL_CONFIG.resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${EMAIL_CONFIG.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: EMAIL_CONFIG.fromEmail,
          to: EMAIL_CONFIG.toEmail,
          subject,
          text: body,
        }),
      })

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.status}`)
      }

      return { success: true }
    } catch (error) {
      console.error("Resend email error:", error)
      throw error
    }
  }

  // For development/testing, we just return success
  // In production, implement your preferred email service
  return { success: true }
}

export async function POST(request: NextRequest) {
  try {
    const feedback: FeedbackData = await request.json()

    // Validate required fields
    if (!feedback.toolName || !feedback.message || !feedback.feedbackType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate feedback type
    if (!["bug", "feature"].includes(feedback.feedbackType)) {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (feedback.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Rate limiting (basic implementation)
    // In production, you might want to use Redis or similar
    const clientIP = request.headers.get("x-forwarded-for") ||
                    request.headers.get("x-real-ip") ||
                    "unknown"

    // For now, we'll just log the feedback
    console.log(`📝 New feedback from ${clientIP}:`, {
      tool: feedback.toolName,
      type: feedback.feedbackType,
      hasEmail: !!feedback.email,
      messageLength: feedback.message.length,
      timestamp: feedback.timestamp,
    })

    // Send email notification
    await sendEmail(feedback)

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully"
    })

  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
