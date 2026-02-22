"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminContentManager } from "@/components/admin/content-manager"
import { AdminAnalytics } from "@/components/admin/analytics"
import { SubmissionsViewer } from "@/components/admin/submissions-viewer"
import {
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
  Bell,
  Plus,
  ExternalLink,
  Mail,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface UserProfile {
  email: string
  user_id: string
}

interface OverviewStats {
  totalContent: number
  monthViews: number
  totalEngagement: number
  submissions: number
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalContent: 0,
    monthViews: 0,
    totalEngagement: 0,
    submissions: 0,
  })
  const [overviewLoading, setOverviewLoading] = useState(true)
  const router = useRouter()

  const checkAdminStatus = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        setIsLoggedIn(false)
        setLoading(false)
        router.push("/auth/login")
        return
      }

      setUserProfile({
        email: data.user.email || "Admin User",
        user_id: data.user.id,
      })
      setIsAdmin(true)
      setIsLoggedIn(true)
    } catch (err) {
      console.error("Error checking admin status:", err)
      setIsLoggedIn(false)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkAdminStatus()
  }, [checkAdminStatus])

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchOverviewStats()
    }
  }, [isLoggedIn, isAdmin])

  async function fetchOverviewStats() {
    setOverviewLoading(true)
    try {
      const supabase = createClient()

      // Total published content
      const { count: contentCount } = await supabase
        .from("content")
        .select("*", { count: "exact", head: true })
        .eq("published", true)

      // This month's views
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: monthViewCount } = await supabase
        .from("analytics")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "view")
        .gte("created_at", startOfMonth.toISOString())

      // Total engagement (all analytics events)
      const { count: engagementCount } = await supabase
        .from("analytics")
        .select("*", { count: "exact", head: true })

      // Total submissions
      const { count: submissionCount } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })

      setOverviewStats({
        totalContent: contentCount || 0,
        monthViews: monthViewCount || 0,
        totalEngagement: engagementCount || 0,
        submissions: submissionCount || 0,
      })
    } catch (err) {
      console.error("Error fetching overview stats:", err)
    } finally {
      setOverviewLoading(false)
    }
  }

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch (err) {
      console.error("Error logging out:", err)
    }
  }

  function handleNavClick(tab: string) {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="border-orange-500/20 bg-card">
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>
                You need to be logged in as an admin to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "content", label: "Content", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "submissions", label: "Submissions", icon: Mail },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar — always visible on md+ */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col h-screen sticky top-0 border-r border-border bg-card">
        <div className="flex flex-col h-full p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              Radsting Dev
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Admin Portal</p>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                    activeTab === item.id
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="bg-accent rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium text-foreground truncate">
                {userProfile?.email}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 w-64 h-screen bg-card border-r border-border z-50 md:hidden"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                      Radsting Dev
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Admin Portal
                    </p>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                          activeTab === item.id
                            ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </nav>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="bg-accent rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      Logged in as
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {userProfile?.email}
                    </p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              size="icon"
              variant="ghost"
              className="md:hidden text-orange-500"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Radsting Dev Portfolio Manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-orange-500"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-orange-500"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/25 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Welcome back!
                    </h2>
                    <p className="text-muted-foreground">
                      Your portfolio is live and tracking engagement across all
                      platforms.
                    </p>
                  </div>
                  <div className="hidden md:block text-5xl opacity-20">📊</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Content", value: overviewLoading ? "..." : overviewStats.totalContent, icon: "📁", color: "from-orange-500/15 to-orange-500/5" },
                  { label: "This Month Views", value: overviewLoading ? "..." : overviewStats.monthViews, icon: "👁️", color: "from-amber-500/15 to-amber-500/5" },
                  { label: "Total Engagement", value: overviewLoading ? "..." : overviewStats.totalEngagement, icon: "✨", color: "from-emerald-500/15 to-emerald-500/5" },
                  { label: "Submissions", value: overviewLoading ? "..." : overviewStats.submissions, icon: "📬", color: "from-blue-500/15 to-blue-500/5" },
                ].map((stat, idx) => (
                  <Card key={idx} className={`bg-gradient-to-br ${stat.color} border-0`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                        <span className="text-2xl">{stat.icon}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="bg-card border-border hover:border-orange-500/40 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Content Management
                    </CardTitle>
                    <CardDescription>Create and manage portfolio content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setActiveTab("content")} className="w-full bg-orange-500 hover:bg-orange-600 gap-2">
                      <Plus className="w-4 h-4" />
                      Add New Content
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border hover:border-orange-500/40 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-orange-500" />
                      Analytics & Insights
                    </CardTitle>
                    <CardDescription>Track engagement and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setActiveTab("analytics")} variant="outline" className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10 gap-2">
                      <BarChart3 className="w-4 h-4" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Platform Features</CardTitle>
                  <CardDescription>What you can do with Radsting Dev</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { title: "YouTube Integration", desc: "Embed your video content directly" },
                      { title: "Instagram Posts", desc: "Share your design and creative work" },
                      { title: "Live Analytics", desc: "Track views, clicks, and engagement" },
                      { title: "Category Management", desc: "Organize by Dev, Video, Design, Social" },
                      { title: "Publish Control", desc: "Schedule and manage content visibility" },
                      { title: "Performance Metrics", desc: "See your top performing content" },
                    ].map((feature, idx) => (
                      <div key={idx} className="flex gap-3 p-3 rounded-lg bg-accent/50 border border-border">
                        <div className="text-orange-500 font-bold shrink-0">✓</div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{feature.title}</p>
                          <p className="text-xs text-muted-foreground">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button asChild size="lg" className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-lg py-6 gap-2">
                <a href="/" target="_blank" rel="noopener noreferrer">
                  View Your Live Portfolio
                  <ExternalLink className="w-5 h-5" />
                </a>
              </Button>
            </div>
          )}

          {activeTab === "content" && <AdminContentManager />}
          {activeTab === "analytics" && <AdminAnalytics />}
          {activeTab === "submissions" && <SubmissionsViewer />}
        </main>
      </div>
    </div>
  )
}