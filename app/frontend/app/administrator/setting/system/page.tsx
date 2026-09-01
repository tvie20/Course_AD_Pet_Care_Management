"use client"

import { useState } from "react"
import { 
  Save, Building2, Calculator, Shield, 
  Mail, Phone, MapPin, Percent, Coins, Server
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SystemConfigPage() {
  // State giả lập dữ liệu cấu hình
  const [config, setConfig] = useState({
    companyName: "Hệ thống Thú Y PetCareX",
    hotline: "1900 1234",
    email: "admin@petcarex.com",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    loyaltyRate: 50000, // 50k = 1 điểm
    defaultVat: 8,
    inventoryWarning: 10,
    autoBackup: true,
    emailNotification: true
  })

  const handleSave = () => {
    // Gọi API lưu cấu hình ở đây
    alert("Đã lưu cấu hình hệ thống thành công!")
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cấu hình hệ thống</h1>
          <p className="text-sm text-muted-foreground">Thiết lập các tham số vận hành chung cho toàn chuỗi.</p>
        </div>
        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
          <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="general">Thông tin chung</TabsTrigger>
          <TabsTrigger value="operation">Vận hành & Nghiệp vụ</TabsTrigger>
          <TabsTrigger value="technical">Hệ thống & Bảo mật</TabsTrigger>
        </TabsList>

        {/* TAB 1: THÔNG TIN CHUNG */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600"/> Thông tin doanh nghiệp
              </CardTitle>
              <CardDescription>Thông tin này sẽ hiển thị trên Header của hóa đơn và báo cáo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên hệ thống / Doanh nghiệp</Label>
                  <Input value={config.companyName} onChange={(e) => setConfig({...config, companyName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Hotline tổng đài</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" value={config.hotline} onChange={(e) => setConfig({...config, hotline: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email hỗ trợ</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" value={config.email} onChange={(e) => setConfig({...config, email: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ trụ sở</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" value={config.address} onChange={(e) => setConfig({...config, address: e.target.value})} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: VẬN HÀNH (QUAN TRỌNG) */}
        <TabsContent value="operation" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600"/> Quy tắc tính toán
              </CardTitle>
              <CardDescription>Cấu hình điểm thưởng, thuế và cảnh báo kho.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Cấu hình tích điểm */}
              <div className="grid gap-4 p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <Coins className="w-4 h-4 text-yellow-600"/> Quy đổi điểm Loyalty
                        </Label>
                        <p className="text-sm text-muted-foreground">Số tiền chi tiêu tương ứng với 1 điểm thưởng.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">1 Điểm = </span>
                        <div className="relative w-32">
                            <Input 
                                type="number" 
                                className="pr-12 text-right font-bold text-indigo-700" 
                                value={config.loyaltyRate}
                                onChange={(e) => setConfig({...config, loyaltyRate: parseInt(e.target.value)})}
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">VNĐ</span>
                        </div>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Percent className="w-4 h-4"/> Mức thuế VAT mặc định (%)</Label>
                    <Input 
                        type="number" 
                        value={config.defaultVat}
                        onChange={(e) => setConfig({...config, defaultVat: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-muted-foreground">Áp dụng tự động khi tạo hóa đơn mới.</p>
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Shield className="w-4 h-4"/> Ngưỡng cảnh báo tồn kho</Label>
                    <Input 
                        type="number" 
                        value={config.inventoryWarning}
                        onChange={(e) => setConfig({...config, inventoryWarning: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-muted-foreground">Hệ thống sẽ báo đỏ khi số lượng sản phẩm dưới mức này.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: KỸ THUẬT */}
        <TabsContent value="technical" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600"/> Tự động hóa & Sao lưu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col space-y-1">
                        <Label>Sao lưu dữ liệu tự động (Daily Backup)</Label>
                        <span className="text-xs text-muted-foreground">Dữ liệu sẽ được sao lưu vào lúc 02:00 sáng hàng ngày.</span>
                    </div>
                    <Switch checked={config.autoBackup} onCheckedChange={(v) => setConfig({...config, autoBackup: v})} />
                </div>
                <Separator />
                <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col space-y-1">
                        <Label>Gửi email thông báo lỗi hệ thống</Label>
                        <span className="text-xs text-muted-foreground">Gửi báo cáo về email admin khi có lỗi phát sinh từ Server.</span>
                    </div>
                    <Switch checked={config.emailNotification} onCheckedChange={(v) => setConfig({...config, emailNotification: v})} />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}