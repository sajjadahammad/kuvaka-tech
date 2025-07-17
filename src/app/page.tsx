"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard")
    } else {
      router.replace("/login")
    }
  }, [isLoggedIn, router])

  // Show a loading spinner while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
