"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Syringe, Clock, User, Phone, History, AlertTriangle, Check, Package } from "lucide-react"

const vaccineQueue = [
  {
    id: 1,
    order: 1,
    pet: "Luna",
    species: "Mèo",
    breed: "British Shorthair",
    age: "1 tuổi",
    owner: "Trần Thị B",
    phone: "0912345678",
    image: "/cute-british-shorthair-cat.jpg",
    vaccineHistory: 4,
    hasPackage: true,
    packageName: "Gói tiêm mèo 12 tháng",
    packageRemaining: 3,
  },
  {
    id: 2,
    order: 2,
    pet: "Buddy",
    species: "Chó",
    breed: "Golden Retriever",
    age: "3 tuổi",
    owner: "Lê Văn C",
    phone: "0923456789",
    image: "/golden-retriever-portrait.png",
    vaccineHistory: 10,
    hasPackage: false,
  },
]

const vaccines = [
  { id: 1, name: "Vắc-xin 5 bệnh chó", lot: "LOT2025A", expiry: "30/06/2025", stock: 25 },
  { id: 2, name: "Vắc-xin dại", lot: "LOT2025B", expiry: "15/03/2025", stock: 50 },
  { id: 3, name: "Vắc-xin 4 bệnh mèo", lot: "LOT2025C", expiry: "20/08/2025", stock: 30 },
  { id: 4, name: "Vắc-xin Lepto", lot: "LOT2025D", expiry: "10/02/2025", stock: 15, warning: true },
]

const packages = [{ id: 1, name: "Gói tiêm mèo 12 tháng", remaining: 3, total: 6, expiry: "20/12/2025" }]

export default function VaccinationPage() {
  const [selectedPet, setSelectedPet] = useState<(typeof vaccineQueue)[0] | null>(null)
  const [vaccinationType, setVaccinationType] = useState<"single" | "package">("single")
  const [selectedVaccine, setSelectedVaccine] = useState("")
  const [selectedPackage, setSelectedPackage] = useState("")
  const [dosage, setDosage] = useState("")
  const [nextDate, setNextDate] = useState("")

  const todayVaccines = 8
  const completedVaccines = 5

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tiêm phòng</h1>
          <p className="text-muted-foreground">Thực hiện tiêm phòng cho thú cưng</p>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
              <Syringe className="w-6 h-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {completedVaccines}/{todayVaccines}
              </p>
              <p className="text-sm text-muted-foreground">Ca tiêm hôm nay</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hàng đợi tiêm
            </CardTitle>
            <CardDescription>{vaccineQueue.length} thú cưng đang chờ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {vaccineQueue.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedPet?.id === item.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedPet(item)}
              >
                <div className="w-8 h-8 rounded-full bg-chart-2/20 flex items-center justify-center text-chart-2 font-semibold text-sm">
                  {item.order}
                </div>
                <Avatar className="w-10 h-10 rounded-lg">
                  <AvatarImage src={item.image || "/placeholder.svg"} />
                  <AvatarFallback>{item.pet[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.pet}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.species} • {item.breed}
                  </p>
                </div>
                {item.hasPackage && (
                  <Badge variant="outline" className="text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    Gói
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vaccination Form */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPet ? (
            <>
              {/* Pet Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-20 h-20 rounded-2xl">
                        <AvatarImage src={selectedPet.image || "/placeholder.svg"} />
                        <AvatarFallback className="text-2xl">{selectedPet.pet[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedPet.pet}</h3>
                        <p className="text-muted-foreground">
                          {selectedPet.species} • {selectedPet.breed}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedPet.age}</p>
                        <div className="flex items-center gap-1 text-sm mt-2">
                          <Syringe className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedPet.vaccineHistory} mũi đã tiêm</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 md:border-l md:pl-6 space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Chủ nuôi</h4>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedPet.owner}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedPet.phone}</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 gap-1 bg-transparent">
                        <History className="w-4 h-4" />
                        Xem lịch sử tiêm
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Package Info */}
              {selectedPet.hasPackage && (
                <Alert className="border-primary/50 bg-primary/5">
                  <Package className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    <span className="font-medium">{selectedPet.packageName}</span> - Còn {selectedPet.packageRemaining}{" "}
                    lượt tiêm
                  </AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Thực hiện tiêm phòng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Vaccination Type */}
                  <div className="space-y-3">
                    <Label>Hình thức tiêm</Label>
                    <RadioGroup
                      value={vaccinationType}
                      onValueChange={(v) => setVaccinationType(v as "single" | "package")}
                      className="flex gap-4"
                    >
                      <Label
                        htmlFor="single"
                        className={`flex-1 p-4 rounded-lg border cursor-pointer text-center ${
                          vaccinationType === "single" ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <RadioGroupItem value="single" id="single" className="sr-only" />
                        <Syringe className="w-6 h-6 mx-auto mb-2" />
                        <span className="font-medium">Tiêm lẻ</span>
                      </Label>
                      <Label
                        htmlFor="package"
                        className={`flex-1 p-4 rounded-lg border cursor-pointer text-center ${
                          vaccinationType === "package" ? "border-primary bg-primary/5" : ""
                        } ${!selectedPet.hasPackage ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <RadioGroupItem
                          value="package"
                          id="package"
                          className="sr-only"
                          disabled={!selectedPet.hasPackage}
                        />
                        <Package className="w-6 h-6 mx-auto mb-2" />
                        <span className="font-medium">Theo gói</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  {!selectedPet.hasPackage && vaccinationType === "single" && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Khách chưa có gói tiêm. Có thể tư vấn mua gói để được ưu đãi 10-15%!
                      </AlertDescription>
                    </Alert>
                  )}

                  {vaccinationType === "package" && (
                    <div className="space-y-2">
                      <Label>Chọn gói tiêm</Label>
                      <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn gói tiêm" />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id.toString()}>
                              {pkg.name} - Còn {pkg.remaining}/{pkg.total} lượt
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Vaccine Selection */}
                  <div className="space-y-2">
                    <Label>Loại vắc-xin</Label>
                    <Select value={selectedVaccine} onValueChange={setSelectedVaccine}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vắc-xin" />
                      </SelectTrigger>
                      <SelectContent>
                        {vaccines.map((v) => (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{v.name}</span>
                              {v.warning && (
                                <Badge variant="destructive" className="text-xs">
                                  Sắp hết hạn
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedVaccine && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Lô: {vaccines.find((v) => v.id.toString() === selectedVaccine)?.lot} • HSD:{" "}
                        {vaccines.find((v) => v.id.toString() === selectedVaccine)?.expiry} • Tồn:{" "}
                        {vaccines.find((v) => v.id.toString() === selectedVaccine)?.stock}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Liều lượng tiêm</Label>
                      <Input
                        id="dosage"
                        placeholder="VD: 1ml"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextDate">Ngày hẹn mũi tiếp theo</Label>
                      <Input id="nextDate" type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" className="bg-transparent">
                      Hủy
                    </Button>
                    <Button className="gap-2">
                      <Check className="w-4 h-4" />
                      Hoàn tất tiêm & lưu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Syringe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chọn một thú cưng từ hàng đợi để thực hiện tiêm</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
