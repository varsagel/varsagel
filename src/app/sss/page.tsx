'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Varsagel nedir?",
    answer: "Varsagel, alıcıların ihtiyaç duydukları ürün veya hizmetler için talep oluşturduğu, satıcıların ise bu taleplere teklif verdiği bir 'tersine pazar yeri' platformudur. Normal alışveriş sitelerinin aksine, burada alıcı ne istediğini söyler, satıcılar ona ulaşır."
  },
  {
    question: "Talep oluşturmak ücretli mi?",
    answer: "Hayır, Varsagel'de alım talebi oluşturmak bireysel kullanıcılar için tamamen ücretsizdir. İhtiyacınız olan ürünü veya hizmeti tanımlayıp hemen talep açabilirsiniz."
  },
  {
    question: "Nasıl teklif verebilirim?",
    answer: "İlgilendiğiniz bir talebin detay sayfasına giderek 'Teklif Ver' butonuna tıklayabilir, fiyat ve açıklamanızı girerek teklifinizi sunabilirsiniz. Teklifleriniz alıcı tarafından değerlendirilir."
  },
  {
    question: "Satıcılar güvenilir mi?",
    answer: "Platformumuzdaki satıcılar belirli doğrulama süreçlerinden geçerler. Ayrıca kullanıcı yorumları ve puanlama sistemi sayesinde satıcıların geçmiş performanslarını görebilirsiniz."
  },
  {
    question: "Hangi kategorilerde talep oluşturabilirim?",
    answer: "Emlak, Vasıta, Elektronik, Ev Eşyası ve Hizmetler başta olmak üzere birçok kategoride alım talebi oluşturabilirsiniz."
  },
  {
    question: "Teklifimi nasıl iptal edebilirim?",
    answer: "Profilim sayfasından verdiğiniz teklifleri görüntüleyebilir ve henüz onaylanmamış tekliflerinizi geri çekebilirsiniz."
  }
];

export default function SSSPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="bg-cyan-600 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Sıkça Sorulan Sorular</h1>
          <p className="text-cyan-100 text-lg max-w-2xl mx-auto">
            Aklınıza takılan soruların cevaplarını burada bulabilirsiniz.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 last:border-0">
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-gray-900 flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-cyan-600" />
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 pl-14 text-gray-600 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

