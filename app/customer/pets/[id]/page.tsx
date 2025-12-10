"use client"

import Link from "next/link"
import { 
  ArrowLeft, 
  Printer, 
  Edit, 
  MoreVertical, 
  FileText,
  Syringe,
  Download,
  Plus,
  QrCode,
  Phone,
  Mail,
  MapPin,
  Clock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" 
import { Separator } from "@/components/ui/separator" 

// Dữ liệu giả lập (Mock data)
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
  owner: {
    name: "Lâm Quỳnh Hương",
    regDate: "21-08-2025 10:34",
    phone: "0975743223",
    email: "huong.lq@example.com",
    address: "100/108 Thích Quảng Đức, Phường 5, Quận Phú Nhuận"
  },
  currentVisit: {
    date: "21-08-2025 10:38",
    symptom: "Sốt cao, bỏ ăn 2 ngày nay.",
  },
  history: [
    {
      id: "KB250821001",
      type: "CN",
      date: "21-08-2025 10:38",
      doctor: "BSTY An Giao",
      note: "Nghi ngờ ký sinh trùng máu. Lưu chuồng theo dõi."
    }
  ],
  vaccines: [
    {
      id: 1,
      drug: "Purevax RCPCh",
      dose: "Mũi 1",
      date: "15-03-2024",
      doctor: "BSTY Minh Tú",
      type: "CN",
      note: "Sức khỏe tốt"
    }
  ]
}

export default function PetDetailPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <Button variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            In mã vạch
          </Button>
          <Button className="gap-2 bg-destructive hover:bg-destructive/90">
            Đóng hồ sơ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-primary">Sửa</Button>
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
                  {/* Fake Barcode */}
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-base font-bold">Khách hàng</CardTitle>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-primary">Sửa</Button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <Link href="#" className="text-primary font-semibold hover:underline">
                  {petDetail.owner.name}
                </Link>
                <div className="flex items-center gap-2 text-muted-foreground mt-1 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Đăng ký: {petDetail.owner.regDate}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{petDetail.owner.phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{petDetail.owner.email || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{petDetail.owner.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Album */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-base font-bold">Album hình</CardTitle>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-primary gap-1">
                <Plus className="w-3 h-3" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-md bg-muted flex items-center justify-center text-muted-foreground/50">Img 1</div>
                  <div className="aspect-square rounded-md bg-muted flex items-center justify-center text-muted-foreground/50">Img 2</div>
                  <Button variant="outline" className="h-full aspect-square border-dashed">
                     <Download className="w-4 h-4" />
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (Main Content) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* 1. Status Row */}
          <div className="grid gap-6"> 
            {/* Symptoms */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-base font-bold">Triệu chứng & Diễn tiến</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4 text-muted-foreground"/></Button>
               </CardHeader>
               <CardContent>
                  <Badge variant="secondary" className="mb-2">{petDetail.currentVisit.date}</Badge>
                  <p className="text-sm leading-relaxed">{petDetail.currentVisit.symptom}</p>
               </CardContent>
            </Card>
          </div>

          {/* 2. Medical Tabs */}
          <Card className="min-h-[300px]">
            <Tabs defaultValue="exam" className="w-full">
              <div className="px-6 pt-6">
                 <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger value="exam" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0 pb-2">Phiếu khám bệnh</TabsTrigger>
                    <TabsTrigger value="assign" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0 pb-2">Phiếu chỉ định</TabsTrigger>
                    <TabsTrigger value="rx" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0 pb-2">Đơn thuốc</TabsTrigger>
                    <TabsTrigger value="service" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0 pb-2">Dịch vụ điều trị</TabsTrigger>
                 </TabsList>
              </div>
              
              <CardContent className="p-0">
                <TabsContent value="exam" className="m-0">
                   <div className="p-6">
                      <div className="border rounded-lg overflow-hidden">
                         <div className="bg-muted/50 p-3 grid grid-cols-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-2">Mã Phiếu</div>
                            <div className="col-span-1 text-center">Loại</div>
                            <div className="col-span-3">Ngày tạo</div>
                            <div className="col-span-3">Bác sĩ</div>
                            <div className="col-span-3 text-right">Thao tác</div>
                         </div>
                         <div className="divide-y">
                            {petDetail.history.map((item) => (
                               <div key={item.id} className="p-4 grid grid-cols-12 text-sm items-start gap-2 hover:bg-muted/30 transition-colors">
                                  <div className="col-span-2 font-medium text-primary cursor-pointer hover:underline">{item.id}</div>
                                  <div className="col-span-1 text-center"><Badge variant="outline">{item.type}</Badge></div>
                                  <div className="col-span-3 text-muted-foreground">{item.date}</div>
                                  <div className="col-span-3 font-medium">{item.doctor}</div>
                                  <div className="col-span-3 flex justify-end gap-2">
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600"><Edit className="w-4 h-4"/></Button>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><MoreVertical className="w-4 h-4"/></Button>
                                  </div>
                                  <div className="col-span-12 mt-2 bg-muted/30 p-3 rounded text-sm text-muted-foreground italic">
                                     Lời dặn: {item.note}
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </TabsContent>
                <TabsContent value="assign" className="p-6 text-center text-muted-foreground">Chưa có chỉ định nào.</TabsContent>
                <TabsContent value="rx" className="p-6 text-center text-muted-foreground">Chưa có đơn thuốc nào.</TabsContent>
                <TabsContent value="service" className="p-6 text-center text-muted-foreground">Chưa có dịch vụ nào.</TabsContent>
              </CardContent>
            </Tabs>
          </Card>
          
          {/* 3. Files */}
          <Card>
             <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Files khám bệnh</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 cursor-pointer transition-colors">
                   <Download className="w-6 h-6 mb-2 opacity-50"/>
                   <span className="text-sm">Tải thêm file đính kèm</span>
                </div>
             </CardContent>
          </Card>

          {/* 4. Vaccination History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
               <div>
                  <CardTitle className="text-base font-bold">Quá trình tiêm phòng</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Lịch sử tiêm chủng và tẩy giun</p>
               </div>
               <Button size="sm" variant="outline" className="h-8 gap-1">
                  <Plus className="w-3 h-3"/> Thêm lịch sử
               </Button>
            </CardHeader>
            <CardContent>
               <div className="border rounded-lg overflow-hidden mt-4">
                  <table className="w-full text-sm">
                     <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                        <tr>
                           <th className="px-4 py-3 text-left font-medium">STT</th>
                           <th className="px-4 py-3 text-left font-medium">Thuốc</th>
                           <th className="px-4 py-3 text-left font-medium">Mũi tiêm</th>
                           <th className="px-4 py-3 text-left font-medium">Ngày tiêm</th>
                           <th className="px-4 py-3 text-left font-medium">Bác sĩ</th>
                           <th className="px-4 py-3 text-left font-medium">Ghi chú</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y">
                        {petDetail.vaccines.map((vac, index) => (
                           <tr key={vac.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                              <td className="px-4 py-3 font-medium text-primary">{vac.drug}</td>
                              <td className="px-4 py-3"><Badge variant="outline">{vac.dose}</Badge></td>
                              <td className="px-4 py-3">{vac.date}</td>
                              <td className="px-4 py-3">{vac.doctor}</td>
                              <td className="px-4 py-3 text-muted-foreground">{vac.note}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}