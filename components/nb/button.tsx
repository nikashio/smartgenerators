"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface NBButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost"
  size?: "sm" | "md" | "lg"
}

export const NBButton = React.forwardRef<HTMLButtonElement, NBButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 select-none transition-colors active:translate-x-[2px] active:translate-y-[2px]"
    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-5 text-base",
    } as const
    const variants = {
      default: "bg-white text-gray-900 border-2 border-gray-900 shadow-[4px_4px_0_0_#111] hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-white dark:shadow-[4px_4px_0_0_#fff]",
      ghost: "bg-transparent text-gray-900 border-2 border-transparent hover:border-gray-900 dark:text-white dark:hover:border-white",
    } as const

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variants[variant], className)}
        {...props}
      />
    )
  }
)

NBButton.displayName = "NBButton"

export default NBButton


