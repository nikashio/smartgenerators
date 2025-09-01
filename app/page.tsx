"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"

/**
 * Homepage - Hub of free online tools for everyday problems
 * Lists all available tools in a clean, scannable format
 */
export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Initialize theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme")
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

      if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        setIsDarkMode(true)
        document.documentElement.classList.add("dark")
      } else {
        setIsDarkMode(false)
        document.documentElement.classList.remove("dark")
      }
    }
  }, [])

  // Toggle theme
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Header */}
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Tools Grid */}
        <ToolsGrid />
        
        {/* Blog Section */}
        <BlogSection />
        
        {/* Why Section */}
        <WhySection />
        
        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Header Component
function Header({ toggleTheme, isDarkMode }: { toggleTheme: () => void; isDarkMode: boolean }) {
  return (
    <header className="relative">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <span className="text-lg font-bold">SG</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Smart Generators
            </h1>
          </div>

          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              Home
            </Link>
            <Link 
              href="/blog/whatsapp-link-generator-click-to-chat-guide" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              Blog
            </Link>
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full border border-gray-200/50 bg-white/80 text-sm backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              <span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
              <span role="img" aria-hidden="true">{isDarkMode ? "🌙" : "☀️"}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

// Hero Section Component
function HeroSection() {
  return (
    <section className="py-16 text-center">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Free Online Generators
          </span>
          <br />
          <span className="text-gray-900 dark:text-white">for Everyday Problems</span>
        </h1>
        
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          Simple, privacy-first tools that save time — 
          <span className="font-semibold text-gray-900 dark:text-white">no signup, no ads.</span>
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
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Lightning Fast
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm dark:bg-purple-900/30 dark:text-purple-300">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Privacy-first
          </div>
        </div>
      </div>
    </section>
  )
}

// Tools Grid Component
function ToolsGrid() {
  const tools = [
    {
      id: "discord-timestamp",
      title: "Discord Timestamp Generator",
      description: "Generate <t:UNIX:FORMAT> codes, preview times in UTC/local, decode Snowflake IDs.",
      href: "/discord-timestamp",
      icon: "⏰",
      color: "blue",
      features: ["Natural language input", "Multiple formats", "Snowflake decoder"]
    },
    {
      id: "chat-link-generator", 
      title: "Chat Link Generator",
      description: "Create WhatsApp, Telegram, Messenger & Discord deep links with optional QR codes.",
      href: "/chat-link-generator",
      icon: "🔗",
      color: "emerald",
      features: ["Multi-platform support", "QR code generation", "Embed widgets"]
    },
    {
      id: "countdown",
      title: "Countdown Timer Generator",
      description: "Create countdown timers for events, launches, exams, or streams with shareable links.",
      href: "/countdown",
      icon: "⏳",
      color: "purple",
      features: ["Shareable links", "Embeddable widgets", "Social sharing"]
    }
  ]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Our Tools
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose from our growing collection of free online generators
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="group relative overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm transition-all hover:shadow-3xl dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20"
            >
              <div className="mb-6 flex items-start gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${
                  tool.color === 'blue' 
                    ? 'from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30' 
                    : tool.color === 'emerald' 
                    ? 'from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30'
                    : 'from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'
                }`}>
                  <span className="text-2xl">{tool.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feature, index) => (
                    <span
                      key={index}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        tool.color === 'blue'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : tool.color === 'emerald'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={tool.href}
                className={`group/btn inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all hover:shadow-lg ${
                  tool.color === 'blue'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    : tool.color === 'emerald'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                Open Tool
                <svg className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Blog Section Component
function BlogSection() {
  const blogPosts = [
    {
      id: "whatsapp-link-generator-guide",
      title: "How to Create WhatsApp Click-to-Chat Links",
      description: "Complete guide with QR codes — learn to build WhatsApp links that increase customer engagement and reduce friction.",
      href: "/blog/whatsapp-link-generator-click-to-chat-guide",
      icon: "💬",
      color: "emerald",
      readTime: "5 min read",
      tags: ["WhatsApp", "Marketing", "QR Codes"]
    }
  ]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Latest Guides
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Learn how to get the most out of our tools with step-by-step guides
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-1">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="group relative overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm transition-all hover:shadow-3xl dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20"
            >
              <div className="mb-6 flex items-start gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${
                  post.color === 'emerald' 
                    ? 'from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30'
                    : 'from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
                }`}>
                  <span className="text-2xl">{post.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {post.title}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {post.readTime}
                    </span>
                  </div>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    {post.description}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          post.color === 'emerald'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href={post.href}
                className={`group/btn inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all hover:shadow-lg ${
                  post.color === 'emerald'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                Read Guide
                <svg className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Why Section Component
function WhySection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20 md:p-12">
          <h2 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
            Why Smart Generators?
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mx-auto">
                <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Privacy First
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All tools run entirely in your browser. No data is sent to our servers or stored anywhere.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 mx-auto">
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Simple & Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                One-click copy, QR generation, and embed widgets. No complex interfaces or learning curves.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 mx-auto">
                <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Growing Library
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                More free tools coming soon — file converters, calendar helpers, and other useful generators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// FAQ Section Component
function FAQSection() {
  const faqs = [
    {
      question: "Are these tools free?",
      answer: "Yes! All our tools are completely free to use with no hidden fees, subscriptions, or premium tiers."
    },
    {
      question: "Do I need to sign up?",
      answer: "No signup required. Just visit any tool and start using it immediately."
    },
    {
      question: "Is my data stored?",
      answer: "No, all processing happens locally in your browser. We don't store, track, or send your data anywhere."
    },
    {
      question: "What tools are coming next?",
      answer: "We're adding more useful generators soon — like file converters, calendar helpers, and other productivity tools."
    }
  ]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80"
            >
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="border-t border-gray-200/50 py-12 dark:border-gray-700/50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <span className="text-sm font-bold">SG</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Smart Generators</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Free, privacy-first online tools for everyday problems.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">Tools</h4>
            <div className="space-y-2">
              <Link href="/discord-timestamp" className="block text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                Discord Timestamp Generator
              </Link>
              <Link href="/chat-link-generator" className="block text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                Chat Link Generator
              </Link>
              <Link href="/countdown" className="block text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                Countdown Timer Generator
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">Legal</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Smart Generators is not affiliated with Discord, WhatsApp, Telegram, or Meta.
            </p>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Smart Generators
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}