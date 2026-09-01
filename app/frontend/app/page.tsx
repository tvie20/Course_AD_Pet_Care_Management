"use client" // 1. Bắt buộc dòng này để dùng được useEffect

import { useEffect } from "react"
import { useRouter } from "next/navigation" // Dùng next/router nếu bạn dùng bản Next cũ (Pages router)

import { PublicHeader } from "@/components/public-header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { BranchesSection } from "@/components/branches-section"
import { MembershipSection } from "@/components/membership-section"
import { PublicFooter } from "@/components/public-footer"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Get info from LocalStorage
    // Staff can access page without login
    const token = localStorage.getItem("accessToken")
    const role = localStorage.getItem("role")

    // If token is exists and Role is admin
    if (token && role === "admin") {
       // Path to admin page
       router.push("/staff")
    }
    
    // Continue render components and display login page
  }, [router])

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