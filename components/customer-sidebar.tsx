"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Dog, 
  Calendar, 
  History, 
  ShoppingBag, 
  Syringe, 
  Star, 
  User,
  PawPrint
} from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/customer/dashboard" },
  { icon: Dog, label: "Hồ sơ thú cưng", href: "/customer/pets" },
  { icon: Calendar, label: "Đặt lịch hẹn", href: "/customer/appointments" },
  { icon: History, label: "Lịch sử khám & tiêm", href: "/customer/medical-history" },
  { icon: ShoppingBag, label: "Lịch sử mua hàng", href: "/customer/orders" },
  { icon: Syringe, label: "Gói tiêm & nhắc lịch", href: "/customer/vaccines" },
  { icon: Star, label: "Đánh giá dịch vụ", href: "/customer/reviews" },
  { icon: User, label: "Thông tin tài khoản", href: "/customer/profile" },
]

export function CustomerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r min-h-screen hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-20">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <PawPrint className="w-6 h-6" />
          PetCareX
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t text-xs text-center text-muted-foreground">
        © 2025 PetCareX System
      </div>
    </aside>
  )
}