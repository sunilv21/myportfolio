"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      className="border-t border-white/[0.06] py-12 px-4 sm:px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-orange-500/15">
              R
            </div>
            <div>
              <span className="text-sm font-semibold text-white/60">Radsting Dev</span>
              <span className="text-white/15 mx-2">·</span>
              <span className="text-xs text-white/25">Sunil Verma</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-white/25">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400/60 transition-colors">
              Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400/60 transition-colors">
              YouTube
            </a>
            <Link href="/admin" className="hover:text-orange-400/60 transition-colors">
              Admin
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-white/15">
            © {currentYear} All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
