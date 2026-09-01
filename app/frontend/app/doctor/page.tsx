"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CalendarCheck, 
  Clock, 
  Stethoscope, 
  Syringe, 
  AlertTriangle, 
  ArrowRight, 
  User,
  RefreshCcw,
  Loader2
} from "lucide-react"

const iconMap: any = {
  CalendarCheck,
  Clock,
  Stethoscope,
  Syringe
}

export default function DoctorDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = async () => {
    try {
        const token = localStorage.getItem("staffAccessToken")
        const staffUserStr = localStorage.getItem("staffUser")
        
        if (!token || !staffUserStr) return;

        const staffUser = JSON.parse(staffUserStr);

        const res = await fetch("http://localhost:3055/api/doctor/dashboard", {
            headers: {
                "Content-Type": "application/json",
                "authorization": token,
                "x-client-id": staffUser.MaNV
            }
        })

        if (res.ok) {
            const response = await res.json()
            setData(response.metadata)
        }
    } catch (error) {
        console.error(error)
    } finally {
        setIsLoading(false)
        setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
  }
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Đang chờ</Badge>
      case 'in-progress':
        return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Đang khám</Badge>
      case 'booked':
        return <Badge variant="outline" className="text-muted-foreground">Đã đặt</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard bác sĩ</h1>
          <p className="text-muted-foreground">
            Xin chào, chúc bạn một ngày làm việc hiệu quả!
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Làm mới dữ liệu (F5)"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
             <RefreshCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.stats.map((stat: any, index: number) => {
          const IconComponent = iconMap[stat.icon] || CalendarCheck
          return (
            <Card key={index}>
                <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <IconComponent className="w-6 h-6" />
                    </div>
                </div>
                </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        
        <Card className="flex flex-col h-full border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-500" />
                Hàng đợi Khám bệnh
              </CardTitle>
              <CardDescription>Danh sách chờ khám lâm sàng</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
              <Link href="/doctor/examination">
                Vào phòng khám <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {data?.examQueue.map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-white hover:shadow-md transition-shadow gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center min-w-[50px] bg-slate-100 rounded-md p-1">
                        <span className="text-xs text-muted-foreground font-medium">Giờ hẹn</span>
                        <span className="text-sm font-bold text-slate-900">{item.time}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{item.pet}</span>
                        <span className="text-xs text-muted-foreground">({item.type})</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <User className="w-3 h-3" /> {item.customer}
                      </div>
                      <div className="text-sm text-slate-700 mt-1 font-medium">
                        Lý do: {item.reason}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    {renderStatusBadge(item.status)}
                    {item.status === 'waiting' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50" asChild>
                            <Link href="/doctor/examination">Gọi khám</Link>
                        </Button>
                    )}
                  </div>
                </div>
              ))}
              {data?.examQueue.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">Hiện không có ca chờ khám</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-emerald-500" />
                Hàng đợi Tiêm phòng
              </CardTitle>
              <CardDescription>Danh sách chờ tiêm vaccine</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
              <Link href="/doctor/vaccination">
                Vào phòng tiêm <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {data?.vaccineQueue.map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-white hover:shadow-md transition-shadow gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center min-w-[50px] bg-slate-100 rounded-md p-1">
                        <span className="text-xs text-muted-foreground font-medium">Giờ hẹn</span>
                        <span className="text-sm font-bold text-slate-900">{item.time}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{item.pet}</span>
                        <span className="text-xs text-muted-foreground">({item.type})</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <User className="w-3 h-3" /> {item.customer}
                      </div>
                      <div className="text-sm text-emerald-700 mt-1 font-medium flex items-center gap-1">
                        <Syringe className="w-3.5 h-3.5" />
                        {item.vaccine}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Đang chờ</Badge>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50" asChild>
                        <Link href="/doctor/vaccination">Gọi tiêm</Link>
                    </Button>
                  </div>
                </div>
              ))}
               {data?.vaccineQueue.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">Hiện không có ca chờ tiêm</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Lưu ý quan trọng trong ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 ml-6 list-disc text-sm text-amber-900">
            {data?.notes.map((note: string, idx: number) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}