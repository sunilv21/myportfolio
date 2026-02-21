"use client"

import { motion } from "framer-motion"
import { Code2, Film, Palette, Megaphone } from "lucide-react"

export function AboutSection() {
  const skills = [
    {
      icon: Code2,
      category: "Software Development",
      description: "Building modern web experiences",
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Web Apps"],
      accent: "from-orange-400 to-amber-500",
    },
    {
      icon: Film,
      category: "Video & Motion",
      description: "Storytelling through moving images",
      items: ["Video Editing", "Motion Graphics", "Premiere Pro", "After Effects", "DaVinci Resolve"],
      accent: "from-red-400 to-orange-500",
    },
    {
      icon: Palette,
      category: "Design",
      description: "Visual identities that stand out",
      items: ["Graphic Design", "Branding", "UI/UX", "Figma", "Adobe Suite"],
      accent: "from-violet-400 to-fuchsia-500",
    },
    {
      icon: Megaphone,
      category: "Digital Marketing",
      description: "Data-driven growth strategies",
      items: ["Meta Ads", "Social Media", "Content Marketing", "Analytics", "Campaigns"],
      accent: "from-emerald-400 to-teal-500",
    },
  ]

  return (
    <section id="about" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="text-[11px] uppercase tracking-[0.25em] text-orange-400/60 font-medium mb-4 block">
            What I Do
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 mb-4">
            Skills & Expertise
          </h2>
          <p className="text-sm sm:text-base text-white/30 max-w-md mx-auto font-light">
            Multi-disciplinary creative with a passion for building things that matter.
          </p>
        </motion.div>

        {/* Skills grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {skills.map((skill, idx) => (
            <motion.div
              key={skill.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 hover:border-orange-400/15 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/[0.03]">
                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${skill.accent} flex items-center justify-center shadow-lg flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <skill.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white/80 group-hover:text-white/95 transition-colors mb-0.5">
                      {skill.category}
                    </h3>
                    <p className="text-xs text-white/25 font-light">{skill.description}</p>
                  </div>
                </div>

                {/* Skill tags */}
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((item, i) => (
                    <motion.span
                      key={item}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium border border-white/[0.06] bg-white/[0.02] text-white/40 group-hover:text-white/55 group-hover:border-white/[0.1] transition-all duration-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 + i * 0.05 }}
                      viewport={{ once: true }}
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
