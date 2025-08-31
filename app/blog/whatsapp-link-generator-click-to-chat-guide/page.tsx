"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"

/**
 * Page component rendering the article content with consistent site styling
 * Matches the design language used throughout Smart Generators
 */
export default function BlogPost() {
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
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <header className="relative mb-12 text-center">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300">
              <span className="text-lg">🔗</span>
              Smart Generators
            </Link>
          </div>

          {/* Theme Toggle Button */}
          <div className="absolute top-0 right-0">
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full border border-gray-200/50 bg-white/80 text-sm backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              <span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
              <span role="img" aria-hidden="true">{isDarkMode ? "🌙" : "☀️"}</span>
            </button>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              How to Create WhatsApp
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Click-to-Chat Links</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Complete guide with QR codes — <span className="font-semibold text-gray-900 dark:text-white">free, no signup required</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free Tool
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm dark:bg-blue-900/30 dark:text-blue-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              QR Codes
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm dark:bg-purple-900/30 dark:text-purple-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Privacy-first
            </div>
          </div>
        </header>

        <main className="space-y-8">
          {/* TL;DR Card */}
          <div className="rounded-3xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-green-50 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-emerald-800/30 dark:from-emerald-900/20 dark:to-green-900/20">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">TL;DR</h2>
            </div>
            <p className="text-emerald-800 dark:text-emerald-200">
              Use this free tool to build a WhatsApp click-to-chat link or QR code in seconds: <Link href="/chat-link-generator" className="font-semibold text-emerald-600 underline hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">Chat Link Generator</Link>
            </p>
          </div>

          {/* Article Sections */}
          <div className="space-y-8">
            <Section title="Why click-to-chat links matter">
              <p>If you sell anything online or handle support through WhatsApp, don't force people to save your number first. A click-to-chat link opens a chat with you instantly—on web or mobile—with an optional prefilled message. It reduces friction and increases replies.</p>
            </Section>

            <Section title="The fastest way (free tool)">
              <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li>Open the Chat Link Generator → <Link href="/chat-link-generator" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300">https://smartgenerators.dev/chat-link-generator</Link></li>
                <li>Select WhatsApp (default tab).</li>
                <li>Enter your phone number (auto-formats to international E.164).</li>
                <li>(Optional) Add a prefilled message like "Hi! I'd like to order."</li>
                <li>Click Generate Link → Copy or Download QR.</li>
              </ol>
              <p className="mt-4">You'll get a link like:</p>
              <div className="mt-2 rounded-lg bg-gray-900 p-4 dark:bg-gray-800">
                <code className="text-sm text-green-400">https://wa.me/15551234567?text=Hi%21%20I%27d%20like%20to%20order</code>
              </div>
              <p className="mt-4">Paste it anywhere: Instagram bio, website button, Google Business profile, flyers (via QR), or email signature.</p>
            </Section>

            <Section title="Manual format (if you're hand-crafting)">
              <p><strong>Short, safe format:</strong></p>
              <div className="mt-2 rounded-lg bg-gray-900 p-4 dark:bg-gray-800">
                <code className="text-sm text-green-400">https://wa.me/&lt;E164&gt;?text=&lt;URL_ENCODED_MESSAGE&gt;</code>
              </div>
              <p className="mt-4"><strong>Example:</strong></p>
              <div className="mt-2 rounded-lg bg-gray-900 p-4 dark:bg-gray-800">
                <code className="text-sm text-green-400">https://wa.me/447911123456?text=Hello%20there</code>
              </div>
              <p className="mt-4"><strong>Notes:</strong></p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
                <li>Use digits only with country code (no +, spaces, or dashes in the URL path).</li>
                <li>Always URL-encode your message (spaces → %20, etc.).</li>
              </ul>
            </Section>

            <Section title="Add a QR code (for menus, posters, packaging)">
              <p>In the generator, click QR Code → Download PNG. Print it on your menu, storefront, flyers, or package inserts. Scanning the code opens the chat instantly with your prefilled message.</p>
            </Section>

            <Section title="Pro tips that increase replies">
              <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                <li>Prefill intent: "Hi! I want to book a table for [date] at [time]."</li>
                <li>Track campaigns: In the generator's Advanced panel, add UTM parameters so you know whether Instagram, email, or print works best.</li>
                <li>Localize the message for each campaign/region.</li>
                <li>Use a short label on buttons: "Chat on WhatsApp".</li>
              </ul>
            </Section>

            <Section title="Common mistakes (and quick fixes)">
              <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                <li>Spaces not encoded → Use %20 or let the tool encode for you.</li>
                <li>Wrong number format → Include country code; strip brackets/dashes from the path.</li>
                <li>Using + in the path → For wa.me, don't include + in &lt;number&gt; (keep only digits).</li>
                <li>Message too long → Keep it concise; people can edit after opening.</li>
              </ul>
            </Section>

            <Section title="Where to place your link (ideas)">
              <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                <li>Instagram / TikTok bio ("Chat on WhatsApp")</li>
                <li>Website CTA button ("Order on WhatsApp")</li>
                <li>Email signature ("Questions? Message us")</li>
                <li>Google Business profile (add to website/chat fields)</li>
                <li>Printed materials via QR (menus, flyers, posters, packaging)</li>
              </ul>
            </Section>

            <Section title="Troubleshooting">
              <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                <li>Link opens WhatsApp Web instead of the app? → That's normal on desktop; on mobile it opens the app.</li>
                <li>Prefilled text not showing? → Make sure it's URL-encoded (use the generator).</li>
                <li>Multiple languages? → Create separate links per language and route users by page locale.</li>
              </ul>
            </Section>

            <Section title="Bonus: Telegram, Messenger & Discord links">
              <p>The same page also builds links for Telegram (user/channel/bot), Messenger (m.me) and Discord (invites or message jump)—handy if your audience prefers other chat apps: <Link href="/chat-link-generator" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300">Chat Link Generator</Link></p>
            </Section>

            <Section title="Final checklist">
              <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                <li>✅ Link works on mobile and desktop</li>
                <li>✅ Message is short, clear, and encoded</li>
                <li>✅ Button text says "Chat on WhatsApp" (or local equivalent)</li>
                <li>✅ QR code placed where people actually see it</li>
                <li>✅ Campaign UTMs set in Advanced, if you track traffic</li>
              </ul>
            </Section>
          </div>

          {/* FAQ Section */}
          <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">Can I prefill a message in the link?</summary>
                <p className="mt-2 text-gray-700 dark:text-gray-300">Yes. Use the message box in the generator; it automatically URL-encodes the text.</p>
              </details>
              <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">Do users need to save my number?</summary>
                <p className="mt-2 text-gray-700 dark:text-gray-300">No. The link opens a chat immediately.</p>
              </details>
              <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">Is this private?</summary>
                <p className="mt-2 text-gray-700 dark:text-gray-300">Everything is generated locally in your browser. No data is stored.</p>
              </details>
              <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">Can I track which campaign works best?</summary>
                <p className="mt-2 text-gray-700 dark:text-gray-300">Use the Advanced → UTM parameters. Review sources in your analytics.</p>
              </details>
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-3xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-blue-800/30 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Ready to build yours?</h2>
              <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
                👉 Create a WhatsApp link or QR code now
              </p>
              <Link
                href="/chat-link-generator"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <span>Open Chat Link Generator</span>
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Related Tools */}
          <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Related Tools</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Link href="/chat-link-generator" className="group rounded-xl border border-gray-200/50 p-6 transition-all hover:shadow-lg dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30">
                    <span className="text-xl">🔗</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Chat Link Generator</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create links for WhatsApp, Telegram, and more</p>
                  </div>
                </div>
              </Link>
              <Link href="/discord-timestamp" className="group rounded-xl border border-gray-200/50 p-6 transition-all hover:shadow-lg dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                    <span className="text-xl">⏰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Discord Timestamp Generator</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Working across timezones? Generate Discord timestamps</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 rounded-2xl border border-gray-200/50 bg-white/80 p-6 text-center backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80">
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Smart Generators Home
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/discord-timestamp" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Discord Timestamps
              </Link>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">More tools coming soon...</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Not affiliated with WhatsApp, Meta, or any messaging platforms.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

/**
 * Reusable section component for consistent article styling
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </section>
  )
}


