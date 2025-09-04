"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function NBCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border-2 border-gray-900 bg-white p-4 shadow-[6px_6px_0_0_#111] dark:bg-gray-900 dark:border-white dark:shadow-[6px_6px_0_0_#fff]", className)} {...props} />
}

export function NBCardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3", className)} {...props} />
}

export function NBCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-bold", className)} {...props} />
}

export function NBCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />
}


