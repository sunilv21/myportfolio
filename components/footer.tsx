"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

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
            <div className="w-7 h-7 rounded-lg overflow-hidden shadow-lg shadow-orange-500/15">
              <Image
                src="/Radsting.svg"
                alt="Radsting Logo"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-semibold text-white/60">Radsting Dev</span>
              <span className="text-white/15 mx-2">·</span>
              <span className="text-xs text-white/70">Sunil Verma</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-white/25">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 text-white/80 transition-colors">
              Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 text-white/80 transition-colors">
              YouTube
            </a>
            <Link href="/admin" className="hover:text-green-400 text-white/80 transition-colors">
              Admin
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-white/60">
            © {currentYear} All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
