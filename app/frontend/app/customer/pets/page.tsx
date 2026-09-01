"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Pencil, Trash2, Stethoscope, Syringe, Loader2, PackageSearch } from "lucide-react"

interface PetUI {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  age: string;
  gender: string;
  status: string;
  examCount: number;
  vaccineCount: number;
  image: string;
}

export default function PetsPage() {
  const [pets, setPets] = useState<PetUI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const calculateAge = (dateString: string) => {
    if (!dateString) return "Không rõ";
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? `${age} tuổi` : "Dưới 1 tuổi";
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB');
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Rất tốt": return "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent";
      case "Tốt": return "bg-green-500 hover:bg-green-600 text-white border-transparent";
      case "Bình thường": return "bg-blue-500 hover:bg-blue-600 text-white border-transparent";
      case "Tệ": return "bg-orange-500 hover:bg-orange-600 text-white border-transparent";
      case "Rất tệ": return "bg-red-600 hover:bg-red-700 text-white border-transparent";
      default: return "bg-gray-500 hover:bg-gray-600 text-white border-transparent";
    }
  }
  // -----------------------------------

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        const userStr = localStorage.getItem("user")
        
        if (!token || !userStr) return;

        const user = JSON.parse(userStr)

        const res = await fetch("http://localhost:3055/api/pets", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "authorization": token,
            "x-client-id": user.MaKH
          }
        })

        if (!res.ok) throw new Error("Failed to fetch pets")

        const data = await res.json()

        const mappedPets: PetUI[] = data.map((item: any) => ({
          id: item.MaTC,
          name: item.TenTC,
          species: item.Loai,
          breed: item.Giong,
          birthDate: formatDate(item.NgaySinhTC),
          age: calculateAge(item.NgaySinhTC),
          gender: item.GioiTinhTC || "Không rõ", 
          status: item.TinhTrangSucKhoe,
          examCount: item.SoLanKham || 0,
          vaccineCount: item.SoLanTiem || 0,
          image: item.Loai === "Mèo" ? "/cute-british-shorthair-cat-portrait.jpg" : "/cute-poodle-dog-portrait.jpg"
        }))

        setPets(mappedPets)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPets()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hồ sơ thú cưng</h1>
          <p className="text-muted-foreground">Quản lý thông tin thú cưng của bạn</p>
        </div>
        <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/customer/pets/new">
            <Plus className="w-4 h-4" />
            Thêm thú cưng
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <PackageSearch className="w-16 h-16 text-muted-foreground opacity-20" />
            <div className="space-y-1">
                <h3 className="text-lg font-medium">Chưa có thú cưng nào</h3>
                <p className="text-muted-foreground">Hãy thêm hồ sơ cho thú cưng của bạn để bắt đầu theo dõi sức khỏe.</p>
            </div>
        </div>
      ) : (
        <div className="grid gap-6">
            {pets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex items-center gap-6 md:border-r md:w-[400px]">
                    <Avatar className="w-24 h-24 rounded-2xl border-2 border-muted">
                        <AvatarImage src={pet.image} className="object-cover" />
                        <AvatarFallback className="text-2xl">{pet.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold">{pet.name}</h3>
                        <Badge className={getStatusColor(pet.status)}>
                            {pet.status}
                        </Badge>
                        </div>
                        <p className="text-muted-foreground">
                        {pet.species} • {pet.breed}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                        {pet.gender} • {pet.age} • Sinh {pet.birthDate}
                        </p>
                    </div>
                    </div>
                    
                    <div className="flex-1 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex gap-8">
                        <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold">{pet.examCount}</p>
                            <p className="text-xs text-muted-foreground">Lần khám</p>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                            <Syringe className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold">{pet.vaccineCount}</p>
                            <p className="text-xs text-muted-foreground">Mũi tiêm</p>
                        </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none">
                        <Link href={`/customer/pets/${pet.id}`}>
                            Xem chi tiết
                        </Link>
                        </Button>
                        
                        <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>
            ))}
        </div>
      )}
    </div>
  )
}