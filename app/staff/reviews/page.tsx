"use client"

import { useState } from "react"
import { 
  Star, 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// --- CẤU HÌNH MAPPING DỮ LIỆU (Giống bên Customer) ---
const staffAttitudeMap: Record<number, string> = {
  1: "Rất tệ", 2: "Tệ", 3: "Bình thường", 4: "Tốt", 5: "Rất tốt"
}
const overallSatisfactionMap: Record<number, string> = {
  1: "Rất không hài lòng", 2: "Không hài lòng", 3: "Bình thường", 4: "Hài lòng", 5: "Rất hài lòng"
}
const getRatingColor = (score: number) => {
  if (score >= 4) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (score === 3) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-red-100 text-red-700 border-red-200";
}

// Dữ liệu giả lập
const initialReviews = [
  {
    id: 1,
    customer: { name: "Nguyễn Văn A", avatar: "/user-1.jpg" },
    pet: "Mochi",
    invoiceId: "HD-2025-001234",
    service: "Spa - Cắt tỉa lông",
    date: "15/12/2025",
    ratings: { quality: 5, staff: 5, overall: 5 },
    comment: "Bé Mochi rất thích, cắt đẹp và thơm. Nhân viên nhiệt tình.",
    status: "replied",
    reply: {
      content: "Dạ PetCareX cảm ơn bạn đã tin tưởng ạ! Hẹn gặp lại bé Mochi nhé 🥰",
      date: "16/12/2025",
      staffName: "Admin"
    }
  },
  {
    id: 2,
    customer: { name: "Trần Thị B", avatar: "/user-2.jpg" },
    pet: "Luna",
    invoiceId: "HD-2025-001198",
    service: "Tiêm phòng",
    date: "14/12/2025",
    ratings: { quality: 5, staff: 3, overall: 4 },
    comment: "Bác sĩ tiêm nhanh, nhưng lễ tân làm thủ tục hơi lâu.",
    status: "pending",
    reply: null
  },
  {
    id: 3,
    customer: { name: "Lê Văn C", avatar: "/user-3.jpg" },
    pet: "Buddy",
    invoiceId: "HD-2025-001156",
    service: "Khám da liễu",
    date: "10/12/2025",
    ratings: { quality: 2, staff: 2, overall: 2 },
    comment: "Chờ đợi quá lâu, không hài lòng về cách phục vụ.",
    status: "pending",
    reply: null
  }
]

export default function StaffReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews)
  const [activeTab, setActiveTab] = useState("all")
  const [replyText, setReplyText] = useState<Record<number, string>>({}) // Lưu text reply cho từng review đang soạn

  // Xử lý gửi phản hồi
  const handleReplySubmit = (id: number) => {
    if (!replyText[id]) return;

    const updatedReviews = reviews.map(review => {
      if (review.id === id) {
        return {
          ...review,
          status: "replied",
          reply: {
            content: replyText[id],
            date: new Date().toLocaleDateString("vi-VN"),
            staffName: "Bạn (Vừa xong)"
          }
        }
      }
      return review
    })

    setReviews(updatedReviews)
    // Clear text input
    setReplyText(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
    })
  }

  // Lọc review
  const filteredReviews = reviews.filter(review => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return review.status === "pending"
    if (activeTab === "replied") return review.status === "replied"
    return true
  })

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý đánh giá</h1>
          <p className="text-muted-foreground">Theo dõi và phản hồi ý kiến khách hàng.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-white p-2 rounded-lg border shadow-sm flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                 <span className="font-medium">{reviews.filter(r => r.status === 'pending').length}</span> Chờ trả lời
              </div>
              <Separator orientation="vertical" className="h-4"/>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                 <span className="font-medium">4.5/5</span> Trung bình
              </div>
           </div>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-white border">
            <TabsTrigger value="all">Tất cả ({reviews.length})</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700">
                Chưa trả lời ({reviews.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="replied" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                Đã trả lời
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm theo tên KH, mã HĐ..." className="pl-8 bg-white" />
          </div>
          <Button variant="outline" size="icon" className="bg-white">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewItem 
                key={review.id} 
                review={review} 
                replyText={replyText[review.id] || ""}
                setReplyText={(text) => setReplyText(prev => ({...prev, [review.id]: text}))}
                onSubmitReply={() => handleReplySubmit(review.id)}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
             <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
             <p className="text-muted-foreground">Không tìm thấy đánh giá nào.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Sub-component: Từng Item đánh giá
function ReviewItem({ 
    review, 
    replyText, 
    setReplyText, 
    onSubmitReply 
}: { 
    review: any, 
    replyText: string, 
    setReplyText: (t: string) => void,
    onSubmitReply: () => void 
}) {
    // Helpers hiển thị điểm
    const StarRow = ({ score }: { score: number }) => (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < score ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
            ))}
        </div>
    )

    return (
        <Card className={`overflow-hidden transition-all ${review.status === 'pending' ? 'border-l-4 border-l-yellow-400 shadow-md' : 'border-l-4 border-l-transparent opacity-90 hover:opacity-100'}`}>
            <CardHeader className="p-4 pb-2 bg-slate-50/50 border-b flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border">
                        <AvatarImage src={review.customer.avatar} />
                        <AvatarFallback>{review.customer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">{review.customer.name}</h3>
                            <Badge variant="outline" className="text-xs font-normal bg-white">
                                {review.pet}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{review.invoiceId}</span>
                            <span>•</span>
                            <span>{review.date}</span>
                            <span>•</span>
                            <span className="font-medium text-foreground">{review.service}</span>
                        </div>
                    </div>
                </div>
                
                {/* Badge trạng thái */}
                {review.status === 'pending' ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                        <Clock className="w-3 h-3 mr-1" /> Chờ trả lời
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Đã trả lời
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    {/* Cột trái: Điểm số */}
                    <div className="md:w-64 p-4 border-b md:border-b-0 md:border-r bg-white space-y-3 shrink-0">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Chất lượng</span>
                            <StarRow score={review.ratings.quality} />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Nhân viên</span>
                            <Badge variant="outline" className={cn("font-normal text-xs px-1.5", getRatingColor(review.ratings.staff))}>
                                {staffAttitudeMap[review.ratings.staff]}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
                            <span>Tổng thể</span>
                            <Badge variant="outline" className={cn("px-2", getRatingColor(review.ratings.overall))}>
                                {overallSatisfactionMap[review.ratings.overall]}
                            </Badge>
                        </div>
                    </div>

                    {/* Cột phải: Nội dung & Phản hồi */}
                    <div className="flex-1 p-4 bg-white">
                        {/* Comment của khách */}
                        <div className="mb-6">
                            <p className="text-sm italic text-foreground bg-slate-50 p-3 rounded-lg border">
                                "{review.comment}"
                            </p>
                        </div>

                        {/* Khu vực trả lời */}
                        {review.status === 'replied' && review.reply ? (
                             // Đã trả lời
                            <div className="pl-4 border-l-2 border-emerald-500">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-emerald-700">
                                        {review.reply.staffName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        • {review.reply.date}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {review.reply.content}
                                </p>
                            </div>
                        ) : (
                            // Chưa trả lời: Form nhập
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                    <MessageSquare className="w-4 h-4" />
                                    Phản hồi của cửa hàng
                                </div>
                                <Textarea 
                                    placeholder="Nhập nội dung cảm ơn hoặc giải trình..." 
                                    className="min-h-[80px] text-sm resize-none focus-visible:ring-primary"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm">Hủy bỏ</Button>
                                    <Button 
                                        size="sm" 
                                        className="gap-2 bg-primary hover:bg-primary/90"
                                        onClick={onSubmitReply}
                                        disabled={!replyText.trim()}
                                    >
                                        <Send className="w-3.5 h-3.5" /> Gửi phản hồi
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}