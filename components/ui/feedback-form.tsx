"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

/**
 * Feedback Form Component - Allows users to submit bug reports or feature requests
 * Can be embedded in any tool page for collecting user feedback
 */
export default function FeedbackForm({
  toolName = "Tool",
  compact = false,
  defaultCollapsed = true
}: {
  toolName?: string
  compact?: boolean
  defaultCollapsed?: boolean
}) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed)
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature">("bug")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter your feedback message",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolName,
          feedbackType,
          email: email.trim() || null,
          message: message.trim(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      setIsSubmitted(true)
      setMessage("")
      setEmail("")

      toast({
        title: "Thank you! 🎉",
        description: "Your feedback has been submitted successfully",
      })

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false)
        setIsSubmitted(false)
      }, 2000)

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (compact) {
    // Compact version - just a simple button that opens a modal
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200/50 bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Submit feedback"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Feedback
        </button>

        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200/50 bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/95">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Share Your Feedback
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close feedback form"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <CompactFeedbackForm
                toolName={toolName}
                feedbackType={feedbackType}
                setFeedbackType={setFeedbackType}
                email={email}
                setEmail={setEmail}
                message={message}
                setMessage={setMessage}
                isSubmitting={isSubmitting}
                isSubmitted={isSubmitted}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        )}
      </>
    )
  }

  // Full version - collapsible inline form
  return (
    <div className="rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group"
        aria-expanded={isOpen}
        aria-controls="feedback-form-content"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Help Us Improve {toolName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found a bug or have a feature request?
              </p>
            </div>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </button>

      <div
        id="feedback-form-content"
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6">
          <CompactFeedbackForm
            toolName={toolName}
            feedbackType={feedbackType}
            setFeedbackType={setFeedbackType}
            email={email}
            setEmail={setEmail}
            message={message}
            setMessage={setMessage}
            isSubmitting={isSubmitting}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}

// Shared form component used by both compact and full versions
function CompactFeedbackForm({
  toolName,
  feedbackType,
  setFeedbackType,
  email,
  setEmail,
  message,
  setMessage,
  isSubmitting,
  isSubmitted,
  onSubmit,
}: {
  toolName: string
  feedbackType: "bug" | "feature"
  setFeedbackType: (type: "bug" | "feature") => void
  email: string
  setEmail: (email: string) => void
  message: string
  setMessage: (message: string) => void
  isSubmitting: boolean
  isSubmitted: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Feedback Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Feedback Type
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFeedbackType("bug")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
              feedbackType === "bug"
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            🐛 Bug Report
          </button>
          <button
            type="button"
            onClick={() => setFeedbackType("feature")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
              feedbackType === "feature"
                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            ✨ Feature Request
          </button>
        </div>
      </div>

      {/* Email (Optional) */}
      <div>
        <label htmlFor="feedback-email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email <span className="text-xs text-gray-500 dark:text-gray-400">(optional)</span>
        </label>
        <input
          id="feedback-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="feedback-message" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            feedbackType === "bug"
              ? "Describe the bug you encountered..."
              : "Describe the feature you'd like to see..."
          }
          rows={4}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || isSubmitted}
        className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
          isSubmitted
            ? "bg-green-600 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Sending...
          </span>
        ) : isSubmitted ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Sent Successfully!
          </span>
        ) : (
          `Send ${feedbackType === "bug" ? "Bug Report" : "Feature Request"}`
        )}
      </button>
    </form>
  )
}
