export type Tool = {
  id: string
  title: string
  description: string
  href: string
  icon: string
  color: "blue" | "emerald" | "purple" | "indigo" | "cyan" | "orange" | "green"
  category: "Communication" | "Productivity"
  features: string[]
}

export const allTools: Tool[] = [
  {
    id: "discord-timestamp",
    title: "Discord Timestamp Generator",
    description: "Generate <t:UNIX:FORMAT> codes, preview times in UTC/local, decode Snowflake IDs.",
    href: "/discord-timestamp",
    icon: "⏰",
    color: "blue",
    category: "Communication",
    features: ["Natural language input", "Multiple formats", "Snowflake decoder"],
  },
  {
    id: "chat-link-generator",
    title: "Chat Link Generator",
    description: "Create WhatsApp, Telegram, Messenger & Discord deep links with optional QR codes.",
    href: "/chat-link-generator",
    icon: "🔗",
    color: "emerald",
    category: "Communication",
    features: ["Multi-platform support", "QR code generation", "Embed widgets"],
  },
  {
    id: "countdown",
    title: "Countdown Timer Generator",
    description: "Create countdown timers for events, launches, exams, or streams with shareable links.",
    href: "/countdown",
    icon: "⏳",
    color: "purple",
    category: "Productivity",
    features: ["Shareable links", "Embeddable widgets", "Social sharing"],
  },
  {
    id: "add-to-calendar",
    title: "Add to Calendar Link Generator",
    description: "Create calendar links and downloadable .ics files for Google, Outlook, Apple Calendar, and more.",
    href: "/add-to-calendar",
    icon: "📅",
    color: "indigo",
    category: "Productivity",
    features: ["Multi-calendar support", "ICS file download", "Recurring events"],
  },
  {
    id: "time-zone-planner",
    title: "Time Zone Meeting Planner",
    description: "Find optimal meeting times across multiple time zones with shareable links and calendar integration.",
    href: "/time-zone-planner",
    icon: "🌍",
    color: "cyan",
    category: "Productivity",
    features: ["Multi-timezone scheduling", "Shareable links", "Calendar integration"],
  },
  {
    id: "sunrise-sunset",
    title: "Sunrise & Sunset Calculator",
    description: "Get precise sunrise, sunset, and golden hour times for any city. Download calendar files or subscribe to daily updates.",
    href: "/sunrise-sunset",
    icon: "🌅",
    color: "orange",
    category: "Productivity",
    features: ["Global city support", "Golden hour times", "Calendar export"],
  },
  {
    id: "heic-converter",
    title: "HEIC Converter (JPG/PNG/PDF)",
    description: "Convert HEIC/HEIF to JPG, PNG, or PDF — private, no uploads.",
    href: "/convert/heic-converter",
    icon: "🖼️",
    color: "green",
    category: "Productivity",
    features: ["Privacy-first conversion", "Batch processing", "Browser-based"],
  },
  {
    id: "image-grayscale",
    title: "Image to Black & White",
    description: "Convert images to clean grayscale entirely in your browser.",
    href: "/image-grayscale",
    icon: "🎨",
    color: "indigo",
    category: "Productivity",
    features: ["Privacy-first (local)", "PNG/JPG output", "Drag-and-drop uploads"],
  },
]
