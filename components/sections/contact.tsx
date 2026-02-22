"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Instagram, Loader2, Send, ArrowUpRight } from "lucide-react"
import Image from "next/image"

export function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
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
          phone: formData.phone,
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
      setFormData({ name: "", email: "", phone: "", message: "" })
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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

        {/* Quick Links */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center mb-12"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
              <link.icon className="w-4 h-4 text-white/70 group-hover:text-blue-400/70 transition-colors" />
              <span className="text-sm text-white/40 group-hover:text-white/70 transition-colors">
                {link.value}
              </span>
              <ArrowUpRight className="w-3 h-3 text-white/15 group-hover:text-blue-400/50 transition-colors" />
            </a>
          ))}
        </motion.div>


        {/* Grid Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-stretch"
>
          {/* Form Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-10 flex flex-col h-full">

          {submitted ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white/80 font-medium mb-1 text-lg">Message sent!</p>
              <p className="text-white/40 text-sm font-light">
                I'll get back to you soon.
              </p>
            </div>
          ) : (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/40 text-white/80 placeholder:text-white/70 text-sm focus:outline-none focus:border-orange-400/30 focus:ring-1 focus:ring-orange-400/10 transition-all duration-300"
          required
        />

        <input
          type="email"
          placeholder="Your email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/40 text-white/80 placeholder:text-white/70 text-sm focus:outline-none focus:border-orange-400/30 focus:ring-1 focus:ring-orange-400/10 transition-all duration-300"
          required
        />

        <input
          type="tel"
          placeholder="Phone number (optional)"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/40 text-white/80 placeholder:text-white/70 text-sm focus:outline-none focus:border-orange-400/30 focus:ring-1 focus:ring-orange-400/10 transition-all duration-300"
        />
      </div>

              {/* FIXED MESSAGE BOX */}
              <textarea
                placeholder="Tell me about your project..."
                rows={8}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="flex-1 min-h-[180px] px-4 py-4 rounded-xl bg-white/[0.03] border border-white/40 text-white/80 placeholder:text-white/70 text-sm focus:outline-none focus:border-orange-400/30 focus:ring-1 focus:ring-orange-400/10 transition-all duration-300 resize-none mb-6"
                required
              />

              {error && (
                <p className="text-red-400/80 text-xs bg-red-500/[0.06] border border-red-500/10 rounded-lg px-3 py-2 mb-4">
                  {error}
                </p>
              )}

              {/* Button pushed to bottom */}
              <button
                type="submit"
                disabled={loading}
                className="mt-auto py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
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

          {/* Logo Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-3xl p-10 shadow-[0_40px_100px_-20px_rgba(249,115,22,0.25)] transition-all duration-500">
                <Image
                  src="/Radsting.svg"
                  alt="Radsting Dev"
                  width={350}
                  height={350}
                  className="w-[320px] h-auto object-contain"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}