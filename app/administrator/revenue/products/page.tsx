"use client"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const productData = [
  { name: 'Thức ăn hạt', value: 120, color: '#f59e0b' },
  { name: 'Thuốc trị ký sinh', value: 95, color: '#ef4444' },
  { name: 'Đồ chơi & Phụ kiện', value: 45, color: '#10b981' },
  { name: 'Sữa tắm & Vệ sinh', value: 68, color: '#3b82f6' },
]

export default function ProductRevenuePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Thống kê doanh số Sản phẩm</h1>
      <Card>
        <CardHeader><CardTitle>Doanh thu theo nhóm hàng (Triệu đồng)</CardTitle></CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {productData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}