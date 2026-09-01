"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, PawPrint } from "lucide-react"

const navItems = [
  { label: "Dịch vụ", href: "#services" },
  { label: "Chi nhánh", href: "#branches" },
  { label: "Chương trình hội viên", href: "#membership" },
  { label: "Liên hệ", href: "#contact" },
]

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <PawPrint className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">PetCareX</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Đăng ký hội viên</Link>
          </Button>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-2" />
              <Button variant="ghost" asChild className="justify-start">
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Đăng ký hội viên</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
