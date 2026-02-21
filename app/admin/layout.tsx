import type React from "react"
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - Radsting Dev",
  description: "Manage your portfolio content and view analytics",
  robots: "noindex, nofollow",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
