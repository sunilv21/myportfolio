"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

interface AnalyticsData {
  contentId: string
  title: string
  views: number
  clicks: number
  embedClicks: number
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])

  const supabase = createClient()

  const COLORS = ["oklch(0.65 0.22 35)", "oklch(0.55 0.15 80)", "oklch(0.4 0.1 140)", "oklch(0.6 0.18 40)"]

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAnalytics() {
    try {
      const { data: analyticsData } = await supabase
        .from("analytics")
        .select("content_id, event_type, created_at")
        .order("created_at", { ascending: false })

      const { data: contentData } = await supabase
        .from("content")
        .select("id, title, category_id, categories:category_id(name)")
        .eq("published", true)

      if (contentData && analyticsData) {
        // Process analytics by content
        const analyticsMap = new Map<string, AnalyticsData>()

        contentData.forEach((content) => {
          analyticsMap.set(content.id, {
            contentId: content.id,
            title: content.title,
            views: 0,
            clicks: 0,
            embedClicks: 0,
          })
        })

        analyticsData.forEach((event) => {
          const data = analyticsMap.get(event.content_id)
          if (data) {
            if (event.event_type === "view") data.views++
            if (event.event_type === "click") data.clicks++
            if (event.event_type === "embed_clicked") data.embedClicks++
          }
        })

        setAnalytics(Array.from(analyticsMap.values()).filter((a) => a.views > 0))

        // Process time-series data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          return date.toISOString().split("T")[0]
        })

        const chartDataPoints = last7Days.map((date) => {
          const dayEvents = analyticsData.filter((e) => e.created_at.startsWith(date))
          return {
            date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            views: dayEvents.filter((e) => e.event_type === "view").length,
            clicks: dayEvents.filter((e) => e.event_type === "click").length,
            embedClicks: dayEvents.filter((e) => e.event_type === "embed_clicked").length,
          }
        })

        setChartData(chartDataPoints)

        // Process category data
        const categoryMap = new Map<string, { name: string; count: number }>()
        contentData.forEach((content) => {
          const categoryName = content.categories?.name || "Unknown"
          const categoryCount = analyticsData.filter((e) => e.content_id === content.id).length
          if (categoryCount > 0) {
            const existing = categoryMap.get(categoryName)
            if (existing) {
              existing.count += categoryCount
            } else {
              categoryMap.set(categoryName, { name: categoryName, count: categoryCount })
            }
          }
        })

        setCategoryData(Array.from(categoryMap.values()))
      }
    } catch (err) {
      console.error("Error fetching analytics:", err)
    } finally {
      setLoading(false)
    }
  }

  const totalViews = analytics.reduce((sum, a) => sum + a.views, 0)
  const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0)
  const totalEmbedClicks = analytics.reduce((sum, a) => sum + a.embedClicks, 0)

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-background/50 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">Portfolio views</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Content clicks</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Embed Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{totalEmbedClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">External links clicked</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity Over Time */}
        <Card className="bg-background/50 border-orange-500/20 lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>Last 7 days of engagement</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.02 240)" />
                  <XAxis dataKey="date" stroke="oklch(0.65 0 0)" />
                  <YAxis stroke="oklch(0.65 0 0)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.15 0.02 240)",
                      border: "1px solid oklch(0.3 0.05 35)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="oklch(0.65 0.22 35)" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicks" stroke="oklch(0.55 0.15 80)" strokeWidth={2} />
                  <Line type="monotone" dataKey="embedClicks" stroke="oklch(0.4 0.1 140)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <Card className="bg-background/50 border-orange-500/20">
            <CardHeader>
              <CardTitle>Traffic by Category</CardTitle>
              <CardDescription>Distribution of engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.15 0.02 240)",
                        border: "1px solid oklch(0.3 0.05 35)",
                        borderRadius: "0.5rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Top Content */}
        <Card className="bg-background/50 border-orange-500/20">
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
            <CardDescription>Highest engagement pieces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((item, idx) => (
                  <div key={item.contentId} className="border-b border-orange-500/10 pb-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="text-lg font-bold text-orange-400 w-6">{idx + 1}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                        <div className="flex gap-4 text-xs mt-1">
                          <span className="text-muted-foreground">
                            Views: <span className="text-orange-400">{item.views}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Clicks: <span className="text-orange-400">{item.clicks}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
