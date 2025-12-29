"use client"

import { useState } from "react"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileText, 
  User, 
  Phone, 
  Calendar, 
  Activity,
  Stethoscope,
  Syringe,
  History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// --- MOCK DATA (Dữ liệu giả lập) ---
const petsData = [
  {
    id: "PET001",
    name: "Milo",
    species: "Chó",
    breed: "Poodle",
    gender: "Đực",
    age: "2 tuổi",
    weight: "4.5 kg",
    owner: "Nguyễn Văn An",
    phone: "0901234567",
    address: "123 Lê Lợi, Q1, TP.HCM",
    status: "Bình thường", // Bình thường, Đang điều trị, Cần tái khám
    lastVisit: "2023-12-20",
    history: [
      { date: "2023-12-20", type: "Spa", note: "Cắt tỉa lông, tắm vệ sinh", doctor: "KTV Linh" },
      { date: "2023-11-15", type: "Khám bệnh", note: "Tiêu chảy nhẹ, đã kê đơn men vi sinh", doctor: "BS. Hùng" },
      { date: "2023-10-01", type: "Tiêm phòng", note: "Mũi 3 - 7 bệnh", doctor: "BS. Hùng" },
    ]
  },
  {
    id: "PET002",
    name: "Mimi",
    species: "Mèo",
    breed: "Anh lông ngắn",
    gender: "Cái",
    age: "1 tuổi",
    weight: "3.2 kg",
    owner: "Trần Thị Bích",
    phone: "0909888777",
    address: "45 Nguyễn Trãi, Q5, TP.HCM",
    status: "Đang điều trị",
    lastVisit: "2024-01-05",
    history: [
      { date: "2024-01-05", type: "Khám bệnh", note: "Viêm da, nấm vùng cổ", doctor: "BS. Lan" },
    ]
  },
  {
    id: "PET003",
    name: "Lu",
    species: "Chó",
    breed: "Corgi",
    gender: "Đực",
    age: "3 tuổi",
    weight: "12 kg",
    owner: "Phạm Văn Cường",
    phone: "0912345678",
    address: "78 Cách Mạng Tháng 8, Q3",
    status: "Cần tái khám",
    lastVisit: "2023-12-28",
    history: [
      { date: "2023-12-28", type: "Khám bệnh", note: "Kiểm tra chân sau do đi khập khiễng", doctor: "BS. Hùng" },
    ]
  },
]

export default function StaffPetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPet, setSelectedPet] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Logic tìm kiếm: Tìm theo tên Pet, Tên chủ, hoặc SĐT
  const filteredPets = petsData.filter((pet) => 
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.phone.includes(searchTerm) ||
    pet.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetail = (pet: any) => {
    setSelectedPet(pet)
    setIsDialogOpen(true)
  }

  // Helper để chọn màu cho trạng thái
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Bình thường": return "bg-green-100 text-green-700 hover:bg-green-200";
      case "Đang điều trị": return "bg-red-100 text-red-700 hover:bg-red-200";
      case "Cần tái khám": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tra cứu thú cưng</h1>
          <p className="text-muted-foreground">Quản lý hồ sơ, lịch sử khám bệnh và thông tin chủ nuôi.</p>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <Card>
        <CardContent className="p-4 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tên bé, tên chủ, SĐT hoặc mã hồ sơ..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Bộ lọc
          </Button>
        </CardContent>
      </Card>

      {/* Danh sách thú cưng */}
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã HS</TableHead>
                <TableHead>Thú cưng</TableHead>
                <TableHead>Chủ nuôi</TableHead>
                <TableHead>Giống loài</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Lần khám cuối</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPets.length > 0 ? (
                filteredPets.map((pet) => (
                  <TableRow key={pet.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(pet)}>
                    <TableCell className="font-medium">{pet.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{pet.name}</span>
                        <span className="text-xs text-muted-foreground">{pet.age} - {pet.weight}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{pet.owner}</span>
                        <span className="text-xs text-muted-foreground">{pet.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{pet.species} / {pet.breed}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pet.status)} variant="secondary">
                        {pet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{pet.lastVisit}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Không tìm thấy kết quả nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal chi tiết thú cưng */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPet && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start pr-8">
                    <div>
                        <DialogTitle className="text-2xl flex items-center gap-3">
                        {selectedPet.name} 
                        <Badge className={getStatusColor(selectedPet.status)}>{selectedPet.status}</Badge>
                        </DialogTitle>
                        <DialogDescription>
                        Mã hồ sơ: {selectedPet.id}
                        </DialogDescription>
                    </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Thông tin thú cưng */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-emerald-600">
                    <Activity className="h-4 w-4" /> Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm p-4 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Loài:</span> <span className="font-medium">{selectedPet.species}</span>
                    <span className="text-muted-foreground">Giống:</span> <span className="font-medium">{selectedPet.breed}</span>
                    <span className="text-muted-foreground">Giới tính:</span> <span className="font-medium">{selectedPet.gender}</span>
                    <span className="text-muted-foreground">Tuổi:</span> <span className="font-medium">{selectedPet.age}</span>
                    <span className="text-muted-foreground">Cân nặng:</span> <span className="font-medium">{selectedPet.weight}</span>
                  </div>
                </div>

                {/* Thông tin chủ nuôi */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-emerald-600">
                    <User className="h-4 w-4" /> Thông tin chủ nuôi
                  </h3>
                  <div className="space-y-2 text-sm p-4 bg-muted/30 rounded-lg">
                    <div className="flex gap-2">
                      <User className="h-4 w-4 text-muted-foreground" /> 
                      <span className="font-medium">{selectedPet.owner}</span>
                    </div>
                    <div className="flex gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" /> 
                      <span className="font-medium">{selectedPet.phone}</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" /> 
                      <span>{selectedPet.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lịch sử khám bệnh */}
              <div className="mt-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4 text-emerald-600">
                  <History className="h-4 w-4" /> Lịch sử khám & Dịch vụ
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Loại dịch vụ</TableHead>
                        <TableHead>Ghi chú / Chẩn đoán</TableHead>
                        <TableHead>Bác sĩ / KTV</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPet.history.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium whitespace-nowrap">{item.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                                {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.note}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{item.doctor}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                 <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" /> Đặt lịch hẹn
                 </Button>
                 <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <Stethoscope className="h-4 w-4" /> Tạo phiếu khám mới
                 </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PlusIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    )
}