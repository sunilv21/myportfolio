"use client"

import React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Instagram, MessageSquare, Loader2, Send, ArrowUpRight } from "lucide-react"

export function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          submission_type: "contact",
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        setError(result.error || "Failed to send message")
        return
      }

      setSubmitted(true)
      setFormData({ name: "", email: "", message: "" })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err: any) {
      console.error("Form submission error:", err)
      setError("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const contactLinks = [
    {
      icon: Mail,
      label: "Email",
      value: "sunil@example.com",
      href: "mailto:sunil@example.com",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@radsting.dev",
      href: "https://instagram.com/radsting.dev",
    },
  ]

  return (
    <section id="contact" className="py-20 sm:py-28 px-4 sm:px-6 relative">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="text-[11px] uppercase tracking-[0.25em] text-orange-400/60 font-medium mb-4 block">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 mb-4">
            Let's Work Together
          </h2>
          <p className="text-sm sm:text-base text-white/30 max-w-md mx-auto font-light">
            Have a project in mind? I'd love to hear about it.
          </p>
        </motion.div>

        {/* Quick contact links */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center mb-12"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-orange-400/20 hover:bg-orange-500/[0.03] transition-all duration-300"
            >
              <link.icon className="w-4 h-4 text-white/30 group-hover:text-orange-400/70 transition-colors" />
              <span className="text-sm text-white/40 group-hover:text-white/70 transition-colors">{link.value}</span>
              <ArrowUpRight className="w-3 h-3 text-white/15 group-hover:text-orange-400/50 transition-colors" />
            </a>
          ))}
        </motion.div>

        {/* Contact form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-white/70 font-medium mb-1">Message sent!</p>
                <p className="text-white/30 text-sm font-light">I'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-white/20 font-medium mb-2">Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 placeholder:text-white/15 text-sm focus:outline-none focus:border-orange-400/30 focus:ring-1 focus:ring-orange-400/10 transition-all duration-300"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-white/20 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 placeholder:text-white/15 text-sm focus:outline-none focus:border-orange-400/30 focus:ring-1 focus:ring-orange-400/10 transition-all duration-300"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-white/20 font-medium mb-2">Message</label>
                  <textarea
                    placeholder="Tell me about your project..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 placeholder:text-white/15 text-sm focus:outline-none focus:border-orange-400/30 focus:ring-1 focus:ring-orange-400/10 transition-all duration-300 resize-none"
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-red-400/80 text-xs bg-red-500/[0.06] border border-red-500/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
