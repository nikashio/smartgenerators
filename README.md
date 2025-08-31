# Smart Generators

> A collection of free, privacy-focused web tools for developers and content creators.

🌐 **Live Site**: [https://smartgenerators.dev](https://smartgenerators.dev)

## 🚀 Available Tools

### 💬 Chat Link Generator
**URL**: [https://smartgenerators.dev/chat-link-generator](https://smartgenerators.dev/chat-link-generator)

Generate direct messaging links for popular platforms:
- **WhatsApp** - `wa.me` links with pre-filled messages
- **Telegram** - Deep links and bot integration
- **Facebook Messenger** - `m.me` links 
- **Discord** - Server and user invites

**Features:**
- QR code generation for all platforms
- Embed code for websites
- Shareable tool links
- Mobile-optimized interface

### ⏰ Discord Timestamp Generator
**URL**: [https://smartgenerators.dev/discord-timestamp](https://smartgenerators.dev/discord-timestamp)

Create dynamic Discord timestamps that display relative time:
- Natural language input ("in 2 hours", "tomorrow 8am")
- Multiple format options (relative, short date, long date, etc.)
- Snowflake ID decoder
- Timezone-aware previews

**Features:**
- Real-time preview in local timezone
- Copy timestamps with visual feedback
- URL sharing with pre-filled data
- Keyboard shortcuts (Enter to copy)

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom components with shadcn/ui patterns
- **Deployment**: Optimized for [Vercel](https://vercel.com/)

## 🎨 Features

### 🌙 Dark Mode Support
Full dark/light theme toggle with system preference detection.

### 📱 Mobile-First Design
Responsive layouts optimized for all screen sizes.

### ♿ Accessibility
- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader optimized
- High contrast focus states

### 🔍 SEO Optimized
- Complete meta tags and Open Graph data
- JSON-LD structured data
- Optimized sitemap.xml
- Canonical URLs

### 🚀 Performance
- Server-side rendering (SSR)
- Optimized images and assets
- Minimal JavaScript bundle
- Fast loading times

## 📁 Project Structure

```
smartgenerators/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with SEO metadata
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Global styles
│   ├── chat-link-generator/     # Chat link tool
│   │   ├── layout.tsx           # Tool-specific SEO
│   │   └── page.tsx             # Main tool component
│   └── discord-timestamp/       # Discord timestamp tool
│       ├── layout.tsx           # Tool-specific SEO
│       └── page.tsx             # Main tool component
├── components/                   # Reusable UI components
│   ├── ui/                      # shadcn/ui components
│   └── theme-provider.tsx       # Dark mode provider
├── lib/                         # Utility functions
│   └── utils.ts                 # Common utilities
├── public/                      # Static assets
│   ├── sitemap.xml              # SEO sitemap
│   ├── robots.txt               # Search engine directives
│   └── *.png                    # Images and icons
└── styles/                      # Additional stylesheets
    └── globals.css              # Global CSS imports
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smartgenerators.git
   cd smartgenerators
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run type-check # Run TypeScript checks
```

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on push to main branch
3. Custom domain setup available

### Manual Deployment
```bash
npm run build
npm run start
```

## 🔧 Configuration

### Environment Variables
Create `.env.local` for local development:

```env
# Optional: Analytics tracking
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Error monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Customization
- **Colors**: Edit Tailwind config in `tailwind.config.js`
- **Fonts**: Update in `app/layout.tsx`
- **SEO**: Modify metadata in layout files
- **Tools**: Add new tools in `app/` directory

## 📈 Analytics & Monitoring

### Recommended Setup
- **Google Analytics 4**: Traffic and user behavior
- **Microsoft Clarity**: Heatmaps and session recordings
- **Sentry**: Error monitoring (optional)

### Privacy Compliance
- Cookie consent banner (if using GA4)
- Privacy policy included
- GDPR/CCPA compliant options available

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-tool
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing new tool'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-tool
   ```
5. **Open a Pull Request**

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Semantic commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) for component inspiration
- [Vercel](https://vercel.com/) for seamless deployment

## 📞 Support

- **Website**: [https://smartgenerators.dev](https://smartgenerators.dev)
- **Issues**: [GitHub Issues](https://github.com/yourusername/smartgenerators/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/smartgenerators/discussions)

---

Built with ❤️ for the developer community. Free to use, modify, and distribute.
