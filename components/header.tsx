"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: "Work", href: "#portfolio" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ]

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/[0.06]"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/Radsting.svg" 
              alt="Radsting Dev" 
              width={32} 
              height={32}
              className="rounded-lg shadow-lg shadow-orange-500/20"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white/90 leading-tight">Radsting Dev</span>
              <span className="text-[10px] text-white/30 leading-tight">by Sunil Verma</span>
            </div>
          </Link>
        </motion.div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-1 items-center">
          {navItems.map((item, i) => (
            <motion.a
              key={item.name}
              href={item.href}
              className="px-4 py-2 text-sm text-white/40 hover:text-white/90 transition-colors duration-300 rounded-lg hover:bg-white/[0.04]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3, duration: 0.4 }}
            >
              {item.name}
            </motion.a>
          ))}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="ml-2"
          >
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-white/[0.08] text-white hover:text-orange-300 hover:border-orange-400/20 hover:bg-orange-500/5 transition-all duration-300"
            >
              Admin
            </Link>
          </motion.div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          <Link
            href="/admin"
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] text-white/50 hover:text-orange-300 transition-all"
          >
            Admin
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white/40 hover:text-white/80 transition-colors rounded-lg hover:bg-white/[0.04]"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden relative border-t border-white/[0.04]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
            <div className="relative px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-white/40 hover:text-white/90 text-sm py-2.5 px-3 rounded-lg hover:bg-white/[0.04] transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
