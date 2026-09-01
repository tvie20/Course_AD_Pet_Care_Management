"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Upload, PawPrint, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    birthDate: "",
    gender: "Duc",
    healthStatus: "BinhThuong",
    note: ""
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem("accessToken")
    const userStr = localStorage.getItem("user")
    if (!token || !userStr) {
        alert("Vui lòng đăng nhập lại")
        return
    }
    const user = JSON.parse(userStr)

    try {
        let genderSQL = "Đực"
        if (formData.gender === "Cai") genderSQL = "Cái"

        let speciesSQL = "Chó"
        if (formData.species === "Meo") speciesSQL = "Mèo"
        if (formData.species === "Khac") speciesSQL = "Khác"

        const payload = {
            name: formData.name,
            species: speciesSQL,
            breed: formData.breed,
            gender: genderSQL,
            birthDate: formData.birthDate,
        }

        const res = await fetch("http://localhost:3055/api/add-pet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": token,
                "x-client-id": user.MaKH
            },
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            alert("Thêm thú cưng thành công!")
            router.push("/customer/pets")
        } else {
            const data = await res.json()
            alert(data.message || "Lỗi khi thêm thú cưng")
        }
    } catch (error) {
        console.error(error)
        alert("Lỗi kết nối server")
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center py-10 px-4">
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

      <Card className="w-full max-w-2xl shadow-lg border-none">
        <CardContent className="p-8">
          <form className="space-y-8" onSubmit={handleSubmit}>
            
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

              <div className="space-y-2">
                <Label htmlFor="TenTC">Tên thú cưng <span className="text-red-500">*</span></Label>
                <Input 
                    id="TenTC" 
                    placeholder="Ví dụ: Mochi, Luna..." 
                    className="h-11" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Loai">Loài <span className="text-red-500">*</span></Label>
                  <Select required onValueChange={(val) => setFormData({...formData, species: val})}>
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
                  <Input 
                    id="Giong" 
                    placeholder="VD: Poodle, Mèo Anh..." 
                    className="h-11" 
                    value={formData.breed}
                    onChange={(e) => setFormData({...formData, breed: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="NgaySinhTC">Ngày sinh (Ước lượng) <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date" 
                    id="NgaySinhTC" 
                    className="h-11" 
                    required 
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="TinhTrangSucKhoe">Tình trạng sức khỏe</Label>
                  <Select defaultValue="BinhThuong" onValueChange={(val) => setFormData({...formData, healthStatus: val})}>
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

              <div className="space-y-3">
                <Label>Giới tính <span className="text-red-500">*</span></Label>
                <RadioGroup 
                    defaultValue="Duc" 
                    className="flex gap-6"
                    onValueChange={(val) => setFormData({...formData, gender: val})}
                >
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
              
               <div className="space-y-2">
                  <Label htmlFor="GhiChu">Ghi chú thêm (Dị ứng, tính cách...)</Label>
                  <Textarea 
                    id="GhiChu" 
                    placeholder="Ví dụ: Bé sợ người lạ, dị ứng thịt gà..." 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                  />
               </div>

            </div>

            <div className="pt-4">
              <Button disabled={loading} className="w-full h-12 text-base bg-emerald-500 hover:bg-emerald-600 font-semibold shadow-md">
                {loading ? <Loader2 className="animate-spin" /> : "Lưu hồ sơ thú cưng"}
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
      
      <p className="mt-8 text-sm text-muted-foreground">
        © 2025 PetCareX. Bảo mật thông tin khách hàng tuyệt đối.
      </p>
    </div>
  )
}