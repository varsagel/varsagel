"use client";
import { useState, useCallback, memo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { ATTR_SCHEMAS } from '@/data/attribute-schemas';
import { ATTR_SUBSCHEMAS, BRAND_MODELS } from '@/data/attribute-overrides';

// Adım tanımları
type Step = {
  id: number;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  { id: 1, title: "Kategori Detayları", description: "Kategoriye özel bilgileri girin" },
  { id: 2, title: "Fiyatlandırma", description: "Teklif tutarınızı belirleyin" },
  { id: 3, title: "Teklif Özeti", description: "Teklifinizi gözden geçirin" },
];

// Form verileri
type FormData = { price: string; message: string };

// Hizmet türleri
const SERVICE_TYPES = [
  { value: "temizlik", label: "Temizlik Hizmeti", icon: "🧹" },
  { value: "nakliye", label: "Nakliye Hizmeti", icon: "🚛" },
  { value: "tamir", label: "Tamir & Bakım", icon: "🔧" },
  { value: "tasarim", label: "Tasarım & Dizayn", icon: "🎨" },
  { value: "egitim", label: "Eğitim & Danışmanlık", icon: "📚" },
  { value: "diger", label: "Diğer", icon: "📋" },
];

// Memoized component'ler
const StepIndicator = memo(({ currentStep }: { currentStep: number }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center relative flex-1">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
              ${currentStep >= step.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}
              ${currentStep === step.id ? 'ring-4 ring-blue-100 scale-110' : ''}
            `}>
              {step.id}
            </div>
            <div className="mt-2 text-center">
              <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">{step.description}</p>
            </div>
          </div>
          {index < STEPS.length - 1 && (
            <div className={`
              flex-1 h-1 mx-4 rounded transition-all duration-300
              ${currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  </div>
));

const DynamicAttributesStep = memo(({ schema, attrs, setAttrs, categorySlug, subcategorySlug, attrErrors }: any) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">Kategoriye Özel Bilgiler</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {schema.map((f: any) => {
        const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
        return (
        <div key={id}>
          <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}{f.required ? " *" : ""}</label>
          {f.type === 'select' ? (
            <select
              value={attrs[f.key] ?? ''}
              onChange={(e) => setAttrs((prev: any) => {
                const next: any = { ...prev, [f.key]: e.target.value };
                if (f.key === 'marka') { next['model'] = ''; }
                return next;
              })}
              className={`w-full px-3 py-2 border ${attrErrors.includes(f.label) ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={f.key === 'model' && !String(attrs['marka'] || '').trim()}
            >
              <option value="">Seçiniz</option>
              {(() => {
                const brand = String(attrs['marka'] || '').trim();
                const overrideKeyLocal = `${categorySlug}/${subcategorySlug || ''}`;
                let opts = f.options || [];
                if (f.key === 'model' && brand && BRAND_MODELS[overrideKeyLocal] && BRAND_MODELS[overrideKeyLocal][brand]) {
                  opts = BRAND_MODELS[overrideKeyLocal][brand];
                }
                return opts.map((op: string) => (
                  <option key={op} value={op}>{op}</option>
                ));
              })()}
            </select>
          ) : f.type === 'boolean' ? (
            <div className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded focus:ring-2 focus:ring-blue-500" checked={Boolean(attrs[f.key])} onChange={(e)=> setAttrs((prev: any) => ({ ...prev, [f.key]: e.target.checked }))} />
              <span className="text-sm text-gray-700">Evet</span>
            </div>
          ) : f.type === 'range-number' ? (
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={attrs[f.minKey!] ?? ''} onChange={(e)=> setAttrs((prev: any) => ({ ...prev, [f.minKey!]: Number(e.target.value || 0) }))} placeholder="Min" className={`w-full px-3 py-2 border ${attrErrors.includes(f.label) ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
              <input type="number" value={attrs[f.maxKey!] ?? ''} onChange={(e)=> setAttrs((prev: any) => ({ ...prev, [f.maxKey!]: Number(e.target.value || 0) }))} placeholder="Max" className={`w-full px-3 py-2 border ${attrErrors.includes(f.label) ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
            </div>
          ) : f.type === 'multiselect' ? (
            <select
              multiple
              value={String(attrs[f.key!] ?? '').split(',').filter(Boolean)}
              onChange={(e)=> {
                const selected = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o=> o.value)
                setAttrs((prev: any) => ({ ...prev, [f.key!]: selected.join(',') }))
              }}
              className={`w-full px-3 py-2 border ${attrErrors.includes(f.label) ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {(f.options || []).map((op: string) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          ) : (
            <input
              type={f.type}
              value={attrs[f.key] ?? ''}
              onChange={(e) => setAttrs((prev: any) => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value || 0) : e.target.value }))}
              className={`w-full px-3 py-2 border ${attrErrors.includes(f.label) ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          )}
        </div>
      );})}
    </div>
  </div>
));

const ServiceDetailsStep = memo(({ schema, attrs, setAttrs, categorySlug, subcategorySlug, attrErrors }: any) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Seçim</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {SERVICE_TYPES.map(st => (
          <button
            key={st.value}
            type="button"
            onClick={() => setAttrs((prev: any) => ({ ...prev, serviceType: st.value }))}
            className={`px-3 py-1 text-xs rounded-full ${attrs.serviceType === st.value ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <span className="mr-1">{st.icon}</span>{st.label}
          </button>
        ))}
      </div>
      {schema && schema.length > 0 && (
        <DynamicAttributesStep schema={schema} attrs={attrs} setAttrs={setAttrs} categorySlug={categorySlug} subcategorySlug={subcategorySlug} attrErrors={attrErrors} />
      )}
    </div>
  </div>
));

const PricingStep = memo(({ formData, errors, updateFormData, listingPrice }: any) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Fiyatlandırma Önerisi</h3>
      <p className="text-sm text-gray-600 mb-4">Piyasa analizine göre önerilen fiyat aralığı</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-blue-600">
            {typeof listingPrice === 'number' ? `${Math.max(1, Math.floor(listingPrice * 0.9)).toLocaleString('tr-TR')} - ${Math.floor(listingPrice * 1.1).toLocaleString('tr-TR')} TL` : '2.500 - 4.000 TL'}
          </p>
          <p className="text-sm text-gray-500">Benzer hizmetler için ortalama</p>
        </div>
        <div className="text-4xl">💡</div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teklif Tutarı (TL) *
        </label>
        {errors.price && <p className="text-red-500 text-sm mb-2">{errors.price}</p>}
        <div className="relative">
          <input
            key="price-input"
            type="number"
            value={formData.price}
            onChange={(e) => updateFormData('price', e.target.value)}
            placeholder="2500"
            className={`
              w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
              ${errors.price ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">₺</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hızlı Tutar Seçimi</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => typeof listingPrice === 'number' && updateFormData('price', String(Math.max(1, Math.floor(listingPrice * 0.95))))}
            className="px-3 py-2 text-xs rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
          >
            −%5
          </button>
          <button
            type="button"
            onClick={() => typeof listingPrice === 'number' && updateFormData('price', String(Math.floor(listingPrice)))}
            className="px-3 py-2 text-xs rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
          >
            Liste Fiyatı
          </button>
          <button
            type="button"
            onClick={() => typeof listingPrice === 'number' && updateFormData('price', String(Math.floor(listingPrice * 1.05)))}
            className="px-3 py-2 text-xs rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
          >
            +%5
          </button>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex">
        <div className="text-yellow-400 text-xl mr-3">⚠️</div>
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Fiyatlandırma İpuçları</h3>
          <ul className="mt-2 text-sm text-yellow-700 space-y-1">
            <li>• Malzeme maliyetlerini hesaba katın</li>
            <li>• Ulaşım ve ek giderleri ekleyin</li>
            <li>• Piyasa fiyatlarını araştırın</li>
            <li>• Rekabetçi ama kârlı olun</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
));

 

const ReviewStep = memo(({ formData, attrs, updateFormData, errors }: { formData: FormData, attrs: any, updateFormData: (field: keyof FormData, value: any) => void, errors: Partial<Record<keyof FormData, string>> }) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Özeti</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Teklif Tutarı:</span>
          <span className="font-bold text-green-600 text-xl">{formData.price ? `₺${formData.price}` : 'Belirtilmemiş'}</span>
        </div>
        {attrs && Object.keys(attrs).length > 0 && (
          <div>
            <span className="text-gray-600">Seçilen Özellikler:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(attrs).map(([k, v]: any) => {
                const s = String(v);
                const parts = s.split(',').map(p => p.trim()).filter(Boolean);
                return parts.length ? parts.map(p => (
                  <span key={`${k}-${p}`} className="text-gray-700 text-xs bg-gray-100 px-2 py-1 rounded">{p}</span>
                )) : (
                  <span key={`${k}-single`} className="text-gray-700 text-xs bg-gray-100 px-2 py-1 rounded">{s}</span>
                );
              })}
            </div>
          </div>
        )}
        <div>
          <span className="text-gray-600">Mesajınız:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Profesyonel hizmet", "Garanti", "Hızlı teslim", "Uygun fiyat", "Müşteri memnuniyeti"].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => updateFormData('message', `${formData.message ? formData.message + ' ' : ''}${t}`.trim())}
                className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {t}
              </button>
            ))}
          </div>
          {errors.message && <p className="text-red-500 text-sm mt-2">{errors.message}</p>}
          <textarea
            value={formData.message}
            onChange={(e) => updateFormData('message', e.target.value)}
            rows={4}
            placeholder="Teklif mesajınızı yazın..."
            className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
          />
          <div className="text-xs text-gray-500 mt-1">{formData.message.length} karakter</div>
        </div>
      </div>
    </div>
  </div>
));

export default function TeklifVerPage() {
  const router = useRouter();
  const params = useParams();
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ price: "", message: "" });
  const [listing, setListing] = useState<any>(null);
  const [categorySchema, setCategorySchema] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any>({});

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [attrErrors, setAttrErrors] = useState<string[]>([]);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      const missing: string[] = [];
      categorySchema.forEach((f: any) => {
        if (!f.required) return;
        if (f.type === 'range-number') {
          const hasMin = attributes[f.minKey!] !== undefined && attributes[f.minKey!] !== '';
          const hasMax = attributes[f.maxKey!] !== undefined && attributes[f.maxKey!] !== '';
          if (!hasMin && !hasMax) missing.push(f.label);
        } else if (f.key) {
          const v = attributes[f.key];
          if (v === undefined || v === '') missing.push(f.label);
        }
      });
      if (missing.length > 0) {
        setSubmitError(`Eksik alanlar: ${missing.join(', ')}`);
        setAttrErrors(missing);
        return false;
      } else {
        setAttrErrors([]);
      }
    }

    if (step === 2) {
      if (!formData.price) newErrors.price = 'Fiyat belirtmelisiniz';
      if (parseInt(formData.price) < 1) newErrors.price = 'Geçerli bir fiyat giriniz';
    }

    if (step === 3) {
      const fallbackMessage = (Object.entries(attributes).map(([k,v]) => `${k}: ${v}`).join(', ') || 'Teklif');
      const effectiveMessage = (formData.message || fallbackMessage).trim();
      if (effectiveMessage.length < 20) {
        newErrors.message = 'Mesaj en az 20 karakter olmalı';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, categorySchema, attributes]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Hata temizleme
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep) && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [validateStep, currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateStep(currentStep)) return;
    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");
      const res = await fetch('/api/teklif-ver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: params?.id,
          price: formData.price,
          message: formData.message || (Object.entries(attributes).map(([k,v]) => `${k}: ${v}`).join(', ') || 'Teklif'),
          attributes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Başarılı!', description: 'Teklifiniz gönderildi', variant: 'default' });
        setSubmitSuccess('Teklifiniz başarıyla gönderildi');
        setTimeout(() => { router.push(`/ilan/${params?.id}`); }, 1500);
      } else {
        const msg = data?.error || 'Teklif gönderilemedi';
        setSubmitError(msg);
        toast({ title: 'Hata', description: msg, variant: 'destructive' });
      }
    } catch {
      const msg = 'Teklif gönderilirken hata oluştu';
      setSubmitError(msg);
      toast({ title: 'Hata', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, params?.id, currentStep, validateStep, router, attributes, isSubmitting]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/listing?id=${params?.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          setListing(data);
          const catSlug = data?.category?.slug || '';
          const subSlug = data?.subCategory?.slug || '';
          const base = (ATTR_SCHEMAS[catSlug] || []);
          const override = (ATTR_SUBSCHEMAS[`${catSlug}/${subSlug}`] || []);
          const map = new Map<string, any>();
          [...base, ...override].forEach((f: any) => {
            const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
            map.set(id, f);
          });
          const schema = Array.from(map.values());
          setCategorySchema(schema);
          if (!formData.price && typeof data.price === 'number') {
            setFormData(prev => ({ ...prev, price: String(Math.max(1, Math.floor(data.price * 0.9))) }));
          }
          
        }
      } catch {}
    })();
    return () => { active = false; };
  }, [params?.id]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ServiceDetailsStep schema={categorySchema} attrs={attributes} setAttrs={setAttributes} categorySlug={listing?.category?.slug} subcategorySlug={listing?.subCategory?.slug} attrErrors={attrErrors} />;
      case 2:
        return <PricingStep formData={formData} errors={errors} updateFormData={updateFormData} listingPrice={listing?.price ?? null} />;
      case 3:
        return <ReviewStep formData={formData} attrs={attributes} updateFormData={updateFormData} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Ana Sayfa
          </Link>
          <div className="text-sm text-gray-500">
            İlan #{params?.id}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teklif Ver</h1>
          <p className="text-lg text-gray-600">
            Profesyonel teklifinizi oluşturun, müşterinin ilgisini çekin
          </p>
        </div>

        {listing && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{listing.title}</h2>
                <p className="text-gray-600 text-sm">{listing.location?.city}{listing.location?.district ? `, ${listing.location?.district}` : ''}</p>
              </div>
              {typeof listing.price === 'number' && (
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg text-lg font-semibold shadow-md">
                  ₺{listing.price.toLocaleString('tr-TR')}
                </span>
              )}
            </div>
            {listing.attributes && Object.keys(listing.attributes).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(listing.attributes).map(([k, v]: any) => {
                  const s = String(v);
                  const parts = s.split(',').map(p => p.trim()).filter(Boolean);
                  return parts.length ? parts.slice(0,4).map(p => (
                    <span key={`${k}-${p}`} className="text-gray-700 text-xs bg-gray-100 px-2 py-1 rounded">{p}</span>
                  )) : null;
                })}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {submitError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
              {submitSuccess}
            </div>
          )}
          {attrErrors.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-red-600 mb-2">Eksik alanlar:</div>
              <div className="flex flex-wrap gap-2">
                {attrErrors.map((n) => (
                  <span key={n} className="text-red-700 text-xs bg-red-50 border border-red-200 px-2 py-1 rounded">{n}</span>
                ))}
              </div>
            </div>
          )}
          <StepIndicator currentStep={currentStep} />

          <form onSubmit={handleSubmit} className="mt-8">
            {renderStep()}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all duration-200
                  ${currentStep === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:transform hover:scale-105'
                  }
                `}
              >
                Geri
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Devam Et
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-green-700 hover:to-emerald-700 hover:transform hover:scale-105 hover:shadow-xl'}`}
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Teklifi Gönder'}
                </button>
              )}
            </div>
          </form>
          {formData.price && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Offer',
                  priceCurrency: 'TRY',
                  price: String(formData.price),
                  itemOffered: listing?.id ? { '@type': 'Product', name: listing?.title, url: `${origin}/ilan/${listing.id}` } : undefined,
                }),
              }}
            />
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Ücretsiz teklif verin • Komisyon yok • Doğrudan müşteri ile iletişim
          </p>
        </div>
      </div>
    </div>
  );
}
