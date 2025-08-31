/**
 * Route head – injects BlogPosting and FAQPage JSON-LD for rich results
 */
export default function Head() {
  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "How to Create WhatsApp Click-to-Chat Links (with QR Codes) — Free, No Signup",
    description: "Step-by-step guide to create WhatsApp click-to-chat links and QR codes using a free generator. Auto-format numbers, prefill messages, track campaigns.",
    datePublished: "2025-09-01",
    dateModified: "2025-09-01",
    author: { "@type": "Person", name: "Smart Generators" },
    publisher: {
      "@type": "Organization",
      name: "Smart Generators",
      logo: { "@type": "ImageObject", url: "https://smartgenerators.dev/og-logo.png" }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://smartgenerators.dev/blog/whatsapp-link-generator-click-to-chat-guide"
    }
  }

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I prefill a message in the link?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Use the message box in the generator; it automatically URL-encodes the text."
        }
      },
      {
        "@type": "Question",
        name: "Do users need to save my number?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The link opens a chat immediately."
        }
      },
      {
        "@type": "Question",
        name: "Is this private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Everything is generated locally in your browser. No data is stored."
        }
      },
      {
        "@type": "Question",
        name: "Can I track which campaign works best?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the Advanced → UTM parameters. Review sources in your analytics."
        }
      }
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPosting) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
    </>
  )
}


