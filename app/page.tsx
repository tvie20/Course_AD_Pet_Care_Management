import { PublicHeader } from "@/components/public-header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { BranchesSection } from "@/components/branches-section"
import { MembershipSection } from "@/components/membership-section"
import { PublicFooter } from "@/components/public-footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <BranchesSection />
        <MembershipSection />
      </main>
      <PublicFooter />
    </div>
  )
}
