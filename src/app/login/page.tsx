"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import OtpForm from "@/components/otp-form"

export default function LoginPage() {
  const router = useRouter()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard")
    }
  }, [isLoggedIn, router])

  if (isLoggedIn) {
    return null // Or a loading spinner
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">Welcome to Gemini Clone</h1>
        <p className="mb-8 text-center text-muted-foreground">Please enter your phone number to login or sign up.</p>
        <OtpForm />
      </div>
    </div>
  )
}
