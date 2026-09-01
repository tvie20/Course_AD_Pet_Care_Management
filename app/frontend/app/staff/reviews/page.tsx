"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquare, Search, Filter, Send, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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

export default function StaffReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [replyText, setReplyText] = useState<Record<string, string>>({}) 

  // --- API HELPER ---
  const getAuthHeader = () => {
    const token = localStorage.getItem("staffAccessToken")
    const userStr = localStorage.getItem("staffUser")
    if (!token || !userStr) return null
    const user = JSON.parse(userStr)
    return {
      "Content-Type": "application/json",
      "authorization": token,
      "x-client-id": user.MaNV
    }
  }

  const fetchReviews = async () => {
    setLoading(true)
    const headers = getAuthHeader()
    if (!headers) return

    try {
        const queryParams = new URLSearchParams({
            search: search,
            filter: activeTab,
            page: "1", // Simple pagination for now
            limit: "20"
        })

        const res = await fetch(`http://localhost:3055/api/staff/reviews?${queryParams.toString()}`, { headers })
        
        if (res.ok) {
            const data = await res.json()
            setReviews(data.metadata.list)
        }
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
  }

  // Handle Reply Submit
  const handleReplySubmit = async (invoiceId: string) => {
    if (!replyText[invoiceId]) return;

    const headers = getAuthHeader()
    if (!headers) return

    try {
        const res = await fetch("http://localhost:3055/api/staff/reviews/reply", {
            method: "POST",
            headers,
            body: JSON.stringify({ invoiceId, content: replyText[invoiceId] })
        })

        if (res.ok) {
            alert("Đã gửi phản hồi thành công!")
            // Optimistic update
            setReviews(prev => prev.map(r => {
                if (r.id === invoiceId) {
                    return {
                        ...r,
                        status: "replied",
                        reply: {
                            content: replyText[invoiceId],
                            date: new Date().toLocaleDateString("vi-VN"),
                            staffName: "Bạn (Vừa xong)"
                        }
                    }
                }
                return r
            }))
            // Clear input
            setReplyText(prev => {
                const newState = { ...prev }
                delete newState[invoiceId]
                return newState
            })
        } else {
            alert("Lỗi khi gửi phản hồi")
        }
    } catch (error) {
        console.error(error)
        alert("Lỗi kết nối")
    }
  }

  useEffect(() => {
      const timer = setTimeout(() => {
          fetchReviews()
      }, 500)
      return () => clearTimeout(timer)
  }, [search, activeTab])

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý đánh giá</h1>
          <p className="text-muted-foreground">Theo dõi và phản hồi ý kiến khách hàng.</p>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-white border">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700">
                Chưa trả lời
            </TabsTrigger>
            <TabsTrigger value="replied" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                Đã trả lời
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Tìm theo tên KH, mã HĐ..." 
                className="pl-8 bg-white" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="bg-white">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
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
                            <span className="font-mono">{review.invoiceId}</span>
                            <span>•</span>
                            <span>{review.date}</span>
                            <span>•</span>
                            <span className="font-medium text-foreground">{review.service}</span>
                        </div>
                    </div>
                </div>
                
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

                    <div className="flex-1 p-4 bg-white">
                        <div className="mb-6">
                            <p className="text-sm italic text-foreground bg-slate-50 p-3 rounded-lg border">
                                "{review.comment}"
                            </p>
                        </div>

                        {review.status === 'replied' && review.reply ? (
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
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                    <MessageSquare className="w-4 h-4" />
                                    Phản hồi của cửa hàng
                                </div>
                                <Textarea 
                                    placeholder="Nhập nội dung cảm ơn hoặc giải trình..." 
                                    className="min-h-20 text-sm resize-none focus-visible:ring-primary"
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