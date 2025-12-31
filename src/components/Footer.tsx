import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold shadow-[0_0_15px_-3px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.7)] transition-all duration-300">
                V
              </div>
              <span className="text-2xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                Varsagel
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Alım taleplerini yayınla, satıcılardan teklifleri topla. 
              <br />
              Güvenilir, hızlı ve yapay zeka destekli platform.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/profile.php?id=100077108139724" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://x.com/varsagelcom" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/varsagel.com.offical/" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-500/20 hover:text-pink-500 border border-slate-700 hover:border-pink-500/50 transition-all duration-300" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-6">Hızlı Bağlantılar</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-cyan-400 hover:pl-1 transition-all duration-200">Ana Sayfa</Link>
              </li>
              <li>
                <Link href="/talep-olustur" prefetch={false} className="text-slate-400 hover:text-cyan-400 hover:pl-1 transition-all duration-200">Talep Oluştur</Link>
              </li>
              <li>
                <Link href="/#kategoriler" className="text-slate-400 hover:text-cyan-400 hover:pl-1 transition-all duration-200">Kategoriler</Link>
              </li>
              <li>
                <Link href="/giris" className="text-slate-400 hover:text-cyan-400 hover:pl-1 transition-all duration-200">Giriş Yap</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-6">Destek & Yardım</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-slate-400 hover:text-cyan-400 hover:pl-1 transition-all duration-200">Nasıl Çalışır?</a>
              </li>
              <li>
                <Link href="/sss" className="text-slate-400 hover:text-cyan-400 hover:pl-1 transition-all duration-200">Sıkça Sorulan Sorular</Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-cyan-400 hover:pl-1 transition-all duration-200">Güvenlik İpuçları</a>
              </li>
              <li>
                <Link href="/iletisim" className="text-slate-400 hover:text-cyan-400 hover:pl-1 transition-all duration-200">İletişim</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-6">İletişim</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-slate-400 group">
                <div className="p-2 bg-slate-800 rounded-lg text-cyan-500 group-hover:bg-slate-700 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="mt-1">İstanbul, Türkiye</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 group">
                <div className="p-2 bg-slate-800 rounded-lg text-cyan-500 group-hover:bg-slate-700 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+90 (850) 123 45 67</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 group">
                <div className="p-2 bg-slate-800 rounded-lg text-cyan-500 group-hover:bg-slate-700 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span>info@varsagel.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            &copy; {new Date().getFullYear()} Varsagel. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/kurumsal/gizlilik-politikasi" className="hover:text-slate-300 transition-colors">Gizlilik Politikası</Link>
            <Link href="/kurumsal/kullanim-kosullari" className="hover:text-slate-300 transition-colors">Kullanım Koşulları</Link>
            <Link href="/kurumsal/kvkk" className="hover:text-slate-300 transition-colors">KVKK</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
