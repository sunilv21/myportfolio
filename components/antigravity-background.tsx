"use client"

import { useEffect, useRef, useCallback } from "react"

interface Circle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  dashOffset: number
  dashSpeed: number
  opacity: number
  lineWidth: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  opacity: number
}

export function AntigravityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animationRef = useRef<number>(0)
  const circlesRef = useRef<Circle[]>([])
  const particlesRef = useRef<Particle[]>([])

  const MOUSE_RADIUS = 150
  const MOUSE_FORCE = 0.8

  const initShapes = useCallback((width: number, height: number) => {
    // Create dashed circles of various sizes
    const circles: Circle[] = []
    const circleCount = Math.min(8, Math.floor(width / 200))
    
    for (let i = 0; i < circleCount; i++) {
      circles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 30 + Math.random() * 60,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        dashOffset: Math.random() * 100,
        dashSpeed: 0.2 + Math.random() * 0.3,
        opacity: 0.15 + Math.random() * 0.2,
        lineWidth: 1.5 + Math.random() * 1,
      })
    }
    circlesRef.current = circles

    // Create small confetti particles
    const particles: Particle[] = []
    const particleCount = Math.min(60, Math.floor(width / 25))
    const colors = [
      "#f97316", // orange
      "#fb923c", // light orange
      "#22c55e", // green
      "#4ade80", // light green
      "#fbbf24", // amber
      "#f59e0b", // yellow
      "#ef4444", // red
      "#6366f1", // indigo
      "#8b5cf6", // violet
    ]

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.3 + Math.random() * 0.5,
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const handleResize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = window.devicePixelRatio || 1
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(dpr, dpr)

      if (circlesRef.current.length === 0) {
        initShapes(rect.width, rect.height)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    const animate = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      ctx.clearRect(0, 0, width, height)
      const mouse = mouseRef.current

      // Update and draw dashed circles
      for (const circle of circlesRef.current) {
        // Mouse repulsion
        const dx = circle.x - mouse.x
        const dy = circle.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < MOUSE_RADIUS + circle.radius) {
          const force = (MOUSE_RADIUS + circle.radius - dist) / (MOUSE_RADIUS + circle.radius)
          const angle = Math.atan2(dy, dx)
          circle.vx += Math.cos(angle) * force * MOUSE_FORCE
          circle.vy += Math.sin(angle) * force * MOUSE_FORCE
        }

        // Apply velocity with friction
        circle.x += circle.vx
        circle.y += circle.vy
        circle.vx *= 0.98
        circle.vy *= 0.98

        // Bounce off edges softly
        if (circle.x < -circle.radius) circle.x = width + circle.radius
        if (circle.x > width + circle.radius) circle.x = -circle.radius
        if (circle.y < -circle.radius) circle.y = height + circle.radius
        if (circle.y > height + circle.radius) circle.y = -circle.radius

        // Animate dash
        circle.dashOffset += circle.dashSpeed

        // Draw dashed circle
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(249, 115, 22, ${circle.opacity})`
        ctx.lineWidth = circle.lineWidth
        ctx.setLineDash([6, 8])
        ctx.lineDashOffset = circle.dashOffset
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Update and draw confetti particles
      for (const particle of particlesRef.current) {
        // Mouse repulsion for particles
        const dx = particle.x - mouse.x
        const dy = particle.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS
          const angle = Math.atan2(dy, dx)
          particle.vx += Math.cos(angle) * force * 0.5
          particle.vy += Math.sin(angle) * force * 0.5
        }

        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.99
        particle.vy *= 0.99

        // Wrap around edges
        if (particle.x < 0) particle.x = width
        if (particle.x > width) particle.x = 0
        if (particle.y < 0) particle.y = height
        if (particle.y > height) particle.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationRef.current)
    }
  }, [initShapes])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-5 pointer-events-auto"
      style={{ zIndex: -5 }}
    />
  )
}
