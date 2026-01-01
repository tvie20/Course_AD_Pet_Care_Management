"use client"

import Link from "next/link"
import { useState } from "react"
import { 
  ArrowLeft, 
  Printer, 
  Plus,
  QrCode,
  Phone,
  Mail,
  MapPin,
  Clock,
  Image as ImageIcon,
  User,
  PawPrint
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" 
import { Separator } from "@/components/ui/separator" 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// --- DỮ LIỆU MẪU ---
const currentUser = {
  id: "CUS001",
  name: "Nguyễn Văn A",
  phone: "0901234567",
  email: "nguyenvana@gmail.com",
  address: "Chưa cập nhật",
  regDate: "20/05/2024"
}

const petDetail = {
  id: "PET250821001",
  name: "Chu",
  species: "Mèo",
  breed: "Ta (Mèo Việt Nam)",
  age: "2 tuổi (3/2023)",
  gender: "Cái",
  color: "Cam",
  weight: "3.6 kg",
  avatar: "/cute-british-shorthair-cat-portrait.jpg", 
  owner: currentUser,
  visits: [
    {
        date: "21-08-2025 10:38",
        symptom: "Sốt cao, bỏ ăn 2 ngày nay.",
        diagnosis: "Nghi ngờ ký sinh trùng máu. Lưu chuồng theo dõi.",
        doctor: "BSTY An Giao",
        type: "Khám bệnh",
        id: "KB250821001"
    }
  ],
  vaccines: [
    {
      id: 1,
      drug: "Purevax RCPCh",
      dose: "Mũi 1",
      date: "15-03-2024",
      doctor: "BSTY Minh Tú",
      type: "Tiêm phòng",
      note: "Sức khỏe tốt"
    }
  ]
}

export default function PetDetailPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Hàm xử lý in
  const handlePrintBarcode = () => {
    window.print();
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* ----------------- PHẦN TEM MÃ VẠCH (CHỈ HIỆN KHI IN) ----------------- */}
      <div className="hidden print:flex print:flex-col print:items-center print:justify-center print:h-screen print:w-full bg-white text-black p-4">
          <div className="border-2 border-black p-4 rounded-lg w-[300px] text-center space-y-2">
              <div className="flex items-center justify-center gap-2 font-bold text-lg border-b border-black pb-2 mb-2">
                  <PawPrint className="w-5 h-5"/> PetCareX
              </div>
              
              <h2 className="text-2xl font-bold uppercase">{petDetail.name}</h2>
              <p className="text-sm font-medium">{petDetail.species} - {petDetail.breed}</p>
              
              <div className="my-4 flex justify-center">
                  {/* Mô phỏng mã QR/Barcode */}
                  <div className="bg-white p-2">
                      <QrCode className="w-32 h-32"/>
                  </div>
              </div>
              
              <p className="font-mono font-bold text-lg tracking-wider">{petDetail.id}</p>
              
              <div className="text-xs text-left mt-4 pt-2 border-t border-dashed border-black">
                  <p>Chủ: {currentUser.name}</p>
                  <p>SĐT: {currentUser.phone}</p>
              </div>
          </div>
          <p className="mt-4 text-xs italic">Tem định danh thú cưng - Vui lòng không gỡ bỏ</p>
      </div>
      {/* --------------------------------------------------------------------- */}


      {/* Header Navigation (Ẩn khi in) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/customer/pets">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Vật nuôi</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-semibold">{petDetail.name}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Nút kích hoạt lệnh in */}
          <Button variant="outline" className="gap-2" onClick={handlePrintBarcode}>
            <Printer className="w-4 h-4" />
            In mã vạch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* 1. Pet Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="w-20 h-20 rounded-xl border-2 border-muted">
                  <AvatarImage src={petDetail.avatar} className="object-cover" />
                  <AvatarFallback>{petDetail.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{petDetail.name}</h2>
                  <p className="text-sm text-muted-foreground">{petDetail.breed}</p>
                  <p className="text-sm text-muted-foreground">{petDetail.age}</p>
                </div>
              </div>

              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Thông tin vật nuôi</h3>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-primary hover:bg-transparent hover:underline" asChild>
                    <Link href={`/customer/pets/${petDetail.id}/edit`}>Sửa</Link>
                  </Button>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Tên:</span>
                    <span className="col-span-2 font-medium">{petDetail.name}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Loài:</span>
                    <span className="col-span-2 font-medium">{petDetail.species} - {petDetail.breed}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Tuổi:</span>
                    <span className="col-span-2 font-medium">{petDetail.age}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Giới tính:</span>
                    <span className="col-span-2 font-medium">{petDetail.gender}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Màu sắc:</span>
                    <span className="col-span-2 font-medium">{petDetail.color}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col items-center gap-2">
                  <div className="h-12 w-full bg-slate-100 flex items-center justify-center rounded border border-dashed border-slate-300">
                      <div className="flex items-center gap-2 opacity-50">
                        <QrCode className="w-5 h-5"/>
                        <span className="font-mono tracking-widest text-lg">||| || ||| ||</span>
                      </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{petDetail.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Customer Info */}
          <Card className="bg-slate-50/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-bold">Thông tin chủ nuôi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-primary font-bold text-lg">
                  {currentUser.name} 
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-1 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Tham gia: {currentUser.regDate}</span>
                </div>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="font-medium">{currentUser.phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="leading-tight">{currentUser.address}</span>
                </div>
              </div>
              
              <div className="pt-2">
                 <Link href="/customer/profile" className="text-xs text-muted-foreground italic hover:text-primary hover:underline">
                    *Muốn thay đổi thông tin? Cập nhật tại trang Hồ sơ.
                 </Link>
              </div>
            </CardContent>
          </Card>

          {/* 3. Album */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-base font-bold">Album hình</CardTitle>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-primary gap-1 hover:bg-transparent hover:underline">
                        <Plus className="w-3 h-3" /> Thêm
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tải lên hình ảnh</DialogTitle>
                        <DialogDescription>Thêm hình ảnh mới vào album của {petDetail.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Hình ảnh</Label>
                            <Input id="picture" type="file" accept="image/*" />
                        </div>
                        <Button className="w-full" onClick={() => {
                            alert("Đã tải ảnh lên thành công!");
                            setIsUploadOpen(false);
                        }}>Tải lên</Button>
                    </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-md bg-muted flex items-center justify-center text-muted-foreground/50">
                      <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="aspect-square rounded-md bg-muted flex items-center justify-center text-muted-foreground/50">
                      <ImageIcon className="w-6 h-6" />
                  </div>
                  <div 
                    className="h-full aspect-square border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setIsUploadOpen(true)}
                  >
                     <Plus className="w-6 h-6 opacity-50" />
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (Main Content) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* 1. Status Row */}
          <div className="grid gap-6"> 
            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">Lịch sử khám bệnh & Triệu chứng</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  {petDetail.visits.length > 0 ? (
                      petDetail.visits.map((visit, index) => (
                          <div key={index} className="border-l-2 border-primary pl-4 py-1">
                              <div className="flex items-center justify-between mb-1">
                                  <Badge variant="secondary">{visit.date}</Badge>
                                  <span className="text-xs text-muted-foreground">{visit.doctor}</span>
                              </div>
                              <p className="text-sm font-medium mt-2">Triệu chứng: <span className="font-normal text-muted-foreground">{visit.symptom}</span></p>
                              <p className="text-sm font-medium">Chẩn đoán: <span className="font-normal text-muted-foreground">{visit.diagnosis}</span></p>
                          </div>
                      ))
                  ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Chưa có lịch sử khám bệnh.</p>
                  )}
               </CardContent>
            </Card>
          </div>

          {/* 2. Medical Tabs */}
          <Card className="min-h-[300px]">
            <Tabs defaultValue="exam" className="w-full">
              <div className="px-6 pt-6">
                 <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6 overflow-x-auto">
                    <TabsTrigger value="exam" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0 pb-2">Phiếu khám bệnh</TabsTrigger>
                    <TabsTrigger value="vaccine" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0 pb-2">Lịch sử tiêm phòng</TabsTrigger>
                 </TabsList>
              </div>
              
              <CardContent className="p-0">
                <TabsContent value="exam" className="m-0">
                   <div className="p-6">
                      <div className="border rounded-lg overflow-hidden">
                         <div className="bg-muted/50 p-3 grid grid-cols-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-3">Mã Phiếu</div>
                            <div className="col-span-2 text-center">Loại</div>
                            <div className="col-span-3">Ngày tạo</div>
                            <div className="col-span-4">Bác sĩ</div>
                         </div>
                         <div className="divide-y">
                            {petDetail.visits.map((item) => (
                               <div key={item.id} className="p-4 grid grid-cols-12 text-sm items-center gap-2 hover:bg-muted/30 transition-colors">
                                  <div className="col-span-3 font-medium text-primary">{item.id}</div>
                                  <div className="col-span-2 text-center"><Badge variant="outline">{item.type}</Badge></div>
                                  <div className="col-span-3 text-muted-foreground">{item.date}</div>
                                  <div className="col-span-4 font-medium">{item.doctor}</div>
                               </div>
                            ))}
                            {petDetail.visits.length === 0 && (
                                <div className="p-4 text-center text-sm text-muted-foreground">Không có dữ liệu phiếu khám.</div>
                            )}
                         </div>
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="vaccine" className="m-0">
                    <div className="p-6">
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Thuốc</th>
                                        <th className="px-4 py-3 text-left font-medium">Mũi tiêm</th>
                                        <th className="px-4 py-3 text-left font-medium">Ngày tiêm</th>
                                        <th className="px-4 py-3 text-left font-medium">Bác sĩ</th>
                                        <th className="px-4 py-3 text-left font-medium">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {petDetail.vaccines.map((vac, index) => (
                                        <tr key={index} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-primary">{vac.drug}</td>
                                            <td className="px-4 py-3"><Badge variant="outline">{vac.dose}</Badge></td>
                                            <td className="px-4 py-3">{vac.date}</td>
                                            <td className="px-4 py-3">{vac.doctor}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{vac.note}</td>
                                        </tr>
                                    ))}
                                    {petDetail.vaccines.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-3 text-center text-muted-foreground">Chưa có lịch sử tiêm phòng.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
          
          {/* 3. Files List */}
          <Card>
              <CardHeader className="pb-2">
                 <CardTitle className="text-base font-bold">Hồ sơ đính kèm</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">
                    Hiện chưa có file đính kèm nào (X-Quang, Xét nghiệm...)
                 </div>
              </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}