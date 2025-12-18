"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Stethoscope, Clock, User, Phone, FileText, Syringe, Plus, Trash2, Check, History } from "lucide-react"

const queue = [
  {
    id: 1,
    order: 1,
    pet: "Mochi",
    species: "Chó",
    breed: "Poodle",
    age: "2 tuổi",
    gender: "Đực",
    owner: "Nguyễn Văn A",
    phone: "0901234567",
    image: "/cute-poodle.png",
    examCount: 5,
    vaccineCount: 8,
    status: "waiting",
  },
  {
    id: 2,
    order: 2,
    pet: "Luna",
    species: "Mèo",
    breed: "British Shorthair",
    age: "1 tuổi",
    gender: "Cái",
    owner: "Trần Thị B",
    phone: "0912345678",
    image: "/cute-british-shorthair-cat.jpg",
    examCount: 3,
    vaccineCount: 4,
    status: "waiting",
  },
]

const medicines = [
  { id: 1, name: "Amoxicillin 250mg", unit: "Viên", price: 5000 },
  { id: 2, name: "Metronidazole 500mg", unit: "Viên", price: 8000 },
  { id: 3, name: "Vitamin B Complex", unit: "Ống", price: 15000 },
  { id: 4, name: "Thuốc nhỏ mắt Tobrex", unit: "Chai", price: 85000 },
  { id: 5, name: "Dexamethasone 0.5mg", unit: "Viên", price: 3000 },
]

interface PrescriptionItem {
  medicineId: number
  name: string
  quantity: number
  dosage: string
  note: string
}

export default function ExaminationPage() {
  const [selectedPet, setSelectedPet] = useState<(typeof queue)[0] | null>(null)
  const [examForm, setExamForm] = useState({
    symptoms: "",
    diagnosis: "",
    followUpDate: "",
  })
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([])
  const [prescriptionOpen, setPrescriptionOpen] = useState(false)
  const [newMedicine, setNewMedicine] = useState({
    medicineId: 0,
    quantity: 1,
    dosage: "",
    note: "",
  })

  const todayExams = 8
  const completedExams = 5

  const addMedicine = () => {
    if (newMedicine.medicineId && newMedicine.quantity > 0) {
      const medicine = medicines.find((m) => m.id === newMedicine.medicineId)
      if (medicine) {
        setPrescription([
          ...prescription,
          {
            medicineId: medicine.id,
            name: medicine.name,
            quantity: newMedicine.quantity,
            dosage: newMedicine.dosage,
            note: newMedicine.note,
          },
        ])
        setNewMedicine({ medicineId: 0, quantity: 1, dosage: "", note: "" })
      }
    }
  }

  const removeMedicine = (index: number) => {
    setPrescription(prescription.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Khám bệnh</h1>
          <p className="text-muted-foreground">Thực hiện khám và kê đơn cho thú cưng</p>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {completedExams}/{todayExams}
              </p>
              <p className="text-sm text-muted-foreground">Ca khám hôm nay</p>
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
              Hàng đợi khám
            </CardTitle>
            <CardDescription>{queue.length} thú cưng đang chờ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedPet?.id === item.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedPet(item)}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
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
                <Badge variant="secondary" className="text-xs">
                  Chờ
                </Badge>
              </div>
            ))}
            {queue.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">Không có thú cưng đang chờ khám</div>
            )}
          </CardContent>
        </Card>

        {/* Examination Form */}
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
                        <p className="text-sm text-muted-foreground">
                          {selectedPet.gender} • {selectedPet.age}
                        </p>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Stethoscope className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedPet.examCount} lần khám</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Syringe className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedPet.vaccineCount} mũi tiêm</span>
                          </div>
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
                        Xem lịch sử khám
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin khám bệnh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Triệu chứng *</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Mô tả triệu chứng của thú cưng..."
                      rows={3}
                      value={examForm.symptoms}
                      onChange={(e) => setExamForm({ ...examForm, symptoms: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Chẩn đoán</Label>
                    <Textarea
                      id="diagnosis"
                      placeholder="Kết quả chẩn đoán..."
                      rows={3}
                      value={examForm.diagnosis}
                      onChange={(e) => setExamForm({ ...examForm, diagnosis: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày khám</Label>
                      <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="followUp">Ngày tái khám</Label>
                      <Input
                        id="followUp"
                        type="date"
                        value={examForm.followUpDate}
                        onChange={(e) => setExamForm({ ...examForm, followUpDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Prescription */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Toa thuốc</Label>
                      <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                            <Plus className="w-4 h-4" />
                            Thêm thuốc
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Thêm thuốc vào toa</DialogTitle>
                            <DialogDescription>Chọn thuốc và nhập liều dùng</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Tên thuốc</Label>
                              <Select
                                value={newMedicine.medicineId.toString()}
                                onValueChange={(v) =>
                                  setNewMedicine({ ...newMedicine, medicineId: Number.parseInt(v) })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn thuốc" />
                                </SelectTrigger>
                                <SelectContent>
                                  {medicines.map((m) => (
                                    <SelectItem key={m.id} value={m.id.toString()}>
                                      {m.name} ({m.unit})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Số lượng</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={newMedicine.quantity}
                                  onChange={(e) =>
                                    setNewMedicine({ ...newMedicine, quantity: Number.parseInt(e.target.value) || 1 })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Liều dùng</Label>
                                <Input
                                  placeholder="VD: Sáng 1, tối 1"
                                  value={newMedicine.dosage}
                                  onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Ghi chú</Label>
                              <Input
                                placeholder="Ghi chú thêm..."
                                value={newMedicine.note}
                                onChange={(e) => setNewMedicine({ ...newMedicine, note: e.target.value })}
                              />
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => {
                                addMedicine()
                                setPrescriptionOpen(false)
                              }}
                            >
                              Thêm vào toa
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {prescription.length > 0 ? (
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3 font-medium">Tên thuốc</th>
                              <th className="text-left p-3 font-medium">SL</th>
                              <th className="text-left p-3 font-medium">Liều dùng</th>
                              <th className="text-left p-3 font-medium">Ghi chú</th>
                              <th className="p-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescription.map((item, index) => (
                              <tr key={index} className="border-t">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3">{item.quantity}</td>
                                <td className="p-3">{item.dosage}</td>
                                <td className="p-3 text-muted-foreground">{item.note}</td>
                                <td className="p-3">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => removeMedicine(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg border-dashed">
                        Chưa có thuốc trong toa
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <FileText className="w-4 h-4" />
                      Hoàn tất (không kê đơn)
                    </Button>
                    <Button className="gap-2">
                      <Check className="w-4 h-4" />
                      Hoàn tất & Lưu toa thuốc
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chọn một thú cưng từ hàng đợi để bắt đầu khám</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
