"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Stethoscope, Syringe, Eye, FileText, Calendar } from "lucide-react"

const examHistory = [
  {
    id: 1,
    date: "10/12/2025",
    pet: "Mochi",
    branch: "PetCareX Quận 1",
    doctor: "BS. Nguyễn Văn A",
    diagnosis: "Viêm da dị ứng nhẹ",
    symptoms: "Ngứa, gãi nhiều vùng bụng và chân",
    treatment: "Bôi thuốc ngoài da, uống kháng histamin",
    followUp: "17/12/2025",
    prescription: [
      { name: "Apoquel 5.4mg", quantity: 14, dosage: "Sáng 1 viên" },
      { name: "Dầu tắm trị nấm", quantity: 1, dosage: "Tắm 2 lần/tuần" },
    ],
  },
  {
    id: 2,
    date: "25/11/2025",
    pet: "Luna",
    branch: "PetCareX Quận 1",
    doctor: "BS. Trần Thị B",
    diagnosis: "Khám sức khỏe định kỳ - Bình thường",
    symptoms: "Không có triệu chứng bất thường",
    treatment: "Không cần điều trị",
    followUp: null,
    prescription: [],
  },
  {
    id: 3,
    date: "15/10/2025",
    pet: "Mochi",
    branch: "PetCareX Quận 7",
    doctor: "BS. Lê Văn C",
    diagnosis: "Viêm ruột cấp",
    symptoms: "Tiêu chảy, bỏ ăn 2 ngày",
    treatment: "Truyền dịch, kháng sinh, men tiêu hóa",
    followUp: "20/10/2025",
    prescription: [
      { name: "Metronidazole 250mg", quantity: 10, dosage: "Sáng 1, tối 1" },
      { name: "Men tiêu hóa Bio-Pro", quantity: 1, dosage: "Ngày 2 gói" },
    ],
  },
]

const vaccineHistory = [
  {
    id: 1,
    date: "01/12/2025",
    pet: "Mochi",
    vaccine: "Vắc-xin 5 bệnh (DHPPi+L)",
    lot: "LOT2025A",
    dose: "1ml",
    doctor: "BS. Nguyễn Văn A",
    branch: "PetCareX Quận 1",
    type: "package",
    nextDate: "01/03/2026",
  },
  {
    id: 2,
    date: "15/11/2025",
    pet: "Luna",
    vaccine: "Vắc-xin 4 bệnh mèo (FVRCP)",
    lot: "LOT2025C",
    dose: "1ml",
    doctor: "BS. Trần Thị B",
    branch: "PetCareX Quận 1",
    type: "single",
    nextDate: "15/02/2026",
  },
  {
    id: 3,
    date: "01/11/2025",
    pet: "Mochi",
    vaccine: "Vắc-xin dại",
    lot: "LOT2025B",
    dose: "1ml",
    doctor: "BS. Nguyễn Văn A",
    branch: "PetCareX Quận 1",
    type: "package",
    nextDate: "01/11/2026",
  },
  {
    id: 4,
    date: "01/09/2025",
    pet: "Mochi",
    vaccine: "Vắc-xin 5 bệnh (DHPPi+L)",
    lot: "LOT2025A",
    dose: "1ml",
    doctor: "BS. Lê Văn C",
    branch: "PetCareX Quận 7",
    type: "package",
    nextDate: "01/12/2025",
  },
]

export default function HistoryPage() {
  const [selectedExam, setSelectedExam] = useState<(typeof examHistory)[0] | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lịch sử khám & tiêm</h1>
        <p className="text-muted-foreground">Xem lại lịch sử y tế của thú cưng</p>
      </div>

      <Tabs defaultValue="exam">
        <TabsList>
          <TabsTrigger value="exam" className="gap-2">
            <Stethoscope className="w-4 h-4" />
            Khám bệnh
          </TabsTrigger>
          <TabsTrigger value="vaccine" className="gap-2">
            <Syringe className="w-4 h-4" />
            Tiêm phòng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exam" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử khám bệnh</CardTitle>
              <CardDescription>Tổng cộng {examHistory.length} lần khám</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examHistory.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs text-primary font-medium">
                          {exam.date.split("/")[1]}/{exam.date.split("/")[2]}
                        </span>
                        <span className="text-lg font-bold text-primary">{exam.date.split("/")[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{exam.pet}</p>
                          <Badge variant="secondary">{exam.branch}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exam.doctor}</p>
                        <p className="text-sm mt-1">{exam.diagnosis}</p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 bg-transparent"
                          onClick={() => setSelectedExam(exam)}
                        >
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Chi tiết lần khám</DialogTitle>
                          <DialogDescription>
                            {exam.date} - {exam.pet}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Chi nhánh</p>
                              <p className="font-medium">{exam.branch}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Bác sĩ</p>
                              <p className="font-medium">{exam.doctor}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Triệu chứng</p>
                            <p className="text-sm">{exam.symptoms}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Chẩn đoán</p>
                            <p className="text-sm font-medium">{exam.diagnosis}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Chỉ định điều trị</p>
                            <p className="text-sm">{exam.treatment}</p>
                          </div>
                          {exam.followUp && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-sm">
                                Ngày tái khám: <span className="font-medium">{exam.followUp}</span>
                              </span>
                            </div>
                          )}
                          {exam.prescription.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                Toa thuốc
                              </p>
                              <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted">
                                    <tr>
                                      <th className="text-left p-2 font-medium">Thuốc</th>
                                      <th className="text-left p-2 font-medium">SL</th>
                                      <th className="text-left p-2 font-medium">Liều dùng</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {exam.prescription.map((item, idx) => (
                                      <tr key={idx} className="border-t">
                                        <td className="p-2">{item.name}</td>
                                        <td className="p-2">{item.quantity}</td>
                                        <td className="p-2">{item.dosage}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccine" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử tiêm phòng</CardTitle>
              <CardDescription>Tổng cộng {vaccineHistory.length} mũi tiêm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Ngày tiêm</th>
                      <th className="pb-3 font-medium">Thú cưng</th>
                      <th className="pb-3 font-medium">Loại vắc-xin</th>
                      <th className="pb-3 font-medium">Lô/Liều</th>
                      <th className="pb-3 font-medium">Bác sĩ</th>
                      <th className="pb-3 font-medium">Loại</th>
                      <th className="pb-3 font-medium">Mũi tiếp theo</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {vaccineHistory.map((vaccine) => (
                      <tr key={vaccine.id} className="border-b last:border-0">
                        <td className="py-4 font-medium">{vaccine.date}</td>
                        <td className="py-4">{vaccine.pet}</td>
                        <td className="py-4">{vaccine.vaccine}</td>
                        <td className="py-4 text-muted-foreground">
                          <div>{vaccine.lot}</div>
                          <div>{vaccine.dose}</div>
                        </td>
                        <td className="py-4">{vaccine.doctor}</td>
                        <td className="py-4">
                          <Badge variant={vaccine.type === "package" ? "default" : "secondary"}>
                            {vaccine.type === "package" ? "Theo gói" : "Mũi lẻ"}
                          </Badge>
                        </td>
                        <td className="py-4 text-primary font-medium">{vaccine.nextDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
