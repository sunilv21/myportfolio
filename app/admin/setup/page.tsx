"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Copy } from "lucide-react"

export default function AdminSetupPage() {
  const [userEmail, setUserEmail] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [databaseReady, setDatabaseReady] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkSetupStatus()
  }, [])

  async function checkSetupStatus() {
    try {
      const { data: authData } = await supabase.auth.getUser()

      if (authData.user) {
        setUserEmail(authData.user.email || "")

        // Check if user has admin profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", authData.user.id)
          .single()

        setIsAdmin(profileData?.is_admin || false)
      }

      // Check if categories table has data
      const { data: categoriesData } = await supabase.from("categories").select("id").limit(1)
      setDatabaseReady(!!categoriesData && categoriesData.length > 0)
    } catch (err) {
      console.error("[v0] Error checking setup:", err)
    } finally {
      setCheckingStatus(false)
    }
  }

  async function makeAdmin() {
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) throw new Error("Not authenticated")

      // Create or update profile with is_admin = true
      const { error } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        email: authData.user.email,
        is_admin: true,
      })

      if (error) throw error
      setIsAdmin(true)
      alert("Admin access granted!")
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const setupSteps = [
    {
      title: "1. Verify Supabase Connection",
      description: "Check that Supabase is properly connected",
      completed: !!userEmail,
      action: null,
    },
    {
      title: "2. Set as Admin",
      description: "Grant admin access to your account",
      completed: isAdmin,
      action: !isAdmin && (
        <Button onClick={makeAdmin} className="bg-orange-500 hover:bg-orange-600">
          Grant Admin Access
        </Button>
      ),
    },
    {
      title: "3. Run Database Scripts",
      description: "Initialize database tables and seed data",
      completed: databaseReady,
      action: !databaseReady && (
        <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded border border-orange-500/20 space-y-2">
          <p className="font-medium text-foreground">Run these scripts in Supabase SQL Editor:</p>
          <div className="space-y-1">
            <code className="text-orange-400 block">/scripts/01_create_tables.sql</code>
            <code className="text-orange-400 block">/scripts/02_seed_categories.sql</code>
            <code className="text-orange-400 block">/scripts/03_fix_rls_policies.sql</code>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        className="max-w-2xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Admin Setup</h1>
          <p className="text-muted-foreground">Get your Radsting Dev admin dashboard ready</p>
        </div>

        {checkingStatus && (
          <Alert className="bg-background/50 border-orange-500/20">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <AlertDescription>Checking setup status...</AlertDescription>
          </Alert>
        )}

        {!checkingStatus && (
          <div className="space-y-4">
            {/* Status Summary */}
            <Card className="bg-background/50 border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Setup Status
                  <Badge
                    className={
                      isAdmin && databaseReady
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {isAdmin && databaseReady ? "Ready" : "Needs Setup"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle
                    className={`w-5 h-5 ${userEmail ? "text-green-500" : "text-gray-500"}`}
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">Authenticated User</p>
                    <p className="text-xs text-muted-foreground">{userEmail || "Not logged in"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle
                    className={`w-5 h-5 ${isAdmin ? "text-green-500" : "text-gray-500"}`}
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">Admin Status</p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? "You are an admin" : "Not yet set as admin"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle
                    className={`w-5 h-5 ${databaseReady ? "text-green-500" : "text-gray-500"}`}
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">Database Ready</p>
                    <p className="text-xs text-muted-foreground">
                      {databaseReady ? "Tables initialized" : "Scripts need to be run"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Steps */}
            <div className="space-y-3">
              {setupSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    className={`bg-background/50 border-orange-500/20 transition-all ${
                      step.completed ? "border-green-500/30" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{step.title}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {step.description}
                          </CardDescription>
                        </div>
                        {step.completed && (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    {step.action && (
                      <CardContent>
                        {step.action}
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Instructions */}
            {!databaseReady && (
              <Card className="bg-orange-500/10 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-base text-orange-400">Database Setup Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground mb-2">Step 1: Open Supabase Dashboard</p>
                    <p className="text-muted-foreground">
                      Go to your Supabase project and open the SQL Editor
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-2">Step 2: Run Create Tables Script</p>
                    <div className="bg-background/50 p-3 rounded border border-orange-500/20 overflow-auto">
                      <code className="text-xs text-orange-400 block mb-2">
                        -- Copy content from: /scripts/01_create_tables.sql
                      </code>
                      <code className="text-xs text-muted-foreground">
                        Paste in Supabase SQL Editor and execute
                      </code>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-2">Step 3: Seed Categories</p>
                    <div className="bg-background/50 p-3 rounded border border-orange-500/20 overflow-auto">
                      <code className="text-xs text-orange-400 block mb-2">
                        -- Copy content from: /scripts/02_seed_categories.sql
                      </code>
                      <code className="text-xs text-muted-foreground">
                        Paste in Supabase SQL Editor and execute
                      </code>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-2">Step 4: Fix RLS Policies (Important!)</p>
                    <div className="bg-background/50 p-3 rounded border border-orange-500/20 overflow-auto">
                      <code className="text-xs text-orange-400 block mb-2">
                        -- Copy content from: /scripts/03_fix_rls_policies.sql
                      </code>
                      <code className="text-xs text-muted-foreground">
                        This allows you to save content. Paste and execute this script.
                      </code>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-2">Step 5: Refresh This Page</p>
                    <p className="text-muted-foreground">
                      After running all scripts, refresh this page to verify setup is complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ready to Go */}
            {isAdmin && databaseReady && (
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  Your admin dashboard is fully set up and ready to use!
                </AlertDescription>
              </Alert>
            )}

            {/* Refresh Button */}
            <Button
              onClick={checkSetupStatus}
              variant="outline"
              className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10 bg-transparent"
            >
              Refresh Status
            </Button>

            {/* Go Back */}
            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
              <a href="/admin">Go to Dashboard</a>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
