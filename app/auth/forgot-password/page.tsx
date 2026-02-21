"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { ArrowLeft, Check } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) throw resetError

      setSubmitted(true)
      setEmail("")
    } catch (err: any) {
      setError(err.message || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 sm:px-6 sm:py-20">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-orange-500/20 bg-background/50 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!submitted ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Email Address</label>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-orange-500/20 text-sm"
                    disabled={loading}
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-500/10 px-3 py-2 rounded border border-red-500/20">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-lg hover:shadow-orange-500/50 text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>

                <Link href="/auth/login">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-foreground/60 hover:text-orange-500 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </form>
            ) : (
              <motion.div
                className="space-y-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <Check className="w-16 h-16 text-orange-500" />
                  </motion.div>
                </div>

                <h3 className="text-lg font-semibold text-foreground">Check Your Email</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the
                  instructions to reset your password.
                </p>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-3 mt-6">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    If you don&apos;t see the email, check your spam folder or contact support.
                  </p>
                </div>

                <Link href="/auth/login">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-lg hover:shadow-orange-500/50 text-sm sm:text-base">
                    Back to Login
                  </Button>
                </Link>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
