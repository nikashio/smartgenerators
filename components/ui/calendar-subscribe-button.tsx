/**
 * Calendar subscription button
 * Handles webcal:// subscription links for calendar apps
 */

"use client"

import { Button } from "@/components/ui/button"

interface CalendarSubscribeButtonProps {
  href: string
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function CalendarSubscribeButton({ 
  href, 
  children, 
  variant = "secondary" 
}: CalendarSubscribeButtonProps) {
  const handleSubscribe = () => {
    // Get the current domain
    const domain = typeof window !== 'undefined' ? window.location.host : 'localhost:3000'
    
    // Create webcal URL
    const webcalUrl = `webcal://${domain}${href}`
    
    // Try to open with webcal protocol
    try {
      window.location.href = webcalUrl
    } catch (error) {
      // Fallback: open the regular HTTPS URL in a new tab
      window.open(`https://${domain}${href}`, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Button variant={variant} onClick={handleSubscribe}>
      {children}
    </Button>
  )
}
