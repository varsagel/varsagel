import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all duration-300">
                V
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-cyan-600 transition-colors">
                Varsagel
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Alım taleplerini yayınla, satıcılardan teklifleri topla. 
              <br />
              Güvenilir, hızlı ve modern aracı platformu.
            </p>
            <div className="flex items-center gap-4">
              <Link href="https://www.facebook.com/profile.php?id=100077108139724" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-cyan-50 hover:text-cyan-600 transition-all duration-300" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="https://x.com/varsagelcom" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-cyan-50 hover:text-cyan-400 transition-all duration-300" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="https://www.instagram.com/varsagel.com.offical/" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-pink-50 hover:text-pink-600 transition-all duration-300" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="https://www.linkedin.com" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-300" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6">Hızlı Bağlantılar</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-cyan-600 hover:pl-1 transition-all duration-200">Ana Sayfa</Link>
              </li>
              <li>
                <Link href="/talep-olustur" className="text-gray-500 hover:text-cyan-600 hover:pl-1 transition-all duration-200">Talep Oluştur</Link>
              </li>
              <li>
                <Link href="/#kategoriler" className="text-gray-500 hover:text-cyan-600 hover:pl-1 transition-all duration-200">Kategoriler</Link>
              </li>
              <li>
                <Link href="/giris" className="text-gray-500 hover:text-cyan-600 hover:pl-1 transition-all duration-200">Giriş Yap</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6">Destek & Yardım</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-gray-500 hover:text-cyan-600 hover:pl-1 transition-all duration-200">Nasıl Çalışır?</Link>
              </li>
              <li>
                <Link href="/sss" className="text-gray-500 hover:text-cyan-600 hover:pl-1 transition-all duration-200">Sıkça Sorulan Sorular</Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-cyan-600 hover:pl-1 transition-all duration-200">Güvenlik İpuçları</Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-gray-500 hover:text-cyan-600 hover:pl-1 transition-all duration-200">İletişim</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6">İletişim</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-gray-500 group">
                <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600 group-hover:bg-cyan-100 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="mt-1">İstanbul, Türkiye</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 group">
                <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600 group-hover:bg-cyan-100 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+90 (850) 123 45 67</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 group">
                <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600 group-hover:bg-cyan-100 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span>info@varsagel.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 flex items-center gap-1">
            Â© {new Date().getFullYear()} Varsagel. 
            <span className="hidden sm:inline">Sevgiyle geliştirildi</span>
            <Heart className="w-3 h-3 text-red-400 inline mx-0.5" />
            <span className="hidden sm:inline">kullanıcılarımız için.</span>
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/kurumsal/gizlilik-politikasi" className="hover:text-gray-600 transition-colors">Gizlilik Politikası</Link>
            <Link href="/kurumsal/kullanim-kosullari" className="hover:text-gray-600 transition-colors">Kullanım Koşulları</Link>
            <Link href="/kurumsal/kvkk" className="hover:text-gray-600 transition-colors">KVKK</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
