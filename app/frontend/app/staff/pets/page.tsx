"use client"

import { useState, useEffect } from "react"
import { 
  Search, Filter, MoreHorizontal, FileText, User, Phone, 
  Calendar, Activity, Stethoscope, Syringe, History, Loader2, 
  ChevronLeft, ChevronRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function StaffPetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 20

  const [selectedPet, setSelectedPet] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [petHistory, setPetHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // ... (Giữ nguyên hàm getAuthHeader)
  const getAuthHeader = () => {
    const token = localStorage.getItem("staffAccessToken")
    const userStr = localStorage.getItem("staffUser")
    if (!token || !userStr) return null
    const user = JSON.parse(userStr)
    return {
      "Content-Type": "application/json",
      "authorization": token,
      "x-client-id": user.MaNV
    }
  }

  // Fetch Pets
  const fetchPets = async (currentPage: number) => {
    setLoading(true)
    const headers = getAuthHeader()
    if (!headers) return

    try {
        const queryParams = new URLSearchParams({
            search: searchTerm,
            page: currentPage.toString(),
            limit: LIMIT.toString()
        })

        const res = await fetch(`http://localhost:3055/api/staff/pets?${queryParams.toString()}`, { headers })
        
        if (res.ok) {
            const data = await res.json()
            // Backend trả về: { list: [], total: number }
            const result = data.metadata
            
            setPets(result.list)
            // Tính tổng số trang
            setTotalPages(Math.ceil(result.total / LIMIT))
        }
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
  }

  // ... (Giữ nguyên fetchPetHistory)
  const fetchPetHistory = async (petId: string) => {
      setHistoryLoading(true)
      setPetHistory([])
      const headers = getAuthHeader()
      if (!headers) return

      try {
          const res = await fetch(`http://localhost:3055/api/staff/pets/${petId}/history`, { headers })
          if (res.ok) {
              const data = await res.json()
              setPetHistory(data.metadata)
          }
      } catch (error) {
          console.error(error)
      } finally {
          setHistoryLoading(false)
      }
  }

  useEffect(() => {
      const timer = setTimeout(() => {
          setPage(1)
          fetchPets(1)
      }, 500)
      return () => clearTimeout(timer)
  }, [searchTerm])

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setPage(newPage)
          fetchPets(newPage)
      }
  }

  const handleViewDetail = (pet: any) => {
    setSelectedPet(pet)
    setIsDialogOpen(true)
    fetchPetHistory(pet.id)
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Bình thường": return "bg-green-100 text-green-700 hover:bg-green-200";
      case "Tốt": return "bg-green-100 text-green-700 hover:bg-green-200";
      case "Rất tốt": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
      case "Tệ": return "bg-red-100 text-red-700 hover:bg-red-200";
      case "Rất tệ": return "bg-red-200 text-red-800 hover:bg-red-300";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  const renderPaginationButtons = () => {
      const buttons = []
      const maxVisiblePages = 5 

      let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      if (endPage - startPage + 1 < maxVisiblePages) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      // Nút trang đầu
      if (startPage > 1) {
          buttons.push(
              <Button 
                  key={1} 
                  variant="outline" 
                  size="sm" 
                  // SỬA Ở ĐÂY: Thay w-9 thành min-w-9 w-auto px-2
                  className="min-w-9 w-auto px-2" 
                  onClick={() => handlePageChange(1)}
              >
                  1
              </Button>
          )
          if (startPage > 2) {
              buttons.push(<span key="dots1" className="px-2 text-muted-foreground">...</span>)
          }
      }

      // Các nút trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
          buttons.push(
              <Button
                  key={i}
                  variant={page === i ? "default" : "outline"}
                  size="sm"
                  // SỬA Ở ĐÂY: Thay w-9 thành min-w-9 w-auto px-2
                  className={`min-w-9 w-auto px-2 ${page === i ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                  onClick={() => handlePageChange(i)}
              >
                  {i}
              </Button>
          )
      }

      // Nút trang cuối
      if (endPage < totalPages) {
          if (endPage < totalPages - 1) {
              buttons.push(<span key="dots2" className="px-2 text-muted-foreground">...</span>)
          }
          buttons.push(
              <Button 
                  key={totalPages} 
                  variant="outline" 
                  size="sm" 
                  // SỬA Ở ĐÂY: Thay w-9 thành min-w-9 w-auto px-2
                  className="min-w-9 w-auto px-2" 
                  onClick={() => handlePageChange(totalPages)}
              >
                  {totalPages}
              </Button>
          )
      }

      return buttons
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tra cứu thú cưng</h1>
          <p className="text-muted-foreground">Quản lý hồ sơ, lịch sử khám bệnh và thông tin chủ nuôi.</p>
        </div>
      </div>

      {/* Thanh tìm kiếm (Giữ nguyên) */}
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
              {loading ? (
                  <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center"><Loader2 className="animate-spin inline-block" /></TableCell>
                  </TableRow>
              ) : pets.length > 0 ? (
                pets.map((pet) => (
                  <TableRow key={pet.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(pet)}>
                    <TableCell className="font-medium font-mono text-xs">{pet.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{pet.name}</span>
                        <span className="text-xs text-muted-foreground">{pet.age}</span>
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
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy kết quả nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* THANH PHÂN TRANG - ĐÃ CĂN GIỮA */}
        {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-4 px-4 border-t bg-slate-50/50">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || loading}
                    className="flex items-center gap-1"
                >
                    <ChevronLeft className="h-4 w-4" /> Trước
                </Button>
                
                {renderPaginationButtons()}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages || loading}
                    className="flex items-center gap-1"
                >
                    Sau <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        )}
      </Card>

      {/* Modal chi tiết thú cưng (Giữ nguyên phần này) */}
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
                      {historyLoading ? (
                          <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="animate-spin inline-block"/></TableCell></TableRow>
                      ) : petHistory.length > 0 ? (
                          petHistory.map((item: any, index: number) => (
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
                          ))
                      ) : (
                          <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Chưa có lịch sử tại chi nhánh này</TableCell></TableRow>
                      )}
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