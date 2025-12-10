"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Upload, PawPrint } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function AddPetPage() {
  const [preview, setPreview] = useState<string | null>(null)

  // Xử lý upload ảnh giả lập
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center py-10 px-4">
      {/* Header Logo giống trang đăng ký */}
      <div className="mb-8 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-foreground">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <PawPrint className="w-6 h-6 text-primary-foreground" />
          </div>
          PetCareX
        </Link>
        <h1 className="text-3xl font-bold mt-4">Thêm thú cưng mới</h1>
        <p className="text-muted-foreground">Nhập thông tin thú cưng để chúng tôi chăm sóc tốt hơn</p>
      </div>

      {/* Form Card */}
      <Card className="w-full max-w-2xl shadow-lg border-none">
        <CardContent className="p-8">
          <form className="space-y-8">
            
            {/* Ảnh đại diện */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden group hover:border-primary transition-colors cursor-pointer">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-1 group-hover:text-primary" />
                    <span className="text-xs text-muted-foreground">Tải ảnh lên</span>
                  </div>
                )}
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">Thông tin cơ bản</h3>

              {/* Tên thú cưng */}
              <div className="space-y-2">
                <Label htmlFor="TenTC">Tên thú cưng <span className="text-red-500">*</span></Label>
                <Input id="TenTC" placeholder="Ví dụ: Mochi, Luna..." className="h-11" required />
              </div>

              {/* Loài & Giống (2 cột) */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Loai">Loài <span className="text-red-500">*</span></Label>
                  <Select required>
                    <SelectTrigger id="Loai" className="h-11">
                      <SelectValue placeholder="Chọn loài" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cho">Chó</SelectItem>
                      <SelectItem value="Meo">Mèo</SelectItem>
                      <SelectItem value="Khac">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="Giong">Giống loài (Breed)</Label>
                  <Input id="Giong" placeholder="VD: Poodle, Mèo Anh..." className="h-11" />
                </div>
              </div>

              {/* Ngày sinh & Tình trạng sức khỏe (2 cột) */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="NgaySinhTC">Ngày sinh (Ước lượng) <span className="text-red-500">*</span></Label>
                  <Input type="date" id="NgaySinhTC" className="h-11" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="TinhTrangSucKhoe">Tình trạng sức khỏe</Label>
                  <Select defaultValue="BinhThuong">
                    <SelectTrigger id="TinhTrangSucKhoe" className="h-11">
                      <SelectValue placeholder="Chọn tình trạng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BinhThuong">Khỏe mạnh / Bình thường</SelectItem>
                      <SelectItem value="BenhNhe">Ốm nhẹ / Cần theo dõi</SelectItem>
                      <SelectItem value="DangDieuTri">Đang điều trị bệnh</SelectItem>
                      <SelectItem value="MangThai">Đang mang thai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Giới tính */}
              <div className="space-y-3">
                <Label>Giới tính <span className="text-red-500">*</span></Label>
                <RadioGroup defaultValue="Duc" className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Duc" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer font-normal">Đực</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Cai" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer font-normal">Cái</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Ghi chú thêm (Optional) */}
               <div className="space-y-2">
                  <Label htmlFor="GhiChu">Ghi chú thêm (Dị ứng, tính cách...)</Label>
                  <Textarea id="GhiChu" placeholder="Ví dụ: Bé sợ người lạ, dị ứng thịt gà..." />
               </div>

            </div>

            {/* Nút Submit */}
            <div className="pt-4">
              <Button className="w-full h-12 text-base bg-emerald-500 hover:bg-emerald-600 font-semibold shadow-md">
                Lưu hồ sơ thú cưng
              </Button>
              
              <div className="text-center mt-6">
                <Button variant="link" asChild className="text-muted-foreground gap-2">
                  <Link href="/customer/pets">
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                  </Link>
                </Button>
              </div>
            </div>

          </form>
        </CardContent>
      </Card>
      
      {/* Footer text */}
      <p className="mt-8 text-sm text-muted-foreground">
        © 2025 PetCareX. Bảo mật thông tin khách hàng tuyệt đối.
      </p>
    </div>
  )
}