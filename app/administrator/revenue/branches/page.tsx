"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MapPin, TrendingUp } from "lucide-react"

const branchStats = {
  "q1": { name: "Quận 1", revenue: 550, growth: "+15%", data: [{day: 'T2', v: 40}, {day: 'T3', v: 55}, {day: 'T4', v: 48}] },
  "q7": { name: "Quận 7", revenue: 380, growth: "+8%", data: [{day: 'T2', v: 30}, {day: 'T3', v: 35}, {day: 'T4', v: 32}] },
  "bt": { name: "Bình Thạnh", revenue: 310, growth: "+12%", data: [{day: 'T2', v: 25}, {day: 'T3', v: 28}, {day: 'T4', v: 40}] },
}

export default function BranchRevenuePage() {
  const [selected, setSelected] = useState("q1")
  const currentBranch = branchStats[selected as keyof typeof branchStats]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Doanh thu theo Chi nhánh</h1>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Chọn chi nhánh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="q1">PetCareX Quận 1</SelectItem>
            <SelectItem value="q7">PetCareX Quận 7</SelectItem>
            <SelectItem value="bt">PetCareX Bình Thạnh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 text-sm">Doanh thu {currentBranch.name}</p>
                <h2 className="text-3xl font-bold mt-2">{currentBranch.revenue}.000.000đ</h2>
              </div>
              <MapPin className="opacity-20 w-12 h-12" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100 text-sm">Tăng trưởng tháng</p>
                <h2 className="text-3xl font-bold mt-2">{currentBranch.growth}</h2>
              </div>
              <TrendingUp className="opacity-20 w-12 h-12" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Biểu đồ doanh thu 3 ngày gần nhất</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentBranch.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="v" fill="#6366f1" radius={[4, 4, 0, 0]} name="Doanh thu (triệu)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}