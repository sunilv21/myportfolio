"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit2, Trash2, X, Copy, ExternalLink, ImageIcon, Upload, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  slug: string
}

interface Content {
  id: string
  title: string
  category_id: string
  published: boolean
  created_at: string
  categories: {
    name: string
  }
}

interface ContentForm {
  title: string
  description: string
  category_id: string
  thumbnail_url: string
  published: boolean
  embeds: Array<{
    embed_type: "youtube" | "instagram" | "link" | "image" | "video"
    embed_url: string
  }>
}

export function AdminContentManager() {
  const [contents, setContents] = useState<Content[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState<ContentForm>({
    title: "",
    description: "",
    category_id: "",
    thumbnail_url: "",
    published: false,
    embeds: [],
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: categoriesData } = await supabase.from("categories").select("*")
      const { data: contentData } = await supabase
        .from("content")
        .select("*, categories:category_id(name)")
        .order("created_at", { ascending: false })

      setCategories(categoriesData || [])
      setContents(contentData || [])
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, or WebP)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB")
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `thumbnails/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("content-images")
        .upload(filePath, file)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      const { data: urlData } = supabase.storage
        .from("content-images")
        .getPublicUrl(filePath)

      setForm({ ...form, thumbnail_url: urlData.publicUrl })
    } catch (err: any) {
      console.error("Error uploading image:", err)
      alert(`Upload failed: ${err?.message || "Unknown error"}. Make sure the "content-images" storage bucket exists in Supabase.`)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!form.title || !form.category_id) {
      alert("Please fill in required fields (Title and Category are required)")
      return
    }

    try {
      // Filter out embeds with empty URLs - make them optional
      const validEmbeds = form.embeds.filter(e => e.embed_url && e.embed_url.trim())

      const contentData = {
        title: form.title,
        description: form.description,
        category_id: form.category_id,
        thumbnail_url: form.thumbnail_url,
        published: form.published,
        publish_date: form.published ? new Date().toISOString() : null,
        slug: form.title.toLowerCase().replace(/\s+/g, "-"),
      }

      if (editingId) {
        console.log("[v0] Updating content:", editingId, contentData)
        const { data: updateData, error: updateError } = await supabase
          .from("content")
          .update(contentData)
          .eq("id", editingId)
          .select()

        if (updateError) {
          console.error("[v0] Update error:", updateError)
          throw updateError
        }

        // Delete old embeds and add new ones if any
        await supabase.from("content_embeds").delete().eq("content_id", editingId)

        if (validEmbeds.length > 0) {
          const { error: embedError } = await supabase.from("content_embeds").insert(
            validEmbeds.map((e, idx) => ({
              content_id: editingId,
              embed_type: e.embed_type,
              embed_url: e.embed_url,
              display_order: idx,
            })),
          )
          if (embedError) {
            console.error("[v0] Embed error:", embedError)
            throw embedError
          }
        }

        alert("Content updated successfully!")
      } else {
        console.log("[v0] Creating new content:", contentData)
        const { data: newContent, error: insertError } = await supabase
          .from("content")
          .insert([contentData])
          .select()
          .single()

        if (insertError) {
          console.error("[v0] Insert error:", insertError)
          throw insertError
        }

        console.log("[v0] Content created successfully:", newContent)

        // Save embeds if any - embeds are optional
        if (newContent && validEmbeds.length > 0) {
          const { error: embedError } = await supabase.from("content_embeds").insert(
            validEmbeds.map((e, idx) => ({
              content_id: newContent.id,
              embed_type: e.embed_type,
              embed_url: e.embed_url,
              display_order: idx,
            })),
          )
          if (embedError) {
            console.error("[v0] Embed error:", embedError)
            throw embedError
          }
        }

        alert("Content created successfully!")
      }

      setIsOpen(false)
      setEditingId(null)
      setForm({
        title: "",
        description: "",
        category_id: "",
        thumbnail_url: "",
        published: false,
        embeds: [],
      })
      fetchData()
    } catch (err: any) {
      console.error("[v0] Error saving content:", err)
      const errorMessage = err?.message || err?.error_description || "Error saving content"
      alert(`Error: ${errorMessage}`)
    }
  }

  async function handleEdit(content: Content) {
    // Fetch embeds for this content
    const { data: embedsData } = await supabase
      .from("content_embeds")
      .select("*")
      .eq("content_id", content.id)
      .order("display_order")

    setForm({
      title: content.title,
      description: content.description || "",
      category_id: content.category_id,
      thumbnail_url: content.thumbnail_url || "",
      published: content.published,
      embeds: embedsData?.map(e => ({
        embed_type: e.embed_type as any,
        embed_url: e.embed_url,
      })) || [],
    })
    setEditingId(content.id)
    setIsOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      await supabase.from("content").delete().eq("id", id)
      fetchData()
    } catch (err) {
      console.error("Error deleting content:", err)
    }
  }

  const handleAddEmbed = () => {
    setForm({
      ...form,
      embeds: [...form.embeds, { embed_type: "youtube", embed_url: "" }],
    })
  }

  const handleRemoveEmbed = (idx: number) => {
    setForm({
      ...form,
      embeds: form.embeds.filter((_, i) => i !== idx),
    })
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-orange-500/20 bg-background/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Create, edit, and manage your portfolio content</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null)
                  setForm({
                    title: "",
                    description: "",
                    category_id: "",
                    thumbnail_url: "",
                    published: false,
                    embeds: [],
                  })
                }}
                className="bg-orange-500 hover:bg-orange-600 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "Add"} Content</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Project title"
                    className="bg-background/50 border-orange-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger className="bg-background/50 border-orange-500/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Project description"
                    rows={4}
                    className="bg-background/50 border-orange-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
                  
                  {/* Image Preview */}
                  {form.thumbnail_url && (
                    <div className="relative mb-3 rounded-lg overflow-hidden border border-orange-500/20">
                      <img
                        src={form.thumbnail_url}
                        alt="Thumbnail preview"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        onClick={() => setForm({ ...form, thumbnail_url: "" })}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  {!form.thumbnail_url && (
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-orange-500/30 rounded-lg cursor-pointer hover:border-orange-400/50 hover:bg-orange-500/5 transition-all duration-300 mb-3">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <>
                            <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-2" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-orange-400 mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload image</p>
                            <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, GIF, WebP (max 5MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}

                  {/* Or paste URL */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-orange-500/10"></div>
                    <span className="text-xs text-muted-foreground">or paste URL</span>
                    <div className="flex-1 h-px bg-orange-500/10"></div>
                  </div>
                  <Input
                    value={form.thumbnail_url}
                    onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="bg-background/50 border-orange-500/20 mt-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.published}
                    onCheckedChange={(v) => setForm({ ...form, published: v as boolean })}
                  />
                  <label className="text-sm font-medium">Published</label>
                </div>

                {/* Embeds - Optional Section */}
                <div className="border-t border-orange-500/10 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-medium">Embeds (Optional)</label>
                      <p className="text-xs text-muted-foreground mt-1">Add YouTube videos, Instagram posts, or links to showcase your work</p>
                    </div>
                    <Button
                      onClick={handleAddEmbed}
                      size="sm"
                      variant="outline"
                      className="border-orange-500/30 bg-transparent hover:bg-orange-500/10"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Embed
                    </Button>
                  </div>

                  {form.embeds.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2 px-3 bg-orange-500/5 rounded border border-orange-500/10">
                      No embeds added. Click "Add Embed" to add media content.
                    </p>
                  ) : (
                    form.embeds.map((embed, idx) => (
                      <div key={idx} className="flex gap-2 mb-3 items-end">
                        <Select
                          value={embed.embed_type}
                          onValueChange={(v) => {
                            const newEmbeds = [...form.embeds]
                            newEmbeds[idx].embed_type = v as any
                            setForm({ ...form, embeds: newEmbeds })
                          }}
                        >
                          <SelectTrigger className="w-32 bg-background/50 border-orange-500/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="link">Link</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={embed.embed_url}
                          onChange={(e) => {
                            const newEmbeds = [...form.embeds]
                            newEmbeds[idx].embed_url = e.target.value
                            setForm({ ...form, embeds: newEmbeds })
                          }}
                          placeholder="Enter URL (optional if empty)"
                          className="flex-1 bg-background/50 border-orange-500/20"
                        />
                        <Button
                          onClick={() => handleRemoveEmbed(idx)}
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2 justify-end border-t border-orange-500/10 pt-4">
                  <Button onClick={() => setIsOpen(false)} variant="outline" className="border-orange-500/30">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save Content
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading content...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-orange-500/10">
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contents.map((content) => (
                    <TableRow key={content.id} className="border-orange-500/10">
                      <TableCell className="font-medium">{content.title}</TableCell>
                      <TableCell>{content.categories?.name}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            content.published
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }
                        >
                          {content.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(content.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-500 bg-transparent border-orange-500/30 hover:bg-orange-500/10"
                          onClick={() => handleEdit(content)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 bg-transparent border-red-500/30 hover:bg-red-500/10"
                          onClick={() => handleDelete(content.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {contents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No content yet. Start by adding your first project!
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
