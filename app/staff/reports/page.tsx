"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, Users, Stethoscope, Syringe, Calendar } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const revenueData = [
  { month: "T1", revenue: 85, target: 80 },
  { month: "T2", revenue: 92, target: 85 },
  { month: "T3", revenue: 78, target: 85 },
  { month: "T4", revenue: 95, target: 90 },
  { month: "T5", revenue: 88, target: 90 },
  { month: "T6", revenue: 105, target: 95 },
  { month: "T7", revenue: 112, target: 100 },
  { month: "T8", revenue: 98, target: 100 },
  { month: "T9", revenue: 108, target: 105 },
  { month: "T10", revenue: 115, target: 110 },
  { month: "T11", revenue: 125, target: 115 },
  { month: "T12", revenue: 135, target: 120 },
]

const serviceData = [
  { name: "Khám bệnh", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Tiêm phòng", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Bán sản phẩm", value: 25, color: "hsl(var(--chart-3))" },
]

const branchData = [
  { branch: "Q.1", revenue: 450 },
  { branch: "Q.7", revenue: 380 },
  { branch: "Cầu Giấy", revenue: 320 },
  { branch: "Đà Nẵng", revenue: 280 },
]

const membershipData = [
  { tier: "Cơ bản", count: 2450 },
  { tier: "Thân thiết", count: 856 },
  { tier: "VIP", count: 234 },
]

const topServices = [
  { name: "Khám tổng quát", count: 1234, revenue: 246800000 },
  { name: "Tiêm vắc-xin 5 bệnh", count: 856, revenue: 299600000 },
  { name: "Tiêm vắc-xin dại", count: 743, revenue: 111450000 },
  { name: "Khám chuyên khoa da liễu", count: 421, revenue: 126300000 },
  { name: "Xét nghiệm máu", count: 312, revenue: 93600000 },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState("month")
  const [branch, setBranch] = useState("all")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>
          <p className="text-muted-foreground">Tổng quan hoạt động kinh doanh</p>
        </div>
        <div className="flex gap-2">
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              <SelectItem value="q1">PetCareX Quận 1</SelectItem>
              <SelectItem value="q7">PetCareX Quận 7</SelectItem>
              <SelectItem value="cg">PetCareX Cầu Giấy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Doanh thu</p>
                <p className="text-2xl font-bold mt-1">1.25 tỷ</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              <span className="text-chart-2 font-medium">+12.5%</span>
              <span className="text-muted-foreground">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lượt khám</p>
                <p className="text-2xl font-bold mt-1">1,234</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-1/20 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-chart-1" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              <span className="text-chart-2 font-medium">+8.2%</span>
              <span className="text-muted-foreground">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lượt tiêm</p>
                <p className="text-2xl font-bold mt-1">856</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                <Syringe className="w-6 h-6 text-chart-2" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <span className="text-destructive font-medium">-3.1%</span>
              <span className="text-muted-foreground">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Khách mới</p>
                <p className="text-2xl font-bold mt-1">156</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-chart-4" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              <span className="text-chart-2 font-medium">+15.3%</span>
              <span className="text-muted-foreground">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <CardDescription>So sánh doanh thu thực tế và mục tiêu (triệu đồng)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Doanh thu"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    name="Mục tiêu"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố doanh thu</CardTitle>
            <CardDescription>Theo loại dịch vụ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {serviceData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>So sánh chi nhánh</CardTitle>
            <CardDescription>Doanh thu theo chi nhánh (triệu đồng)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="branch" type="category" className="text-xs" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê hội viên</CardTitle>
            <CardDescription>Phân bố theo cấp hội viên</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {membershipData.map((tier) => {
                const total = membershipData.reduce((sum, t) => sum + t.count, 0)
                const percentage = Math.round((tier.count / total) * 100)
                return (
                  <div key={tier.tier} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{tier.tier}</span>
                      <span className="text-muted-foreground">
                        {tier.count.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tổng hội viên</span>
                <span className="text-xl font-bold">
                  {membershipData.reduce((sum, t) => sum + t.count, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle>Top dịch vụ</CardTitle>
          <CardDescription>Dịch vụ có doanh thu cao nhất trong tháng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">STT</th>
                  <th className="pb-3 font-medium">Tên dịch vụ</th>
                  <th className="pb-3 font-medium text-right">Số lượt</th>
                  <th className="pb-3 font-medium text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topServices.map((service, index) => (
                  <tr key={service.name} className="border-b last:border-0">
                    <td className="py-4">
                      <Badge
                        variant={index < 3 ? "default" : "secondary"}
                        className="w-6 h-6 rounded-full p-0 justify-center"
                      >
                        {index + 1}
                      </Badge>
                    </td>
                    <td className="py-4 font-medium">{service.name}</td>
                    <td className="py-4 text-right">{service.count.toLocaleString()}</td>
                    <td className="py-4 text-right font-semibold">{(service.revenue / 1000000).toFixed(1)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
