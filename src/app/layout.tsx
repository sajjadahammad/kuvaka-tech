import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import { Toaster } from "sonner" // Import Sonner's Toaster

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
// Removed: import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gemini Clone",
  description: "A Gemini-style conversational AI chat application.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            {/* Main content area, dynamically adjusting margin based on sidebar state */}
            <main className="flex flex-1 flex-col transition-[margin-left] duration-200 ease-linear md:peer-[data-state=expanded]:ml-[var(--sidebar-width)] md:peer-[data-state=collapsed]:ml-[var(--sidebar-width-icon)]">
              {children}
            </main>
          </SidebarProvider>
          <Toaster richColors position="bottom-right" /> {/* Sonner Toaster with richColors and position */}
        </ThemeProvider>
      </body>
    </html>
  )
}
