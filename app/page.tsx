import { Header } from "@/components/header"
import { HeroSection } from "@/components/sections/hero"
import { PortfolioGrid } from "@/components/sections/portfolio-grid"
import { AboutSection } from "@/components/sections/about"
import { ContactSection } from "@/components/sections/contact"
import { Footer } from "@/components/footer"
import { ShaderBackground } from "@/components/shader-background"

export default function Home() {
  return (
    <main className="text-foreground relative">
      {/* Fixed WebGL shader background behind everything */}
      <ShaderBackground />

      {/* All content sits above the shader */}
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <PortfolioGrid />
        <AboutSection />
        <ContactSection />
        <Footer />
      </div>
    </main>
  )
}
