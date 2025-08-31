Spec: Multi-App Chat Link Generator Website
🎯 Purpose

A one-page web app that generates deep links and QR codes for WhatsApp, Telegram, Messenger, and Discord.
No signup, no ads. Simple, fast, mobile-friendly. SEO-optimized.

🖼 Layout (Top → Bottom)
1. Header / Hero

Logo (text only): Smart Generators

H1 (main title): “Free Chat Link Generator (WhatsApp, Telegram, Messenger, Discord)”

Subtitle: “Create click-to-chat links and QR codes in seconds — no signup required.”

Badges under subtitle: “Free”, “Privacy-first”, “No signup”

2. Tool Section (Tabbed Interface)

Tabs across the top: WhatsApp | Telegram | Messenger | Discord

Each tab shows:

A Form Card (inputs)

A Result Card (output link + actions)

Shared Form Behavior

Clear labels + placeholders.

Validate input instantly (show errors inline).

Button at bottom: Generate Link.

Helper note below: “Everything is created locally in your browser. Nothing is stored.”

Shared Result Card

Shows the Generated Link in a readonly input.

Buttons: Copy, Open, Show QR (with inline QR preview + “Download PNG”), Reset.

A Copy Shareable Link button → generates URL with query params that restore current state.

Collapsed section: Embed this Tool → shows <iframe src="...embed=1">.

3. Tab Details
WhatsApp Tab

Fields:

Phone number (with country code dropdown, normalize to digits only).

Optional message text.

Output format:
https://wa.me/<number>?text=<encoded-message>

Telegram Tab

Mode toggle: User/Channel OR Bot.

Fields:

Username (no @)

For bots: Bot name + optional “start” parameter.

Output:

https://t.me/username

https://t.me/botname?start=promo123

Messenger Tab

Fields:

Page username

Optional ref code

Output:

https://m.me/username

https://m.me/username?ref=promo123

Discord Tab

Mode toggle: Invite OR Jump to Message.

Fields:

Invite code → https://discord.gg/<code>

OR IDs: Server, Channel, Message → https://discord.com/channels/<server>/<channel>/<message>

4. Advanced Options (collapsible)

Add UTM parameters (source, medium, campaign).

QR options (size: 128/256/512).

Persist settings in localStorage.

5. SEO Content (below tool)

H2: What Is a Chat Link Generator? (short explanation)

H2: WhatsApp Click-to-Chat (use cases)

H2: Telegram Deep Links

H2: Messenger m.me Links

H2: Discord Invites & Message Links

H2: FAQ (accordion with ~5 Q&As)

Example FAQ:

How do I create a WhatsApp click-to-chat link?

Can I prefill a message?

How do Telegram bot parameters work?

How do I link to a Discord message?

Is this private?

6. Footer

Cross-links: Discord Timestamp Generator, future tools.

Disclaimer: “Not affiliated with WhatsApp, Telegram, Meta/Facebook, or Discord.”

⚙️ Functional Details
Shareable Link Parameters

app=whatsapp|telegram|messenger|discord

Per app, include params like phone=, text=, bot=, ref=, etc.

embed=1 → compact widget mode.

Embed Mode

If ?embed=1:

Hide header, SEO content, footer.

Show only active tab form + result card.

Fit inside 360×280px, no scroll.

Copy & Toasts

Copy actions → show “Copied!” toast for 2s.

QR Download → triggers PNG download.

Accessibility

Labels linked to inputs.

Tabs keyboard-navigable.

Toasts announced for screen readers.

SEO Meta

Title: “WhatsApp Link Generator (Click to Chat) – Telegram, Messenger & Discord | Free Tool”

Meta description: “Create WhatsApp click-to-chat links, Telegram deep links, Messenger m.me links, and Discord invites. Free, fast, no signup.”

Canonical: /chat-link-generator

JSON-LD: SoftwareApplication + FAQPage

✅ Acceptance Criteria

Each tab generates valid, tested links.

Copy/Open/QR all work.

Shareable link restores state correctly.

Embed mode works compactly.

SEO tags and JSON-LD present.

Lighthouse: Performance ≥90, SEO ≥90, Accessibility ≥90.