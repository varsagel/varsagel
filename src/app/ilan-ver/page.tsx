"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useMemo, useState, useCallback, memo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES as STATIC_CATEGORIES } from "@/data/categories";
import { TURKEY_PROVINCES, getProvinceByName, getDistrictsByProvince } from "@/data/turkey-locations";
import { toast } from "@/components/ui/use-toast";

// Adım tanımları
type Step = {
  id: number;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  { id: 1, title: "Kategori Seç", description: "İhtiyacınızın kategorisini belirleyin" },
  { id: 2, title: "Detaylar", description: "İlan detaylarını girin" },
  { id: 3, title: "Konum & Bütçe", description: "Konum ve bütçe bilgileri" },
  { id: 4, title: "Onay", description: "İlanınızı gözden geçirin" },
];

// Form verileri
type FormData = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  city: string;
  district: string;
  minBudget: string;
  budget: string;
  images: File[];
  attributes: Record<string, any>;
};

// Memoized component'ler
const StepIndicator = memo(({ currentStep }: { currentStep: number }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center relative flex-1">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
              ${currentStep === step.id ? 'ring-4 ring-blue-100' : ''}
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
              flex-1 h-1 mx-4 rounded
              ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  </div>
));

const CategorySelection = memo(({ formData, errors, updateFormData, subcats, categories }: any) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ana Kategori</h3>
      {errors.category && <p className="text-red-500 text-sm mb-2">{errors.category}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat: any) => (
          <div
            key={cat.slug}
            onClick={() => updateFormData('category', cat.slug)}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${formData.category === cat.slug 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }
              ${errors.category ? 'border-red-300' : ''}
            `}
          >
            <div className="flex items-center space-x-3">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${formData.category === cat.slug ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
              `}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{cat.name}</h4>
                <p className="text-sm text-gray-500">{cat.subcategories.length} alt kategori</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {subcats.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alt Kategori</h3>
        {errors.subcategory && <p className="text-red-500 text-sm mb-2">{errors.subcategory}</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {subcats.map((sub: any) => (
            <button
              key={sub.slug}
              type="button"
              onClick={() => updateFormData('subcategory', sub.slug)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${formData.subcategory === sub.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${errors.subcategory && formData.subcategory !== sub.slug ? 'border border-red-300' : ''}
              `}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
));

const DetailsStep = memo(({ formData, errors, updateFormData }: any) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        İlan Başlığı *
      </label>
      {errors.title && <p className="text-red-500 text-sm mb-2">{errors.title}</p>}
      <input
        type="text"
        value={formData.title}
        onChange={(e) => updateFormData('title', e.target.value)}
        placeholder="Örn: Temizlik hizmeti arıyorum"
        className={`
          w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${errors.title ? 'border-red-300' : 'border-gray-300'}
        `}
      />
      <p className="text-sm text-gray-500 mt-1">En az 10 karakter giriniz</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Detaylı Açıklama *
      </label>
      {errors.description && <p className="text-red-500 text-sm mb-2">{errors.description}</p>}
      <textarea
        value={formData.description}
        onChange={(e) => updateFormData('description', e.target.value)}
        rows={5}
        placeholder="İhtiyacınızı detaylı olarak açıklayın..."
        className={`
          w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${errors.description ? 'border-red-300' : 'border-gray-300'}
        `}
      />
      <p className="text-sm text-gray-500 mt-1">En az 20 karakter giriniz</p>
    </div>
 </div>
));

const LocationBudgetStep = memo(({ formData, errors, updateFormData }: {
  formData: FormData;
  errors: Record<string, string>;
  updateFormData: (field: keyof FormData, value: any) => void;
}) => {
  const selectedProvince = getProvinceByName(formData.city);
  const availableDistricts = selectedProvince ? getDistrictsByProvince(selectedProvince.name) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">İl *</label>
          <select
            value={formData.city}
            onChange={(e) => {
              updateFormData('city', e.target.value);
              updateFormData('district', ''); // Reset district when province changes
            }}
            className={`
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${errors.city ? 'border-red-500' : 'border-gray-300'}
            `}
            required
          >
            <option value="">İl Seçiniz</option>
            {TURKEY_PROVINCES.map((province) => (
              <option key={province.name} value={province.name}>
                {province.name}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">İlçe *</label>
          <select
            value={formData.district}
            onChange={(e) => updateFormData('district', e.target.value)}
            disabled={!formData.city}
            className={`
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${errors.district ? 'border-red-500' : 'border-gray-300'}
              ${!formData.city ? 'bg-gray-100 cursor-not-allowed' : ''}
            `}
            required
          >
            <option value="">İlçe Seçiniz</option>
            {availableDistricts.map((district) => (
              <option key={district.id} value={district.name}>
                {district.name}
              </option>
            ))}
          </select>
          {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bütçe Aralığı (TL) *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            value={formData.minBudget}
            onChange={(e) => updateFormData('minBudget', e.target.value)}
            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.minBudget ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Minimum tutar"
          />
          <input
            key="budget-input"
            type="number"
            value={formData.budget}
            onChange={(e) => updateFormData('budget', e.target.value)}
            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.budget ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Maksimum tutar"
            required
          />
        </div>
        {(errors.minBudget || errors.budget) && (
          <p className="text-red-500 text-sm mt-1">{errors.minBudget || errors.budget}</p>
        )}
        {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
        <p className="mt-1 text-sm text-gray-500">Satıcıların teklif verebilmesi için bütçe aralığınızı belirtin</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Bilgilendirme</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Varsagel'de ödeme sistemi yoktur. Sadece aracı platformuz. Satıcılar sizinle iletişime geçecektir.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const ReviewStep = memo(({ formData, categories }: { formData: FormData, categories: any[] }) => {
  const selectedCategory = categories.find((c: any) => c.slug === formData.category);
  const selectedSubcategory = selectedCategory?.subcategories.find((s: any) => s.slug === formData.subcategory);
  const attrs = formData.attributes || {};
  const pairs: Record<string, { min?: any; max?: any }> = {};
  Object.keys(attrs).forEach((k) => {
    if (k.endsWith('Min')) {
      const base = k.slice(0, -3);
      pairs[base] = pairs[base] || {}; pairs[base].min = attrs[k];
    } else if (k.endsWith('Max')) {
      const base = k.slice(0, -3);
      pairs[base] = pairs[base] || {}; pairs[base].max = attrs[k];
    }
  });
  const entries = Object.entries(attrs).filter(([k]) => !k.endsWith('Min') && !k.endsWith('Max'));
  const label = (key: string) => {
    const map: Record<string, string> = { marka: 'Marka', model: 'Model', yakit: 'Yakıt', vites: 'Vites', yil: 'Yıl', km: 'Kilometre', hizmetKapsami: 'Hizmet Kapsamı' };
    return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Özeti</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Başlık:</span>
            <span className="font-medium">{formData.title || 'Belirtilmemiş'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Kategori:</span>
            <span className="font-medium">{selectedCategory?.name} - {selectedSubcategory?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Konum:</span>
            <span className="font-medium">{formData.city}, {formData.district}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bütçe:</span>
            <span className="font-medium">
              {formData.minBudget || formData.budget
                ? `${formData.minBudget ? `${formData.minBudget} TL` : '—'} – ${formData.budget ? `${formData.budget} TL` : '—'}`
                : 'Belirtilmemiş'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-2">Açıklama</h4>
        <p className="text-gray-600 whitespace-pre-wrap">{formData.description || 'Açıklama girilmemiş'}</p>
      </div>

      {(entries.length > 0 || Object.keys(pairs).length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-2">Özellikler</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(pairs).map(([base, v]) => (
              (v.min || v.max) ? (
                <div key={base} className="flex justify-between text-gray-700">
                  <span className="font-medium">{label(base)}</span>
                  <span>{v.min ?? '—'}{(v.min || v.max) ? ' – ' : ''}{v.max ?? '—'}</span>
                </div>
              ) : null
            ))}
            {entries.map(([k, v]) => (
              v !== undefined && v !== '' ? (
                <div key={k} className="flex justify-between text-gray-700">
                  <span className="font-medium">{label(k)}</span>
                  <span>{String(v)}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Hazırsınız!</h3>
            <div className="mt-1 text-sm text-green-700">
              <p>İlanınızı oluşturmaya hazırsınız. Satıcılar sizinle iletişime geçecektir.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function IlanVerPage() {
  const sp = useSearchParams();
  const [categories, setCategories] = useState<any[]>(STATIC_CATEGORIES);
  const defaultCategory = sp.get("category") ?? "";
  const defaultSubcategory = sp.get("subcategory") ?? "";

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: defaultCategory,
    subcategory: defaultSubcategory,
    city: "",
    district: "",
    minBudget: "",
    budget: "",
    images: [],
    attributes: {},
  });

  const subcats = useMemo(() => categories.find((c) => c.slug === formData.category)?.subcategories ?? [], [formData.category, categories]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data) && data.length) {
            setCategories(data);
          }
        }
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!formData.category && categories.length) {
      setFormData(prev => ({ ...prev, category: defaultCategory || categories[0].slug }));
    }
  }, [categories, defaultCategory]);

  useEffect(() => {
    const valid = subcats.some((s: any) => s.slug === formData.subcategory);
    if (!valid) {
      setFormData(prev => ({ ...prev, subcategory: subcats[0]?.slug ?? "" }));
    }
  }, [formData.category, subcats]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorSummary, setErrorSummary] = useState<string[]>([]);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.category) newErrors.category = 'Kategori seçmelisiniz';
      if (!formData.subcategory) newErrors.subcategory = 'Alt kategori seçmelisiniz';
    }

    if (step === 2) {
      if (!formData.title.trim()) newErrors.title = 'Başlık girmelisiniz';
      if (formData.title.trim().length < 10) newErrors.title = 'Başlık en az 10 karakter olmalı';
      if (!formData.description.trim()) newErrors.description = 'Açıklama girmelisiniz';
      if (formData.description.trim().length < 20) newErrors.description = 'Açıklama en az 20 karakter olmalı';
    }

  if (step === 3) {
    if (!formData.city.trim()) newErrors.city = 'Şehir girmelisiniz';
    if (!formData.district.trim()) newErrors.district = 'İlçe girmelisiniz';
    if (!formData.minBudget) newErrors.minBudget = 'Minimum tutar gerekli';
    else if (parseInt(formData.minBudget) < 0) newErrors.minBudget = 'Geçerli bir minimum tutar giriniz';
    if (!formData.budget) newErrors.budget = 'Maksimum tutar gerekli';
    else if (parseInt(formData.budget) < 1) newErrors.budget = 'Geçerli bir maksimum tutar giriniz';
    if (formData.minBudget && formData.budget) {
      const a = parseInt(formData.minBudget);
      const b = parseInt(formData.budget);
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        newErrors.minBudget = 'Min, Max’tan büyük olamaz';
        newErrors.budget = 'Max, Min’den küçük olamaz';
      }
    }
  }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = 'Kategori seçmelisiniz';
    if (!formData.subcategory) newErrors.subcategory = 'Alt kategori seçmelisiniz';
    if (!formData.title.trim()) newErrors.title = 'Başlık girmelisiniz';
    else if (formData.title.trim().length < 10) newErrors.title = 'Başlık en az 10 karakter olmalı';
    if (!formData.description.trim()) newErrors.description = 'Açıklama girmelisiniz';
    else if (formData.description.trim().length < 20) newErrors.description = 'Açıklama en az 20 karakter olmalı';
    if (!formData.city.trim()) newErrors.city = 'Şehir girmelisiniz';
    if (!formData.district.trim()) newErrors.district = 'İlçe girmelisiniz';
    if (!formData.minBudget) newErrors.minBudget = 'Minimum tutar gerekli';
    else if (parseInt(formData.minBudget) < 0) newErrors.minBudget = 'Geçerli bir minimum tutar giriniz';
    if (!formData.budget) newErrors.budget = 'Maksimum tutar gerekli';
    else if (parseInt(formData.budget) < 1) newErrors.budget = 'Geçerli bir maksimum tutar giriniz';
    if (formData.minBudget && formData.budget) {
      const a = parseInt(formData.minBudget);
      const b = parseInt(formData.budget);
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        newErrors.minBudget = 'Min, Max’tan büyük olamaz';
        newErrors.budget = 'Max, Min’den küçük olamaz';
      }
    }
    const overrideKey = `${formData.category}/${formData.subcategory || ''}`;
    const combined = [
      ...((ATTR_SCHEMAS[formData.category] ?? [])),
      ...((ATTR_SUBSCHEMAS[overrideKey] ?? [])),
    ];
    const attrs = formData.attributes || {};
    combined.forEach((f: AttrField) => {
      if (f.type === 'range-number' && f.minKey && f.maxKey && f.required) {
        const a = attrs[f.minKey];
        const b = attrs[f.maxKey];
        const hasA = a !== undefined && String(a) !== '';
        const hasB = b !== undefined && String(b) !== '';
        if (!hasA) newErrors[f.minKey] = 'Zorunlu';
        if (!hasB) newErrors[f.maxKey] = 'Zorunlu';
      } else if (f.key && f.required) {
        const v = attrs[f.key];
        const present = f.type === 'boolean' ? (f.key in attrs) : (v !== undefined && String(v).trim() !== '');
        if (!present) newErrors[f.key] = 'Zorunlu';
      }
    });
    if (String(attrs['marka'] || '').trim() && !String(attrs['model'] || '').trim()) {
      newErrors['model'] = 'Zorunlu';
    }
    setErrors(newErrors);
    const items = Object.keys(newErrors);
    const labels: Record<string,string> = { category:'Kategori', subcategory:'Alt kategori', title:'Başlık', description:'Açıklama', city:'İl', district:'İlçe', budget:'Bütçe' };
    const fieldMap = new Map<string, string>();
    combined.forEach((f: AttrField) => {
      if (f.key) fieldMap.set(f.key, f.label);
      if (f.minKey) fieldMap.set(f.minKey, f.label);
      if (f.maxKey) fieldMap.set(f.maxKey, f.label);
    });
    setErrorSummary(items.map(k => labels[k] || fieldMap.get(k) || k));
    return items.length === 0;
  }, [formData]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Hata temizleme
    if (errors[field as string]) {
      setErrors(prev => { const n = { ...prev }; delete n[field as string]; return n; });
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
    const ok = validateAll();
    if (!ok) {
      toast({ title: 'Eksik alanlar', description: `${errorSummary.join(', ')}`, variant: 'destructive' });
      return;
    }
    console.log('Form submit ediliyor...');
    console.log('Form data:', formData);
    
    try {
      // Show loading notification
      toast({
        title: "İlanınız oluşturuluyor...",
        description: "Lütfen bekleyiniz",
      });

      const response = await fetch('/api/ilan-olustur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          city: formData.city,
          district: formData.district,
          budget: formData.budget,
          attributes: {
            ...formData.attributes,
            ...(formData.minBudget ? { minPrice: parseInt(formData.minBudget) } : {}),
            ...(formData.budget ? { maxPrice: parseInt(formData.budget) } : {}),
          },
        }),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (response.ok) {
        toast({
          title: "Başarılı!",
          description: result.message || 'İlanınız başarıyla oluşturuldu!',
          variant: "default",
        });
        
        // Formu temizle
        setFormData({
          title: "",
          description: "",
          category: categories[0]?.slug || "",
          subcategory: "",
          city: "",
          district: "",
          minBudget: "",
          budget: "",
          images: [],
          attributes: {},
        });
        setCurrentStep(1);
        const qp = new URLSearchParams();
        if (formData.category) qp.set('category', formData.category);
        if (formData.subcategory) qp.set('subcategory', formData.subcategory);
        if (formData.city) qp.set('city', formData.city);
        if (formData.district) qp.set('district', formData.district);
        if (formData.minBudget) qp.set('minPrice', String(formData.minBudget));
        if (formData.budget) qp.set('maxPrice', String(formData.budget));
        Object.entries(formData.attributes || {}).forEach(([k,v])=>{ if (v!==undefined && v!=='' && v!==null) qp.set(k, String(v)); });
        qp.set('sort','newest');
        setTimeout(() => { window.location.href = `/?${qp.toString()}`; }, 1500);
      } else {
        let desc = result.error || 'İlan oluşturulurken bir hata oluştu';
        const m = String(result.error||'').match(/Eksik alanlar:\s*(.*)$/i);
        if (m && m[1]) {
          const parts = m[1].split(',').map((s:string)=> s.trim()).filter(Boolean);
          const labels: Record<string,string> = { category:'Kategori', subcategory:'Alt kategori', title:'Başlık', description:'Açıklama', city:'İl', district:'İlçe', budget:'Bütçe' };
          const mapped = parts.map(p => labels[p] || p);
          setErrorSummary(mapped);
        const newErrors: Record<string, string> = {};
        parts.forEach((p:string)=> { if (p in formData) (newErrors as any)[p] = 'Bu alan gerekli'; });
        setErrors(prev => ({ ...prev, ...newErrors }));
          desc = mapped.join(', ');
        }
        toast({ title: 'Eksik alanlar', description: desc, variant: 'destructive' });
      }
    } catch (error) {
      console.error('İlan oluşturma hatası:', error);
      toast({
        title: "Hata",
        description: 'İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        variant: "destructive",
      });
    }
  }, [formData]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CategorySelection formData={formData} errors={errors} updateFormData={updateFormData} subcats={subcats} categories={categories} />;
      case 2:
        return <DetailsStep formData={formData} errors={errors} updateFormData={updateFormData} />;
      case 3:
        return <LocationBudgetStep formData={formData} errors={errors} updateFormData={updateFormData} />;
      case 4:
        return <ReviewStep formData={formData} categories={categories} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alıcı İlanı Ver</h1>
          <p className="text-lg text-gray-600">
            İhtiyacını belirt, satıcılar sana teklif gelsin
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {errorSummary.length > 0 && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
              Eksik alanlar: {errorSummary.join(', ')}
            </div>
          )}
          <StepIndicator currentStep={currentStep} />

          <form onSubmit={handleSubmit} className="mt-8">
            {renderStep()}
            <div className="mt-8">
            <CategoryAttributes
              category={formData.category}
              subcategory={formData.subcategory}
              attributes={formData.attributes}
              errors={errors}
              onChange={(key, val)=> {
                setFormData(prev=> {
                  const next = { ...prev, attributes: { ...prev.attributes, [key]: val } };
                  if (key === 'marka') { next.attributes['model'] = ''; next.attributes['seri'] = ''; next.attributes['paket'] = ''; }
                  if (key === 'model') { next.attributes['seri'] = ''; next.attributes['paket'] = ''; }
                  if (key === 'seri') { next.attributes['paket'] = ''; }
                  return next;
                });
                if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
                if (key === 'marka') setErrors(prev => { const n = { ...prev }; delete n.model; delete n.seri; delete n.paket; return n; });
                if (key === 'model') setErrors(prev => { const n = { ...prev }; delete n.seri; delete n.paket; return n; });
                if (key === 'seri') setErrors(prev => { const n = { ...prev }; delete n.paket; return n; });
              }}
            />
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-colors
                  ${currentStep === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                Geri
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md"
                >
                  Devam Et
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md"
                >
                  İlanı Oluştur
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Ödeme sistemi yok, sadece aracı platform • Üyelik tek tip
          </p>
        </div>
      </div>
    </div>
  );
}

export default function IlanVerPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <IlanVerPage />
    </Suspense>
  );
}
import { ATTR_SCHEMAS, AttrField } from '@/data/attribute-schemas';
import { ATTR_SUBSCHEMAS, BRAND_MODELS, MODEL_SERIES, SERIES_TRIMS, SERIES_TRIMS_EX, EXTRA_BRANDS_AUTOMOBIL, MODEL_SERIES_EXTRA, SERIES_TRIMS_EXTRA } from '@/data/attribute-overrides';
type AttrFieldLocal = AttrField;
const ATTRS: Record<string, AttrFieldLocal[]> = ATTR_SCHEMAS;

const CategoryAttributes = memo(({ category, subcategory, attributes, errors, onChange }: { category: string; subcategory: string; attributes: Record<string, any>; errors: Record<string, string>; onChange: (key: string, val: any) => void }) => {
  const overrideKey = `${category}/${subcategory || ''}`;
  const combined = [
    ...((ATTRS[category] ?? [])),
    ...((ATTR_SUBSCHEMAS[overrideKey] ?? [])),
  ];
  const fieldMap = new Map<string, AttrFieldLocal>();
  combined.forEach((f) => {
    const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
    fieldMap.set(id, f);
  });
  const fields = Array.from(fieldMap.values());
  if (!fields.length) return null;
  return (
    <div className="space-y-4 bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Kategoriye Özel Alanlar</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((f)=> {
          const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
          return (
          <div key={id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
            {f.type === 'select' ? (
              <>
              <select
                value={attributes[f.key!] ?? ''}
                onChange={(e)=>onChange(f.key!, e.target.value)}
                disabled={
                  (f.key === 'model' && !String(attributes['marka'] || '').trim())
                  || (f.key === 'seri' && (!String(attributes['marka'] || '').trim() || !String(attributes['model'] || '').trim()))
                  || (f.key === 'paket' && !String(attributes['seri'] || '').trim())
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[f.key!] ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Seçiniz</option>
                {(() => {
                  const brand = String(attributes['marka'] || '').trim();
                  const overrideKeyLocal = `${category}/${subcategory || ''}`;
                  let opts = f.options ? [...f.options] : [];
                  if (f.key === 'marka' && overrideKeyLocal === 'vasita/otomobil') {
                    const set = new Set<string>(opts);
                    EXTRA_BRANDS_AUTOMOBIL.forEach(b => set.add(b));
                    opts = Array.from(set).sort((a,b)=> a.localeCompare(b,'tr'));
                  }
                  if (f.key === 'model' && brand && BRAND_MODELS[overrideKeyLocal]) {
                    const base = BRAND_MODELS[overrideKeyLocal][brand] || [];
                    const extra = Object.keys(((MODEL_SERIES_EXTRA[overrideKeyLocal] || {})[brand] || {}));
                    const arr = [...base, ...extra];
                    opts = Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr'));
                  } else if (f.key === 'seri') {
                    const modelVal = String(attributes['model'] || '').trim();
                    const seriesBase = (MODEL_SERIES[overrideKeyLocal] || {}) as Record<string, Record<string, string[]>>;
                    const seriesExtra = (MODEL_SERIES_EXTRA[overrideKeyLocal] || {}) as Record<string, Record<string, string[]>>;
                    const brandSeries: Record<string, string[]> = { ...(seriesBase[brand] || {}), ...(seriesExtra[brand] || {}) };
                    if (brand && modelVal && brandSeries && brandSeries[modelVal]) {
                      const arr: string[] = brandSeries[modelVal] || [];
                      const sorted = Array.from(new Set<string>(arr)).sort((a,b)=> a.localeCompare(b,'tr'));
                      opts = sorted.length ? sorted : ['Standart'];
                    } else {
                      opts = ['Standart'];
                    }
                  } else if (f.key === 'paket') {
                    const modelVal = String(attributes['model'] || '').trim();
                    const seriesVal = String(attributes['seri'] || '').trim();
                    let trimOpts: string[] | undefined;
                    if (overrideKeyLocal === 'vasita/otomobil') {
                      const trimsBase = SERIES_TRIMS['vasita/otomobil'] || {};
                      const trimsExtra = SERIES_TRIMS_EXTRA['vasita/otomobil'] || {};
                      const brandMap: Record<string, Record<string, string[]>> = { ...(trimsBase[brand] || {}), ...(trimsExtra[brand] || {}) };
                      const modelMap: Record<string, string[]> = { ...(brandMap[modelVal] || {}) };
                      trimOpts = modelMap[seriesVal];
                    } else {
                      const exMap = SERIES_TRIMS_EX[`vasita/${subcategory || ''}`];
                      trimOpts = (((exMap || {})[brand] || {})[modelVal] || {})[seriesVal];
                    }
                    const arr = trimOpts && trimOpts.length ? trimOpts : [];
                    const sorted = Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr'));
                    if (sorted.length) {
                      opts = sorted;
                    } else {
                      const defaultPaket = (ATTR_SUBSCHEMAS['vasita/otomobil'] || []).find((ff)=> ff.key === 'paket')?.options || ['Base','Comfort','Elegance','Premium','Sport','AMG Line','M Sport','S-Line','Trendline','Highline'];
                      opts = defaultPaket;
                    }
                  }
                  return opts.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ));
                })()}
              </select>
              {errors[f.key!] && (<p className="text-red-500 text-sm mt-1">{errors[f.key!]}</p>)}
              </>
            ) : f.type === 'boolean' ? (
              <div className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded focus:ring-2 focus:ring-blue-500" checked={Boolean(attributes[f.key!])} onChange={(e)=>onChange(f.key!, e.target.checked)} />
                <span className="text-sm text-gray-700">Evet</span>
              </div>
            ) : f.type === 'range-number' ? (
              <>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={attributes[f.minKey!] ?? ''}
                  onChange={(e)=>onChange(f.minKey!, Number(e.target.value || 0))}
                  placeholder="Min"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[f.minKey!] ? 'border-red-500' : 'border-gray-300'}`}
                />
                <input
                  type="number"
                  value={attributes[f.maxKey!] ?? ''}
                  onChange={(e)=>onChange(f.maxKey!, Number(e.target.value || 0))}
                  placeholder="Max"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[f.maxKey!] ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {(errors[f.minKey!] || errors[f.maxKey!]) && (<p className="text-red-500 text-sm mt-1">Zorunlu</p>)}
              </>
            ) : f.type === 'multiselect' ? (
              <>
              <select
                multiple
                value={String(attributes[f.key!] ?? '').split(',').filter(Boolean)}
                onChange={(e)=> {
                  const selected = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o=> o.value)
                  onChange(f.key!, selected.join(','))
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[f.key!] ? 'border-red-500' : 'border-gray-300'}`}
              >
                {(f.options||[]).map((o)=> (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              {errors[f.key!] && (<p className="text-red-500 text-sm mt-1">{errors[f.key!]}</p>)}
              </>
            ) : (
              <>
              <input
                type={f.type}
                value={attributes[f.key!] ?? ''}
                onChange={(e)=>onChange(f.key!, f.type==='number' ? Number(e.target.value || 0) : e.target.value)}
                placeholder={f.type==='text' ? f.label : ''}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[f.key!] ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors[f.key!] && (<p className="text-red-500 text-sm mt-1">{errors[f.key!]}</p>)}
              </>
            )}
          </div>
        );})}
      </div>
    </div>
  );
});
