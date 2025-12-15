import React from 'react';
import SozlesmeLayout from '@/components/layout/SozlesmeLayout';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <SozlesmeLayout title="Kullanım Koşulları" icon={FileText}>
      <h2>1. Taraflar</h2>
      <p>
        İşbu Kullanım Koşulları ("Sözleşme"), Varsagel ("Platform") ile Platform'a üye olan kullanıcı ("Üye") arasında akdedilmiştir.
      </p>

      <h2>2. Konu</h2>
      <p>
        İşbu Sözleşme'nin konusu, Üye'nin Platform'dan faydalanma şartlarının belirlenmesidir. Platform, alıcıların talep oluşturduğu ve satıcıların teklif sunduğu bir pazar yeri modelidir.
      </p>

      <h2>3. Üyelik Şartları</h2>
      <p>
        Üye olmak isteyen kişinin 18 yaşını doldurmuş olması ve işbu Sözleşme'yi kabul etmesi gerekmektedir. Üye, kayıt sırasında verdiği bilgilerin doğruluğunu taahhüt eder.
      </p>

      <h2>4. Hak ve Yükümlülükler</h2>
      <ul>
        <li><strong>Üye'nin Yükümlülükleri:</strong> Üye, Platform'u hukuka ve ahlaka uygun kullanacağını, üçüncü kişilerin haklarını ihlal etmeyeceğini kabul eder.</li>
        <li><strong>Platform'un Hakları:</strong> Varsagel, herhangi bir gerekçe göstermeksizin üyeliği askıya alma veya sonlandırma hakkını saklı tutar.</li>
      </ul>

      <h2>5. Talep ve Teklif Kuralları</h2>
      <p>
        Üyeler, oluşturdukları taleplerin ve sundukları tekliflerin gerçek, doğru ve yanıltıcı olmadığını kabul ederler. Yasaklı ürünlerin veya hizmetlerin talebi oluşturulamaz.
      </p>

      <h2>6. Fikri Mülkiyet</h2>
      <p>
        Platform'un tasarımı, yazılımı, veritabanı ve diğer tüm içerikleri Varsagel'in mülkiyetindedir ve izinsiz kopyalanamaz.
      </p>

      <h2>7. Sorumluluk Reddi</h2>
      <p>
        Varsagel, Üyeler arasındaki işlemlerden doğacak uyuşmazlıklardan sorumlu değildir. Platform sadece bir aracı hizmet sağlayıcıdır.
      </p>

      <h2>8. Yürürlük</h2>
      <p>
        İşbu Sözleşme, Üye'nin elektronik ortamda kabulü ile yürürlüğe girer.
      </p>

      <p className="text-sm text-gray-500 mt-8">
        Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
      </p>
    </SozlesmeLayout>
  );
}
