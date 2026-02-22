"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { trackEvent } from "@/lib/analytics"
import { ExternalLink, Youtube, Instagram, LinkIcon, Play, ArrowUpRight } from "lucide-react"

interface Embed {
  id: string
  embed_type: string
  embed_url: string
  embed_code?: string
}

interface Content {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  category_id: string
  categories: {
    name: string
    color_accent: string
    icon: string
  }
  content_embeds: Embed[]
}

export function PortfolioGrid() {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchContent()
  }, [])

  async function fetchContent() {
    try {
      const { data: categoriesData } = await supabase.from("categories").select("*").order("display_order")
      const { data: contentData } = await supabase
        .from("content")
        .select(`*, categories:category_id(name, color_accent, icon), content_embeds(*)`)
        .eq("published", true)
        .order("created_at", { ascending: false })

      setCategories(categoriesData || [])
      setContent(contentData || [])
    } catch (err) {
      console.error("Error fetching content:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredContent = selectedCategory ? content.filter((item) => item.category_id === selectedCategory) : content

  if (loading) {
    return (
      <section id="portfolio" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-40 mx-auto mb-4 bg-white/5" />
          <Skeleton className="h-5 w-72 mx-auto mb-12 bg-white/5" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="portfolio" className="py-20 sm:py-28 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="text-[11px] uppercase tracking-[0.25em] text-amber-400/60 font-medium mb-4 block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Selected Work
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 mb-4">
            My Projects
          </h2>
          <p className="text-sm sm:text-base text-white/30 max-w-md mx-auto font-light">
            A curated collection of work across development, design, video, and marketing.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <motion.button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
              selectedCategory === null
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/15 bg-white/[0.02]"
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            All
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/15 bg-white/[0.02]"
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Project grid */}
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
  <AnimatePresence mode="popLayout">
    {filteredContent.map((item, idx) => (
      <motion.div
        key={item.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, delay: idx * 0.05 }}
        onViewportEnter={() => trackEvent(item.id, "view")}
        onClick={() => trackEvent(item.id, "click")}
        className="group"
      >
        <div className="h-full min-h-[460px] rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden hover:border-orange-400/20 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/[0.05]">
          
          {/* Thumbnail */}
          <div className="relative h-60 sm:h-72 overflow-hidden">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-500/[0.06] to-transparent">
                <span className="text-4xl mb-2 opacity-60">
                  {item.categories?.icon || "📁"}
                </span>
                <span className="text-[11px] text-white/20 font-medium tracking-wide">
                  {item.categories?.name}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Hover overlay with embeds */}
            {item.content_embeds && item.content_embeds.length > 0 && (
              <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                {item.content_embeds.map((embed) => (
                  <a
                    key={embed.id}
                    href={embed.embed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation()
                      trackEvent(item.id, "embed_clicked")
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-black/60 backdrop-blur-md text-white/80 border border-white/10 hover:bg-orange-500/20 hover:border-orange-400/30 transition-all duration-300"
                  >
                    {embed.embed_type === "youtube" && <Play className="w-3 h-3" />}
                    {embed.embed_type === "instagram" && <Instagram className="w-3 h-3" />}
                    {embed.embed_type === "link" && <ArrowUpRight className="w-3 h-3" />}
                    {embed.embed_type === "image" && <LinkIcon className="w-3 h-3" />}
                    {embed.embed_type === "video" && <Play className="w-3 h-3" />}
                    <span className="capitalize">{embed.embed_type}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-black/40 backdrop-blur-md text-white/60 border border-white/[0.08]">
                {item.categories?.icon} {item.categories?.name}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-sm sm:text-base font-semibold text-white/80 group-hover:text-orange-300/90 transition-colors duration-300 mb-2 line-clamp-1">
              {item.title}
            </h3>
            <p className="text-xs text-white/30 line-clamp-2 leading-relaxed font-light">
              {item.description}
            </p>
          </div>
        </div>
      </motion.div>
    ))}
  </AnimatePresence>
</div>

        {filteredContent.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/20 text-base">No projects in this category yet.</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
