import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Pencil, Trash2, Stethoscope, Syringe } from "lucide-react"

// Dữ liệu giả lập danh sách thú cưng
const pets = [
  {
    id: "PET250821001", // ID dạng chuỗi để khớp với trang chi tiết
    name: "Luna", // Đổi tên khớp với ví dụ trang chi tiết trước đó
    species: "Mèo",
    breed: "British Shorthair",
    birthDate: "03/2023",
    age: "2 tuổi",
    gender: "Cái",
    status: "Đang điều trị",
    examCount: 5,
    vaccineCount: 8,
    image: "/cute-british-shorthair-cat-portrait.jpg",
  },
  {
    id: "2",
    name: "Mochi",
    species: "Chó",
    breed: "Poodle",
    birthDate: "15/03/2023",
    age: "2 tuổi",
    gender: "Đực",
    status: "Khỏe mạnh",
    examCount: 3,
    vaccineCount: 4,
    image: "/cute-poodle-dog-portrait.jpg",
  },
  {
    id: "3",
    name: "Buddy",
    species: "Chó",
    breed: "Golden Retriever",
    birthDate: "10/01/2022",
    age: "3 tuổi",
    gender: "Đực",
    status: "Khỏe mạnh",
    examCount: 12,
    vaccineCount: 10,
    image: "/golden-retriever-portrait.png",
  },
]

export default function PetsPage() {
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

      <div className="grid gap-6">
        {pets.map((pet) => (
          <Card key={pet.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex items-center gap-6 md:border-r md:w-[400px]">
                  <Avatar className="w-24 h-24 rounded-2xl border-2 border-muted">
                    <AvatarImage src={pet.image || "/placeholder.svg"} className="object-cover" />
                    <AvatarFallback className="text-2xl">{pet.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{pet.name}</h3>
                      <Badge variant={pet.status === "Khỏe mạnh" ? "secondary" : "destructive"}>
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
                    {/* BUTTON XEM CHI TIẾT */}
                    {/* Link này sẽ trỏ đến file: app/customer/pets/[id]/page.tsx */}
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
    </div>
  )
}