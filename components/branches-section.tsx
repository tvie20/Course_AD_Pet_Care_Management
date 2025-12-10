"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Clock, Search } from "lucide-react"

const branches = [
  {
    id: 1,
    name: "PetCareX Quận 1",
    address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
    phone: "028 1234 5678",
    hours: "08:00 - 20:00",
    city: "Hồ Chí Minh",
  },
  {
    id: 2,
    name: "PetCareX Quận 7",
    address: "456 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM",
    phone: "028 2345 6789",
    hours: "08:00 - 21:00",
    city: "Hồ Chí Minh",
  },
  {
    id: 3,
    name: "PetCareX Cầu Giấy",
    address: "789 Xuân Thủy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội",
    phone: "024 3456 7890",
    hours: "08:00 - 20:00",
    city: "Hà Nội",
  },
  {
    id: 4,
    name: "PetCareX Đà Nẵng",
    address: "321 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng",
    phone: "0236 456 7890",
    hours: "08:30 - 19:30",
    city: "Đà Nẵng",
  },
]

export function BranchesSection() {
  const [search, setSearch] = useState("")

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(search.toLowerCase()) ||
      branch.city.toLowerCase().includes(search.toLowerCase()) ||
      branch.address.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <section id="branches" className="py-20 lg:py-28 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Hệ thống chi nhánh</h2>
          <p className="text-muted-foreground text-lg">Tìm chi nhánh PetCareX gần bạn nhất để được phục vụ tốt nhất</p>
        </div>
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên chi nhánh hoặc thành phố..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {filteredBranches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">{branch.name}</h3>
                  <Badge variant="secondary">{branch.city}</Badge>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{branch.hours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
