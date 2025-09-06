import Link from "next/link"
import type { Metadata } from "next"
import { allTools } from "@/lib/tools"

export const metadata: Metadata = {
  title: "All Tools – Smart Generators",
  description: "Browse all free, privacy-first online tools from Smart Generators.",
  alternates: {
    canonical: "https://smartgenerators.dev/tools",
  },
}

export default function ToolsPage() {
  const categories = allTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = []
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, typeof allTools>)

  const categoryInfo = {
    Communication: {
      icon: "💬",
      description: "Tools for messaging, chat links, and social platforms",
    },
    Productivity: {
      icon: "⚡",
      description: "Time management, calendar, and workflow tools",
    },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              All Tools
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore our full collection of free online generators
            </p>
          </div>

          <div className="space-y-16">
            {Object.entries(categories).map(([categoryName, categoryTools]) => (
              <div key={categoryName} className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-3 dark:from-gray-800 dark:to-blue-900/30">
                    <span className="text-2xl">
                      {categoryInfo[categoryName as keyof typeof categoryInfo]?.icon}
                    </span>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {categoryName}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {categoryInfo[categoryName as keyof typeof categoryInfo]?.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                  {categoryTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="group relative flex min-h-[400px] flex-col overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm transition-all hover:shadow-3xl dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20"
                    >
                      <div className="mb-6 flex items-start gap-4">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${
                            tool.color === "blue"
                              ? "from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30"
                              : tool.color === "emerald"
                              ? "from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30"
                              : tool.color === "cyan"
                              ? "from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30"
                              : tool.color === "indigo"
                              ? "from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30"
                              : tool.color === "orange"
                              ? "from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30"
                              : "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
                          }`}
                        >
                          <span className="text-2xl">{tool.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                            {tool.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">{tool.description}</p>
                        </div>
                      </div>

                      <div className="mb-6 flex-grow">
                        <div className="flex flex-wrap gap-2">
                          {tool.features.map((feature, index) => (
                            <span
                              key={index}
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                tool.color === "blue"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  : tool.color === "emerald"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : tool.color === "cyan"
                                  ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                                  : tool.color === "indigo"
                                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                  : tool.color === "orange"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                              }`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <Link
                          href={tool.href}
                          className={`group/btn inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all hover:shadow-lg ${
                            tool.color === "blue"
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              : tool.color === "emerald"
                              ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                              : tool.color === "cyan"
                              ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                              : tool.color === "indigo"
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              : tool.color === "orange"
                              ? "bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          }`}
                        >
                          Open Tool
                          <svg
                            className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
