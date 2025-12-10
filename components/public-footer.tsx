import Link from "next/link"
import { PawPrint, Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react"

export function PublicFooter() {
  return (
    <footer id="contact" className="bg-foreground text-background py-16">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
                <PawPrint className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PetCareX</span>
            </Link>
            <p className="text-sm opacity-70 leading-relaxed">
              Hệ thống trung tâm chăm sóc thú cưng hàng đầu Việt Nam với 10 chi nhánh trên toàn quốc.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Khám bệnh thú cưng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Tiêm phòng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Sản phẩm thú cưng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Tư vấn dinh dưỡng
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Hướng dẫn đặt lịch
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Chính sách hội viên
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm opacity-70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Hotline: 1900 1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@petcarex.vn</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/20 mt-12 pt-8 text-center text-sm opacity-60">
          <p>© 2025 PetCareX. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
