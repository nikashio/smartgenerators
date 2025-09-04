"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import FeedbackForm from "@/components/ui/feedback-form"

/**
 * Chat Link Generator - Multi-app link generator for WhatsApp, Telegram, Messenger, and Discord
 * Generates deep links and QR codes for various messaging platforms
 */
export default function ChatLinkGenerator() {
  const [activeTab, setActiveTab] = useState("whatsapp")
  const [embedMode, setEmbedMode] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { toast } = useToast()

  // Check for embed mode from URL params and initialize theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('embed') === '1') {
        setEmbedMode(true)
      }

      // Initialize theme
      const savedTheme = localStorage.getItem("theme")
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

      if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        setIsDarkMode(true)
        document.documentElement.classList.add("dark")
      } else {
        setIsDarkMode(false)
        document.documentElement.classList.remove("dark")
      }

      // Add enhanced structured data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Chat Link Generator",
        "description": "Free WhatsApp link generator – create click‑to‑chat links for WhatsApp, Telegram, Messenger and Discord with QR codes, no signup required.",
        "url": "https://smartgenerators.dev/chat-link-generator",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "WhatsApp click-to-chat link generation",
          "Telegram deep link creation", 
          "Messenger m.me link generator",
          "Discord invite and message link creation",
          "QR code generation",
          "Shareable link creation",
          "Cross-platform compatibility",
          "No registration required",
          "Privacy-focused local processing"
        ],
        "creator": {
          "@type": "Organization",
          "name": "Smart Generators",
          "url": "https://smartgenerators.dev"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "127"
        }
      }

      const faqStructuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I create a WhatsApp click-to-chat link?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Enter the phone number with country code and optional message, then click 'Generate WhatsApp Link'. The link will use the format: https://wa.me/phonenumber?text=message"
            }
          },
          {
            "@type": "Question",
            "name": "Can I prefill a message?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! All platforms support pre-filled messages. For WhatsApp, Telegram bots, and Messenger, you can enter a custom message that will appear when the link is opened."
            }
          },
          {
            "@type": "Question",
            "name": "How do Telegram bot parameters work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Telegram bot links can include a 'start' parameter like /start@promise. This allows you to pass custom data to your bot when users click the link, useful for referral programs or custom onboarding flows."
            }
          },
          {
            "@type": "Question",
            "name": "How do I link to a Discord message?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To link to a specific Discord message, right-click the message and select 'Copy Message Link', or use the developer tools to get the message ID. You'll need the server ID, channel ID, and message ID."
            }
          },
          {
            "@type": "Question",
            "name": "Is this private?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, completely private. All link generation happens locally in your browser. No data is sent to our servers, and nothing is stored. Your information stays on your device."
            }
          }
        ]
      }

      // Add structured data scripts
      const script1 = document.createElement('script')
      script1.type = 'application/ld+json'
      script1.textContent = JSON.stringify(structuredData)
      document.head.appendChild(script1)

      const script2 = document.createElement('script')
      script2.type = 'application/ld+json'
      script2.textContent = JSON.stringify(faqStructuredData)
      document.head.appendChild(script2)

      // Cleanup function
      return () => {
        if (script1.parentNode) script1.parentNode.removeChild(script1)
        if (script2.parentNode) script2.parentNode.removeChild(script2)
      }
    }
  }, [])

  /** Toggle light/dark themes and persist preference. */
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")

    if (newTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Header component with title and badges
  const Header = () => (
    <header className="mb-12 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-sm font-medium text-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300">
          <span className="text-lg">🔗</span>
          Smart Generators
        </div>
      </div>
      
      <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Free Chat Link Generator
        </span>
      </h1>
      
      <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
        Create click-to-chat links and QR codes for WhatsApp, Telegram, Messenger, and Discord in seconds — 
        <span className="font-semibold text-gray-900 dark:text-white">no signup required.</span>
      </p>
      
      <div className="flex flex-wrap justify-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-300">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          100% Free
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm dark:bg-blue-900/30 dark:text-blue-300">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Privacy-first
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm dark:bg-purple-900/30 dark:text-purple-300">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
          </svg>
          No Signup
        </div>
      </div>
      
      <div className="absolute top-8 right-8">
        <button
          onClick={toggleTheme}
          className="h-10 w-10 rounded-full border border-gray-200/50 bg-white/80 text-sm backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:hover:bg-gray-800"
          aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        >
          <span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
          {isDarkMode ? (
            <span className="block h-full w-full p-2" role="img" aria-hidden="true">🌙</span>
          ) : (
            <span className="block h-full w-full p-2" role="img" aria-hidden="true">☀️</span>
          )}
        </button>
      </div>
    </header>
  )

  // Tab navigation component
  const TabNavigation = () => {
    const tabs = [
      { id: "whatsapp", label: "WhatsApp", icon: "💬", iconAlt: "WhatsApp messaging icon", color: "emerald" },
      { id: "telegram", label: "Telegram", icon: "✈️", iconAlt: "Telegram airplane icon", color: "blue" },
      { id: "messenger", label: "Messenger", icon: "📘", iconAlt: "Facebook Messenger book icon", color: "indigo" },
      { id: "discord", label: "Discord", icon: "🎮", iconAlt: "Discord gaming controller icon", color: "purple" },
    ]

    return (
      <div className="mb-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                activeTab === tab.id
                  ? `border-${tab.color}-500 bg-${tab.color}-50 shadow-lg shadow-${tab.color}-500/20 dark:bg-${tab.color}-900/20 dark:border-${tab.color}-400`
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
              }`}
            >
              <div className={`text-2xl transition-transform group-hover:scale-110 ${
                activeTab === tab.id ? "scale-110" : ""
              }`}>
                <span role="img" aria-label={tab.iconAlt}>{tab.icon}</span>
              </div>
              <span className={`text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? `text-${tab.color}-700 dark:text-${tab.color}-300`
                  : "text-gray-700 dark:text-gray-300"
              }`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className={`absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-${tab.color}-500`} />
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Main content area that conditionally renders based on embed mode
  if (embedMode) {
    return (
      <div className="max-w-md p-4">
        <TabNavigation />
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
          <TabContent activeTab={activeTab} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Header />
        <main>
          <TabNavigation />

          {/* Main Tool Card */}
          <div className="mb-12 overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
            <TabContent activeTab={activeTab} />
          </div>

          {/* Advanced Options */}
          <AdvancedOptions />

          {/* SEO Content Sections */}
          <SEOContent />

          {/* Feedback Section */}
          <div className="mt-12">
            <FeedbackForm toolName="Chat Link Generator" defaultCollapsed={true} />
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  )
}

// Tab Content Component
function TabContent({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "whatsapp":
      return <WhatsAppTab />
    case "telegram":
      return <TelegramTab />
    case "messenger":
      return <MessengerTab />
    case "discord":
      return <DiscordTab />
    default:
      return <WhatsAppTab />
  }
}

// WhatsApp Tab Component
function WhatsAppTab() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [showEmbed, setShowEmbed] = useState(false)
  const [embedCode, setEmbedCode] = useState("")
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState("")
  const [shareCopied, setShareCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const { toast } = useToast()

  // Set embed code on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmbedCode(`<iframe src="${window.location.origin}/chat-link-generator?embed=1&app=whatsapp" width="360" height="280" frameborder="0"></iframe>`)
    }
  }, [])

  const generateLink = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      })
      return
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, "")

    let link = `https://wa.me/${normalizedPhone}`
    if (message.trim()) {
      link += `?text=${encodeURIComponent(message)}`
    }

    setGeneratedLink(link)
  }

  const copyToClipboard = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied("link")
      setTimeout(() => setCopied(""), 2000)
      toast({
        title: "Copied!",
        description: "WhatsApp link copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const copyShareableLink = async () => {
    console.log('Share button clicked', { generatedLink, phoneNumber, message }) // Debug log
    
    if (!generatedLink || typeof window === 'undefined') {
      toast({
        title: "Error", 
        description: "No link generated yet",
        variant: "destructive",
      })
      return
    }

    const shareableUrl = `${window.location.origin}/chat-link-generator?app=whatsapp&phone=${encodeURIComponent(phoneNumber)}&text=${encodeURIComponent(message || '')}`
    
    try {
      await navigator.clipboard.writeText(shareableUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
      toast({
        title: "Shareable Link Copied!",
        description: "You can share this link to let others generate the same WhatsApp link",
      })
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea')
        textArea.value = shareableUrl
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
        toast({
          title: "Shareable Link Copied!",
          description: "You can share this link to let others generate the same WhatsApp link",
        })
      } catch (fallbackErr) {
        toast({
          title: "Error",
          description: "Failed to copy link. Please copy manually: " + shareableUrl,
          variant: "destructive",
        })
      }
    }
  }

  const generateQRCode = () => {
    if (!generatedLink) return
    setShowQR(!showQR)
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="whatsapp-phone" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number (with country code)
          </label>
          <input
            id="whatsapp-phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 (555) 123-4567"
            aria-describedby="phone-help"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <div id="phone-help" className="sr-only">Enter phone number with country code for WhatsApp link generation</div>
        </div>

        <div>
          <label htmlFor="whatsapp-message" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Message (optional)
          </label>
          <textarea
            id="whatsapp-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={3}
            aria-describedby="message-help"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <div id="message-help" className="sr-only">Optional pre-filled message for WhatsApp conversation</div>
        </div>

        <button
          onClick={generateLink}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 font-semibold text-white transition-all duration-200 hover:from-emerald-700 hover:to-green-700 hover:shadow-lg hover:shadow-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Generate WhatsApp Link
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Everything is created locally in your browser. Nothing is stored.
        </p>
      </div>

      {/* Result Section */}
      {generatedLink && (
        <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-green-50 p-6 shadow-lg dark:border-emerald-800/30 dark:from-emerald-900/20 dark:to-green-900/20">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              Your WhatsApp Link
            </h3>
          </div>

          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="w-full rounded-xl border border-emerald-200 bg-white/80 px-4 py-3 pr-12 text-sm font-mono text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-emerald-700/50 dark:bg-gray-800/80 dark:text-white"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className={`group flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                copied === "link" 
                  ? "bg-green-600 text-white" 
                  : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
              }`}
            >
              {copied === "link" ? (
                <>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2V5a2 2 0 00-2-2v8z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              onClick={() => window.open(generatedLink, '_blank')}
              className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 font-semibold text-white transition-all hover:from-emerald-700 hover:to-green-700 hover:shadow-lg"
            >
              <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Open WhatsApp
            </button>
            <button
              onClick={copyShareableLink}
              className={`group flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold backdrop-blur-sm transition-all ${
                shareCopied
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-700/50 dark:bg-green-900/30 dark:text-green-300"
                  : "border-emerald-200 bg-white/80 text-emerald-700 hover:bg-emerald-50 hover:shadow-md active:bg-emerald-100 dark:border-emerald-700/50 dark:bg-gray-800/80 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              }`}
              title="Copy a shareable link that pre-fills this form"
            >
              {shareCopied ? (
                <>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  Share Tool
                </>
              )}
            </button>
            <button
              onClick={generateQRCode}
              className="group flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white/80 px-4 py-3 font-semibold text-emerald-700 backdrop-blur-sm transition-all hover:bg-emerald-50 hover:shadow-md dark:border-emerald-700/50 dark:bg-gray-800/80 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
            >
              <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
              {showQR ? 'Hide QR' : 'QR Code'}
            </button>
          </div>

          {/* QR Code Section */}
          {showQR && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-white/60 p-6 backdrop-blur-sm dark:border-emerald-700/50 dark:bg-gray-800/60">
              <div className="text-center">
                <h4 className="mb-4 font-semibold text-emerald-900 dark:text-emerald-100">
                  QR Code for WhatsApp Link
                </h4>
                <div className="mb-4 flex justify-center">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedLink)}`}
                      alt="QR Code for WhatsApp link"
                      className="h-auto w-auto max-w-[200px]"
                      loading="lazy"
                    />
                  </div>
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Scan this QR code with your phone to open the WhatsApp link directly
                </p>
                <button
                  onClick={() => {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(generatedLink)}`
                    window.open(qrUrl, '_blank')
                  }}
                  className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-700"
                >
                  Download High-Res QR Code
                </button>
              </div>
            </div>
          )}

          {/* Embed Section */}
          <details className="mt-6">
            <summary className="group flex cursor-pointer items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
              <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Embed this Tool
            </summary>
            <div className="mt-3 rounded-xl border border-emerald-200 bg-white/60 p-4 backdrop-blur-sm dark:border-emerald-700/50 dark:bg-gray-800/60">
              <div className="relative">
                <input
                  type="text"
                  value={embedCode}
                  readOnly
                  className="w-full rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-white"
                />
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(embedCode)
                      setEmbedCopied(true)
                      setTimeout(() => setEmbedCopied(false), 2000)
                      toast({
                        title: "Embed Code Copied!",
                        description: "Code copied to clipboard",
                      })
                    } catch (err) {
                      toast({
                        title: "Error",
                        description: "Failed to copy embed code",
                        variant: "destructive",
                      })
                    }
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    embedCopied 
                      ? "bg-green-600 text-white"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {embedCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                Embed dimensions: 360×280px • Perfect for sidebars and widgets
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

// Telegram Tab Component
function TelegramTab() {
  const [mode, setMode] = useState<"user" | "bot">("user")
  const [username, setUsername] = useState("")
  const [botName, setBotName] = useState("")
  const [startParam, setStartParam] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [showQR, setShowQR] = useState(false)
  const { toast } = useToast()

  const generateLink = () => {
    if (mode === "user" && !username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      })
      return
    }

    if (mode === "bot" && !botName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a bot name",
        variant: "destructive",
      })
      return
    }

    let link = ""
    if (mode === "user") {
      link = `https://t.me/${username.replace('@', '')}`
    } else {
      link = `https://t.me/${botName.replace('@', '')}`
      if (startParam.trim()) {
        link += `?start=${encodeURIComponent(startParam)}`
      }
    }

    setGeneratedLink(link)
  }

  const copyToClipboard = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink)
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-700">
        <button
          onClick={() => setMode("user")}
          className={`flex-1 rounded-l-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "user"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          User/Channel
        </button>
        <button
          onClick={() => setMode("bot")}
          className={`flex-1 rounded-r-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "bot"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Bot
        </button>
      </div>

      {/* Form Section */}
      <div className="space-y-4">
        {mode === "user" ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username (without @)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bot Name (without @)
              </label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="botname"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Parameter (optional)
              </label>
              <input
                type="text"
                value={startParam}
                onChange={(e) => setStartParam(e.target.value)}
                placeholder="promo123"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </>
        )}

        <button
          onClick={generateLink}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Generate Telegram Link
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Everything is created locally in your browser. Nothing is stored.
        </p>
      </div>

      {/* Result Section */}
      {generatedLink && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
            Your Telegram Link
          </h3>

          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={copyToClipboard}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Copy
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.open(generatedLink, '_blank')}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Open in Telegram
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
          </div>

          {/* QR Code Section for Telegram */}
          {showQR && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
                QR Code for Telegram Link
              </h4>
              <div className="mb-4 flex justify-center">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedLink)}`}
                    alt="QR Code for Telegram link"
                    className="h-auto w-auto max-w-[200px]"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan this QR code to open the Telegram link
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Messenger Tab Component
function MessengerTab() {
  const [username, setUsername] = useState("")
  const [refCode, setRefCode] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [showQR, setShowQR] = useState(false)
  const { toast } = useToast()

  const generateLink = () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a page username",
        variant: "destructive",
      })
      return
    }

    let link = `https://m.me/${username.replace('@', '')}`
    if (refCode.trim()) {
      link += `?ref=${encodeURIComponent(refCode)}`
    }

    setGeneratedLink(link)
  }

  const copyToClipboard = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink)
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Page Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="YourPage"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reference Code (optional)
          </label>
          <input
            type="text"
            value={refCode}
            onChange={(e) => setRefCode(e.target.value)}
            placeholder="promo123"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <button
          onClick={generateLink}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Generate Messenger Link
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Everything is created locally in your browser. Nothing is stored.
        </p>
      </div>

      {/* Result Section */}
      {generatedLink && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
            Your Messenger Link
          </h3>

          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={copyToClipboard}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Copy
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.open(generatedLink, '_blank')}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Open in Messenger
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
          </div>

          {/* QR Code Section for Messenger */}
          {showQR && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
                QR Code for Messenger Link
              </h4>
              <div className="mb-4 flex justify-center">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedLink)}`}
                    alt="QR Code for Messenger link"
                    className="h-auto w-auto max-w-[200px]"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan this QR code to open the Messenger link
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Discord Tab Component
function DiscordTab() {
  const [mode, setMode] = useState<"invite" | "message">("invite")
  const [inviteCode, setInviteCode] = useState("")
  const [serverId, setServerId] = useState("")
  const [channelId, setChannelId] = useState("")
  const [messageId, setMessageId] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [showQR, setShowQR] = useState(false)
  const { toast } = useToast()

  const generateLink = () => {
    if (mode === "invite" && !inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite code",
        variant: "destructive",
      })
      return
    }

    if (mode === "message" && (!serverId.trim() || !channelId.trim() || !messageId.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    let link = ""
    if (mode === "invite") {
      link = `https://discord.gg/${inviteCode}`
    } else {
      link = `https://discord.com/channels/${serverId}/${channelId}/${messageId}`
    }

    setGeneratedLink(link)
  }

  const copyToClipboard = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink)
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-700">
        <button
          onClick={() => setMode("invite")}
          className={`flex-1 rounded-l-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "invite"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Invite Link
        </button>
        <button
          onClick={() => setMode("message")}
          className={`flex-1 rounded-r-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "message"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Jump to Message
        </button>
      </div>

      {/* Form Section */}
      <div className="space-y-4">
        {mode === "invite" ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="ABC123"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Server ID
                </label>
                <input
                  type="text"
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  placeholder="123456789012345678"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Channel ID
                </label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="123456789012345678"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message ID
                </label>
                <input
                  type="text"
                  value={messageId}
                  onChange={(e) => setMessageId(e.target.value)}
                  placeholder="123456789012345678"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </>
        )}

        <button
          onClick={generateLink}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Generate Discord Link
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Everything is created locally in your browser. Nothing is stored.
        </p>
      </div>

      {/* Result Section */}
      {generatedLink && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
            Your Discord Link
          </h3>

          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={copyToClipboard}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
            >
              Copy
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.open(generatedLink, '_blank')}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
            >
              Open in Discord
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
          </div>

          {/* QR Code Section for Discord */}
          {showQR && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
                QR Code for Discord Link
              </h4>
              <div className="mb-4 flex justify-center">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedLink)}`}
                    alt="QR Code for Discord link"
                    className="h-auto w-auto max-w-[200px]"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan this QR code to open the Discord link
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// SEO Content Component
function SEOContent() {
  return (
    <div className="space-y-8">
      {/* What is a Chat Link Generator */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          What Is a Chat Link Generator?
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          A chat link generator creates direct links that open messaging apps and start conversations instantly.
          These links work across platforms like WhatsApp, Telegram, Facebook Messenger, and Discord, making it
          easy to connect with users without them having to manually search for your contact or channel.
        </p>
      </section>

      {/* Platform-specific sections */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          WhatsApp Click-to-Chat
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          WhatsApp click-to-chat links use the wa.me domain to directly open WhatsApp with a pre-filled phone number.
          Add a custom message to get the conversation started immediately.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>Perfect for customer support and sales</li>
          <li>Works on both mobile and desktop</li>
          <li>Include country codes for international numbers</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Telegram Deep Links
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Telegram deep links use the t.me domain and can point to users, channels, groups, or bots.
          Bot links can include start parameters to trigger specific actions.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>Works for both personal chats and channels</li>
          <li>Bot integration with custom start parameters</li>
          <li>Universal links work on all platforms</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Messenger m.me Links
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Facebook Messenger uses the m.me domain for direct links to business pages.
          These links work across all devices and automatically open the Messenger app.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>Official Facebook integration</li>
          <li>Works with business pages and verified accounts</li>
          <li>Reference codes for tracking campaigns</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Discord Invites & Message Links
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Discord supports both invite links (discord.gg) and direct message links using channel and message IDs.
          Perfect for community management and support teams.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>Server invite links for new members</li>
          <li>Direct links to specific messages</li>
          <li>Works on both desktop and mobile Discord</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              How do I create a WhatsApp click-to-chat link?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Enter the phone number with country code and optional message, then click "Generate WhatsApp Link".
              The link will use the format: https://wa.me/phonenumber?text=message
            </p>
          </div>

          <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              Can I prefill a message?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Yes! All platforms support pre-filled messages. For WhatsApp, Telegram bots, and Messenger,
              you can enter a custom message that will appear when the link is opened.
            </p>
          </div>

          <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              How do Telegram bot parameters work?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Telegram bot links can include a "start" parameter like /start@promise. This allows you to
              pass custom data to your bot when users click the link, useful for referral programs or
              custom onboarding flows.
            </p>
          </div>

          <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              How do I link to a Discord message?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              To link to a specific Discord message, right-click the message and select "Copy Message Link",
              or use the developer tools to get the message ID. You'll need the server ID, channel ID, and message ID.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              Is this private?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Yes, completely private. All link generation happens locally in your browser.
              No data is sent to our servers, and nothing is stored. Your information stays on your device.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// Advanced Options Component
function AdvancedOptions() {
  const [isOpen, setIsOpen] = useState(false)
  const [utmSource, setUtmSource] = useState("")
  const [utmMedium, setUtmMedium] = useState("")
  const [utmCampaign, setUtmCampaign] = useState("")
  const [qrSize, setQrSize] = useState<"128" | "256" | "512">("256")

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("chat-link-generator-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setUtmSource(settings.utmSource || "")
      setUtmMedium(settings.utmMedium || "")
      setUtmCampaign(settings.utmCampaign || "")
      setQrSize(settings.qrSize || "256")
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    const settings = {
      utmSource,
      utmMedium,
      utmCampaign,
      qrSize,
    }
    localStorage.setItem("chat-link-generator-settings", JSON.stringify(settings))
  }, [utmSource, utmMedium, utmCampaign, qrSize])

  const resetSettings = () => {
    setUtmSource("")
    setUtmMedium("")
    setUtmCampaign("")
    setQrSize("256")
    localStorage.removeItem("chat-link-generator-settings")
  }

  return (
    <div className="mb-12 overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 shadow-xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between p-8 font-semibold text-gray-900 transition-all hover:bg-gray-50/50 dark:text-white dark:hover:bg-gray-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
            <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-lg">Advanced Options</span>
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="h-4 w-4 text-gray-500 transition-transform dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="space-y-6 px-6 pb-6">
          {/* UTM Parameters */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
              UTM Parameters (Optional)
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Source
                </label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="facebook"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Medium
                </label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="social"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campaign
                </label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="summer-promo"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              UTM parameters help track your links in analytics tools like Google Analytics.
            </p>
          </div>

          {/* QR Code Settings */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
              QR Code Settings
            </h3>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                QR Code Size
              </label>
              <select
                value={qrSize}
                onChange={(e) => setQrSize(e.target.value as "128" | "256" | "512")}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="128">128x128 pixels (Small)</option>
                <option value="256">256x256 pixels (Medium)</option>
                <option value="512">512x512 pixels (Large)</option>
              </select>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Choose the size for generated QR codes. Larger sizes are easier to scan but take longer to generate.
            </p>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <button
              onClick={resetSettings}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="space-y-4 text-center">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a
            href="/discord-timestamp"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Discord Timestamp Generator
          </a>
          <span className="text-gray-500">•</span>
          <span className="text-gray-500">More tools coming soon...</span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Not affiliated with WhatsApp, Telegram, Meta/Facebook, or Discord.
        </p>
      </div>
    </footer>
  )
}
