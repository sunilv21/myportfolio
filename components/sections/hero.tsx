"use client"

import { motion } from "framer-motion"
import { ArrowDown, Code2, Film, Palette, Megaphone } from "lucide-react"

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.4 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const services = [
    { icon: Code2, label: "Development" },
    { icon: Film, label: "Video Editing" },
    { icon: Palette, label: "Graphic Design" },
    { icon: Megaphone, label: "Meta Ads" },
  ]

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden">
      <motion.div
        className="max-w-5xl w-full text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Status badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase border border-orange-400/20 bg-orange-500/5 text-orange-300 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Available for projects
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold mb-3 leading-[0.95] tracking-tight"
          variants={itemVariants}
        >
          <span className="block text-white/90">Creative</span>
          <span className="block bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
            Developer
          </span>
        </motion.h1>

        <motion.p className="text-sm text-orange-300/40 mb-6 font-medium tracking-wide" variants={itemVariants}>
          Sunil Verma
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg text-white/40 mb-10 max-w-lg mx-auto leading-relaxed font-light"
          variants={itemVariants}
        >
          Turning ideas into polished digital experiences — from code to camera to canvas.
        </motion.p>

        {/* Service pills */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center mb-12">
          {services.map((s, i) => (
            <motion.div
              key={s.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-md text-white/50 text-sm hover:border-orange-400/25 hover:text-orange-300/80 transition-all duration-500 cursor-default"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -2 }}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="flex gap-4 justify-center flex-wrap">
          <motion.a
            href="#portfolio"
            className="group relative px-8 py-3 bg-orange-500 text-white rounded-full font-medium text-sm overflow-hidden shadow-lg shadow-orange-500/20"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10">View My Work</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>
          <motion.a
            href="#contact"
            className="px-8 py-3 rounded-full font-medium text-sm border border-white/10 text-white/60 hover:border-orange-400/30 hover:text-white/90 hover:bg-white/[0.03] backdrop-blur-sm transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Get In Touch
          </motion.a>
        </motion.div>

        {/* Scroll */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/15 font-medium">Scroll</span>
            <ArrowDown className="w-4 h-4 text-white/15" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
