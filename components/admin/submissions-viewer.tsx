"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mail, Eye, Trash2, CheckCircle, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface Submission {
  id: string
  name: string
  email: string
  message: string
  phone?: string
  subject?: string
  submission_type: string
  status: string
  created_at: string
}

export function SubmissionsViewer() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchSubmissions()
    // Subscribe to real-time updates
    const channel = supabase
      .channel("submissions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => {
          fetchSubmissions()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  async function fetchSubmissions() {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (err) {
      console.error("[v0] Error fetching submissions:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this submission?")) return

    try {
      const { error } = await supabase.from("submissions").delete().eq("id", id)

      if (error) throw error
      setSubmissions(submissions.filter((s) => s.id !== id))
    } catch (err) {
      console.error("[v0] Error deleting submission:", err)
      alert("Failed to delete submission")
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const { error } = await supabase.from("submissions").update({ status: newStatus }).eq("id", id)

      if (error) throw error
      setSubmissions(submissions.map((s) => (s.id === id ? { ...s, status: newStatus } : s)))
    } catch (err) {
      console.error("[v0] Error updating status:", err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "read":
        return <Eye className="w-4 h-4 text-blue-500" />
      case "replied":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "destructive",
      read: "secondary",
      replied: "default",
      archived: "outline",
    }
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>
  }

  if (loading) {
    return <div className="text-center py-12">Loading submissions...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-orange-500" />
          Form Submissions ({submissions.length})
        </h3>
        <p className="text-sm text-muted-foreground">Manage all contact forms and submissions from your website</p>
      </div>

      {submissions.length === 0 ? (
        <Card className="bg-background/50 border-orange-500/20">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">No submissions yet</p>
            <p className="text-xs text-muted-foreground">When visitors submit the contact form, they'll appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-orange-500/20 rounded-lg overflow-hidden bg-background/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Message</TableHead>
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission, idx) => (
                  <motion.tr
                    key={submission.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-t border-orange-500/10 hover:bg-orange-500/5 transition-colors"
                  >
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{submission.email}</TableCell>
                    <TableCell className="hidden md:table-cell truncate text-sm max-w-xs">{submission.message}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-500/30 bg-transparent text-orange-500 hover:bg-orange-500/10 text-xs"
                              onClick={() => {
                                setSelectedSubmission(submission)
                                handleStatusChange(submission.id, "read")
                              }}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Message from {submission.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="text-foreground">{submission.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-foreground">{submission.email}</p>
                              </div>
                              {submission.phone && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                  <p className="text-foreground">{submission.phone}</p>
                                </div>
                              )}
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Message</label>
                                <p className="text-foreground whitespace-pre-wrap">{submission.message}</p>
                              </div>
                              <div className="pt-4 border-t border-orange-500/10 flex gap-2">
                                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600">
                                  <a href={`mailto:${submission.email}`}>Reply via Email</a>
                                </Button>
                                {submission.status !== "replied" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-500/30 text-green-500 hover:bg-green-500/10 bg-transparent"
                                    onClick={() => handleStatusChange(submission.id, "replied")}
                                  >
                                    Mark as Replied
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 bg-transparent text-red-500 hover:bg-red-500/10 text-xs"
                          onClick={() => handleDelete(submission.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
