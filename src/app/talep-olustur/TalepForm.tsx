"use client";

import { useEffect, useMemo, useState, useCallback, memo, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Category, SubCategory, CATEGORIES as STATIC_CATEGORIES } from "@/data/categories";
import { TURKEY_PROVINCES, getProvinceByName, getDistrictsByProvince } from "@/data/turkey-locations";
import { toast } from "@/components/ui/use-toast";
import { titleCaseTR } from "@/lib/title-case-tr";
import { getCategoryImage, getSubcategoryImage } from "@/data/subcategory-images";
import { 
  List, 
  FileText, 
  MapPin, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  Info, 
  TrendingUp, 
  Search,
  Check
} from "lucide-react";

// Adım tanımları
type Step = {
  id: number;
  title: string;
  description: string;
  icon: any;
};

const STEPS: Step[] = [
  { id: 1, title: "Kategori", description: "Kategori Seçimi", icon: List },
  { id: 2, title: "Detaylar", description: "Talep Detayları", icon: FileText },
  { id: 3, title: "Konum & Bütçe", description: "Konum ve Bütçe Aralığı", icon: MapPin },
  { id: 4, title: "Onay", description: "Önizleme", icon: CheckCircle },
];

// Form verileri
type FormData = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  subcategoryFullSlug?: string;
  city: string;
  district: string;
  neighborhood: string;
  minBudget: string;
  budget: string;
  images: string[];
  attributes: Record<string, any>;
};

type AttributeField = {
  id?: string;
  name: string;
  slug: string;
  type: string;
  options?: string[];
  required?: boolean;
  order?: number;
  minKey?: string;
  maxKey?: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
};

const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
const VALID_IMAGE_EXTS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "tif",
  "tiff",
  "apng",
  "ico",
  "avif",
  "heic",
  "heif",
  "jfif",
  "jif",
]);

const validateImageFile = (file: File) => {
  if (!file) return "Dosya seçilmedi";
  if (file.size <= 0) return "Seçilen dosya boş";
  if (file.size > MAX_UPLOAD_SIZE) {
    return `Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimum 20MB.`;
  }
  const type = String(file.type || "").toLowerCase();
  if (type.startsWith("image/")) return null;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext && VALID_IMAGE_EXTS.has(ext)) return null;
  const allowed = Array.from(VALID_IMAGE_EXTS).join(", ");
  return `Geçersiz dosya tipi (${type || ext || "bilinmiyor"}). Kabul edilenler: ${allowed}.`;
};

const normalizeImageSrc = (src: string) => {
  const value = String(src || "").trim();
  if (!value) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("data:")) return value;
  if (!/%[0-9A-Fa-f]{2}/.test(value)) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const isVehicleCategorySlug = (slug?: string) => {
  const normalized = String(slug || "").toLocaleLowerCase("tr");
  if (!normalized) return false;
  if (normalized === "vasita" || normalized.startsWith("vasita/") || normalized.startsWith("vasita-")) return true;
  return (
    normalized.includes("otomobil") ||
    normalized.includes("arazi") ||
    normalized.includes("suv") ||
    normalized.includes("pickup") ||
    normalized.includes("minivan") ||
    normalized.includes("panelvan") ||
    normalized.includes("motosiklet") ||
    normalized.includes("kamyon") ||
    normalized.includes("cekici") ||
    normalized.includes("ticari") ||
    normalized.includes("otobus") ||
    normalized.includes("minibus")
  );
};

const findSubcategoryName = (items: SubCategory[], slug: string): string | undefined => {
  for (const item of items) {
    if (item.slug === slug || item.fullSlug === slug) return item.name;
    if (item.subcategories) {
      const found = findSubcategoryName(item.subcategories, slug);
      if (found) return found;
    }
  }
  return undefined;
};

const findSubcategoryPath = (items: SubCategory[], slug: string): SubCategory[] => {
  for (const item of items) {
    if (item.slug === slug || item.fullSlug === slug) return [item];
    if (item.subcategories) {
      const found = findSubcategoryPath(item.subcategories, slug);
      if (found.length > 0) return [item, ...found];
    }
  }
  return [];
};

const collectSubcategoryKeys = (items: SubCategory[], bag: Set<string>) => {
  items.forEach((item) => {
    const key = item.fullSlug || item.slug;
    if (key) bag.add(key);
    if (item.subcategories && item.subcategories.length > 0) {
      collectSubcategoryKeys(item.subcategories, bag);
    }
  });
};

const mergeSubcategoryTrees = (base: SubCategory[], extra: SubCategory[]) => {
  if (!base.length) return extra;
  if (!extra.length) return base;
  const keys = new Set<string>();
  collectSubcategoryKeys(base, keys);
  const additions = extra.filter((item) => {
    const key = item.fullSlug || item.slug;
    return key ? !keys.has(key) : false;
  });
  if (!additions.length) return base;
  return [...base, ...additions];
};

// Memoized component'ler
const StepIndicator = memo(function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
  <div className="mb-10 px-4">
    <div className="flex items-center justify-between relative z-0">
      {/* Connecting Line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-100 -z-10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700 ease-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
      
      {STEPS.map((step) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const Icon = step.icon;
        
        return (
        <div key={step.id} className="flex flex-col items-center bg-transparent">
          <div 
            className={`
              relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
              ${isActive 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 scale-110 rotate-3 ring-4 ring-white' 
                : isCompleted 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-4 ring-white' 
                  : 'bg-white text-gray-300 border-2 border-gray-100 shadow-sm'
              }
            `}
          >
            {isCompleted ? (
              <Check className="w-7 h-7 animate-in zoom-in duration-300" />
            ) : (
              <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
            )}
            
            {/* Active Step Glow Effect */}
            {isActive && (
              <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-xl opacity-40 -z-10" />
            )}
          </div>
          
          <div className={`mt-4 text-center hidden sm:block transition-all duration-300 ${isActive ? 'transform translate-y-0 opacity-100' : 'opacity-70'}`}>
            <p className={`text-sm font-bold tracking-tight ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
              {step.title}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1 font-semibold">{step.description}</p>
          </div>
        </div>
      )})}
    </div>
  </div>
  );
});

const CategorySelection = memo(function CategorySelection({ formData, errors, updateFormData, subcats, categories }: { formData: FormData; errors: Record<string, string>; updateFormData: (field: keyof FormData, value: any) => void; subcats: SubCategory[]; categories: Category[] }) {
  const subcategorySectionRef = useRef<HTMLDivElement | null>(null);
  const lastCategoryRef = useRef(formData.category);
  const [history, setHistory] = useState<SubCategory[]>([]);

  useEffect(() => {
    const prev = lastCategoryRef.current;
    if (prev === formData.category) return;
    lastCategoryRef.current = formData.category;
    setHistory([]);

    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobile) return;
    if (!subcats?.length) return;

    requestAnimationFrame(() => {
      subcategorySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [formData.category, subcats]);

  const currentLevelSubcats = useMemo(() => {
    if (history.length > 0) {
      return history[history.length - 1].subcategories || [];
    }
    return subcats;
  }, [history, subcats]);

  useEffect(() => {
    if (!formData.subcategory) return;
    const path = findSubcategoryPath(subcats, formData.subcategory);
    if (path.length <= 1) return;
    const parents = path.slice(0, -1);
    const currentKey = history.map((h) => h.fullSlug || h.slug).join("/");
    const nextKey = parents.map((h) => h.fullSlug || h.slug).join("/");
    if (currentKey !== nextKey) {
      setHistory(parents);
    }
  }, [formData.subcategory, history, subcats]);

  const handleSubcategoryClick = (sub: SubCategory) => {
    if (sub.subcategories && sub.subcategories.length > 0) {
      setHistory(prev => [...prev, sub]);
    } else {
      const selected = sub.fullSlug || sub.slug;
      updateFormData('subcategory', selected);
      if (sub.fullSlug) updateFormData('subcategoryFullSlug', sub.fullSlug);
    }
  };

  const handleSubcategorySelect = (sub: SubCategory) => {
    const selected = sub.fullSlug || sub.slug;
    updateFormData('subcategory', selected);
    if (sub.fullSlug) updateFormData('subcategoryFullSlug', sub.fullSlug);
  };

  const handleBack = () => {
    const activePath = history.length > 0 ? history : (selectedLeafHasChildren ? selectedPath : selectedPath.slice(0, -1));
    if (activePath.length > 0) {
      setHistory(activePath.slice(0, -1));
      if (formData.subcategory) {
        updateFormData('subcategory', '');
        updateFormData('subcategoryFullSlug', '');
      }
      return;
    }
    updateFormData('category', '');
    updateFormData('subcategory', '');
    updateFormData('subcategoryFullSlug', '');
    setHistory([]);
  };

  const currentCategoryName = useMemo(() => {
    const apiName = categories?.find((c: any) => c.slug === formData.category)?.name;
    const staticName = STATIC_CATEGORIES.find((c: any) => c.slug === formData.category)?.name;
    const raw = apiName || staticName || formData.category || 'Kategori';
    return titleCaseTR(raw);
  }, [categories, formData.category]);

  const selectedPath = useMemo(() => {
    if (!formData.subcategory) return [];
    return findSubcategoryPath(subcats, formData.subcategory);
  }, [formData.subcategory, subcats]);

  const breadcrumbPath = selectedPath.length > 0 ? selectedPath : history;
  const selectedLeaf = selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : undefined;
  const selectedLeafHasChildren = !!selectedLeaf?.subcategories?.length;

  useEffect(() => {
    if (history.length > 0) return;
    if (!formData.subcategory) return;
    if (selectedPath.length === 0) return;
    const nextHistory = selectedLeafHasChildren ? selectedPath : selectedPath.slice(0, -1);
    setHistory(nextHistory);
  }, [formData.subcategory, history.length, selectedLeafHasChildren, selectedPath]);

  const handleCategoryBreadcrumbClick = () => {
    updateFormData('subcategory', '');
    updateFormData('subcategoryFullSlug', '');
    setHistory([]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumbPath[index];
    const hasChildren = !!target?.subcategories?.length;
    const nextHistory = hasChildren ? breadcrumbPath.slice(0, index + 1) : breadcrumbPath.slice(0, index);
    setHistory(nextHistory);
    const isSelectedLeaf =
      selectedPath.length > 0 &&
      index === selectedPath.length - 1 &&
      (target?.slug === formData.subcategory || target?.fullSlug === formData.subcategory);
    if (!isSelectedLeaf) {
      updateFormData('subcategory', '');
      updateFormData('subcategoryFullSlug', '');
    }
  };

  return (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {(formData.category || history.length > 0) && (
            <button type="button" onClick={handleBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group" title="Geri Dön">
              <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-cyan-600" />
            </button>
          )}
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <div className="p-1.5 bg-cyan-100 rounded-lg text-cyan-700">
              <List className="w-5 h-5" />
            </div>
            {history.length > 0 ? 'Alt Kategori Seçimi' : 'Ana Kategori Seçimi'}
          </h3>
        </div>
        {errors.category && <span className="text-red-500 text-sm font-medium flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full"><AlertCircle className="w-3 h-3"/>{errors.category}</span>}
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-5 text-sm bg-gray-50 p-2.5 rounded-lg border border-gray-100">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCategoryBreadcrumbClick}
            className={`font-medium hover:text-cyan-600 transition-colors ${breadcrumbPath.length === 0 ? 'text-cyan-700' : 'text-gray-600'}`}
          >
            {currentCategoryName}
          </button>
        </div>
        {breadcrumbPath.map((item, index) => (
          <div key={`${item.fullSlug || item.slug}:${index}`} className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              type="button"
              onClick={() => handleBreadcrumbClick(index)}
              className={`hover:text-cyan-600 transition-colors ${index === breadcrumbPath.length - 1 ? 'text-cyan-700 font-bold' : 'text-gray-600 font-medium'}`}
            >
              {titleCaseTR(item.name)}
            </button>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories?.map((cat: any) => (
          <div
            key={cat.slug}
            onClick={() => updateFormData('category', cat.slug)}
            className={`
              group relative p-3 rounded-xl border cursor-pointer transition-all duration-300
              hover:shadow-md hover:-translate-y-0.5
              ${formData.category === cat.slug 
                ? 'border-cyan-500 bg-cyan-50/50 shadow-sm ring-1 ring-cyan-500/20' 
                : 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/30'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm
                ${formData.category === cat.slug 
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/30' 
                  : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-cyan-600 group-hover:shadow-md'}
              `}>
                <List className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-[15px] font-bold leading-tight transition-colors ${formData.category === cat.slug ? 'text-cyan-900' : 'text-gray-900'}`}>{titleCaseTR(cat.name)}</h4>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{cat.subcategories?.length || 0} Alt Kategori</p>
              </div>
              {formData.category === cat.slug && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                  <div className="w-7 h-7 bg-cyan-600 rounded-full flex items-center justify-center text-white shadow-md shadow-cyan-600/30">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {subcats?.length > 0 && (
      <div ref={subcategorySectionRef} className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-4 border-t border-gray-100/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <div className="p-1.5 bg-cyan-100 rounded-lg text-cyan-700">
              <ChevronRight className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
                <button type="button" onClick={handleBack} className="hover:bg-gray-100 p-1 rounded-full transition-colors group" title="Geri Dön">
                    <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-cyan-600" />
                </button>
                <span>{history.length > 0 ? titleCaseTR(history[history.length - 1].name) : 'Alt Kategori Seçimi'}</span>
            </div>
          </h3>
          {errors.subcategory && <span className="text-red-500 text-sm font-medium flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full"><AlertCircle className="w-3 h-3"/>{errors.subcategory}</span>}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {currentLevelSubcats?.map((sub: any) => (
            <div key={sub.fullSlug || sub.slug} className="relative">
              <button
                type="button"
                onClick={() => handleSubcategoryClick(sub)}
                className={`
                  w-full relative px-3.5 py-2.5 rounded-lg text-[13px] font-semibold transition-all text-left
                  flex items-center justify-between group
                  ${formData.subcategory === (sub.fullSlug || sub.slug)
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-600 ring-offset-2 transform -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 border border-gray-200 hover:border-cyan-200 hover:shadow-sm'
                  }
                `}
              >
                <span className="pr-10 leading-snug">{titleCaseTR(sub.name)}</span>
                {sub.subcategories && sub.subcategories.length > 0 ? (
                  <ChevronRight className={`w-4 h-4 ${formData.subcategory === (sub.fullSlug || sub.slug) ? 'text-white' : 'text-gray-400 group-hover:text-cyan-600'}`} />
                ) : (
                  formData.subcategory === (sub.fullSlug || sub.slug) && <Check className="w-4 h-4 text-white animate-in zoom-in" />
                )}
              </button>

              {sub.subcategories && sub.subcategories.length > 0 && sub.fullSlug && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleSubcategorySelect(sub); }}
                  className={`
                    absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-[11px] font-bold transition-colors
                    ${formData.subcategory === (sub.fullSlug || sub.slug)
                      ? 'bg-white/15 text-white hover:bg-white/25'
                      : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'
                    }
                  `}
                >
                  Seç
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

  </div>
  );
});

const DetailsStep = memo(function DetailsStep({ formData, errors, updateFormData, categories, attributeFields, attributeLoading, attributeLoadError, updateAttribute, modelOptions, seriesOptions, trimOptions, modelLoading, seriesLoading, trimLoading }: { formData: FormData; errors: Record<string, string>; updateFormData: (field: keyof FormData, value: any) => void; categories: Category[]; attributeFields: AttributeField[]; attributeLoading: boolean; attributeLoadError: string | null; updateAttribute: (key: string, value: any) => void; modelOptions: string[]; seriesOptions: string[]; trimOptions: string[]; modelLoading: boolean; seriesLoading: boolean; trimLoading: boolean }) {
  const [manualAttrModes, setManualAttrModes] = useState<Record<string, boolean>>({});
  const [dropdownSearch, setDropdownSearch] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const apiCategory = categories.find(c => c.slug === formData.category);
  const staticCategory = STATIC_CATEGORIES.find(c => c.slug === formData.category);
  const selectedCategory = apiCategory || staticCategory;
  const subcategoryBase = apiCategory?.subcategories?.length ? apiCategory : staticCategory;

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (formData.images.length >= 10) {
      toast({ title: 'Limit', description: 'En fazla 10 görsel ekleyebilirsiniz.', variant: 'warning' });
      return;
    }
    setUploading(true);
    try {
      const next = [...formData.images];
      let added = 0;
      for (let i = 0; i < files.length; i++) {
        if (next.length >= 10) break;
        const file = files[i];
        if (!file) continue;
        const validationError = validateImageFile(file);
        if (validationError) {
          toast({ title: 'Hata', description: validationError, variant: 'destructive' });
          continue;
        }
        const ext = file.name.split('.').pop() || 'jpg';
        const safeName = `image-${Date.now()}-${i}.${ext}`;
        const formDataUpload = new FormData();
        formDataUpload.append('file', file, safeName);
        const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload, cache: 'no-store' });
        const raw = await res.text();
        const data = (() => {
          try { return JSON.parse(raw); } catch { return null; }
        })();
        if (!data) {
          toast({ title: 'Hata', description: raw || 'Yükleme başarısız', variant: 'destructive' });
          continue;
        }
        if (data.success && data.url) {
          next.push(String(data.url));
          added += 1;
          const scanStatus = String(data?.scan?.status || '').toUpperCase();
          if (scanStatus && scanStatus !== 'CLEAN') {
            toast({ title: 'Tarama Bekleniyor', description: 'Görsel yüklendi, güvenlik taraması bekleniyor.', variant: 'warning' });
          }
        } else {
          toast({ title: 'Hata', description: data.error || 'Yükleme başarısız', variant: 'destructive' });
        }
      }
      if (next.length !== formData.images.length) {
        updateFormData('images', next);
      }
      if (added > 0) {
        toast({ title: 'Yüklendi', description: `${added} görsel eklendi.`, variant: 'success' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Yükleme sırasında hata oluştu';
      toast({ title: 'Hata', description: msg, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [formData.images, updateFormData]);
  const subcategoryName = subcategoryBase && formData.subcategory
    ? findSubcategoryName(subcategoryBase.subcategories || [], formData.subcategory)
    : undefined;

  const attrs = formData.attributes || {};
  const categorySlug = formData.subcategoryFullSlug || formData.subcategory || formData.category;
  
  const isVasita = useMemo(() => {
    const result =
      isVehicleCategorySlug(formData.category) ||
      isVehicleCategorySlug(formData.subcategoryFullSlug) ||
      isVehicleCategorySlug(formData.subcategory) ||
      isVehicleCategorySlug(categorySlug);
    return result;
  }, [formData.category, formData.subcategory, formData.subcategoryFullSlug, categorySlug]);

  const closeDetailsIfNeeded = useCallback((target: EventTarget | null) => {
    const el = target instanceof HTMLElement ? target : null;
    const details = el?.closest?.("details");
    if (details) details.removeAttribute("open");
  }, []);
  
  const markaValue = attrs["marka"] ? String(attrs["marka"]) : "";
  const modelValue = attrs["model"] ? String(attrs["model"]) : "";
  const seriValue = attrs["seri"] ? String(attrs["seri"]) : "";

  const isAttributeFilled = useCallback((field: AttributeField, values: Record<string, any>) => {
    if (field.type === "range-number") {
      const minKey = field.minKey || `${field.slug}Min`;
      const maxKey = field.maxKey || `${field.slug}Max`;
      const minVal = values[minKey];
      const maxVal = values[maxKey];
      return String(minVal ?? "").trim() !== "" || String(maxVal ?? "").trim() !== "";
    }
    if (field.type === "multiselect") {
      const val = values[field.slug];
      return Array.isArray(val) && val.length > 0;
    }
    if (field.type === "boolean") {
      return !!values[field.slug];
    }
    const val = values[field.slug];
    if (Array.isArray(val)) return val.length > 0;
    return String(val ?? "").trim() !== "";
  }, []);

  const filledAttributeCount = useMemo(() => {
    const values = formData.attributes || {};
    return attributeFields.reduce((acc, field) => acc + (isAttributeFilled(field, values) ? 1 : 0), 0);
  }, [attributeFields, formData.attributes, isAttributeFilled]);

  const renderAttributeField = (field: AttributeField) => {
    const label = field.name || field.slug;
    const required = false;
    const errorFor = (key: string) => errors[`attr:${key}`];

    if (isVasita && (field.slug === "marka" || field.slug === "model" || field.slug === "seri" || field.slug === "paket")) {
      const fieldError = errorFor(field.slug);
      const optionsRaw =
        field.slug === "model"
          ? modelOptions
          : field.slug === "seri"
            ? seriesOptions
            : field.slug === "paket"
              ? trimOptions
              : (field.options || []);
      const options = (optionsRaw || []).map((o) => String(o));
      const withAny = field.slug !== "marka" && field.slug !== "model" && !options.includes("Farketmez");
      const optionList = withAny ? ["Farketmez", ...options] : options;
      const loading =
        field.slug === "model"
          ? modelLoading
          : field.slug === "seri"
            ? seriesLoading
            : field.slug === "paket"
              ? trimLoading
              : false;
      const disabled =
        (field.slug === "model" && !markaValue) ||
        (field.slug === "seri" && !modelValue) ||
        (field.slug === "paket" && !seriValue);
      const isSingleSelect = field.slug === "marka" || field.slug === "model";
      const selectedValue = Array.isArray(attrs[field.slug])
        ? attrs[field.slug].map((v: any) => String(v))
        : attrs[field.slug]
          ? [String(attrs[field.slug])]
          : [];
      const showEmptyHint =
        field.slug === "model" &&
        !loading &&
        !disabled &&
        options.length === 0 &&
        String(markaValue || "").trim();
      
      // Debug log for model dropdown
      if (manualAttrModes[field.slug]) {
        const manualValue = Array.isArray(attrs[field.slug]) ? "" : (attrs[field.slug] ?? "");
        return (
          <div key={field.slug} className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={manualValue as any}
              onChange={(e) => updateAttribute(field.slug, e.target.value)}
              placeholder={field.slug === "model" ? "Model giriniz" : "Değer giriniz"}
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 ${fieldError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300'}`}
            />
            <button
              type="button"
              onClick={() => setManualAttrModes((prev) => ({ ...prev, [field.slug]: false }))}
              className="text-xs font-semibold text-cyan-600 mt-2 hover:text-cyan-700 focus:outline-none flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-cyan-50 w-fit transition-colors"
            >
              Listeden seç
            </button>
            {fieldError && <div className="text-xs text-red-500">{fieldError}</div>}
          </div>
        );
      }
      const selectedCount = selectedValue.length;
      const selectedPreview = selectedCount
        ? selectedValue.slice(0, 2).join(", ") + (selectedCount > 2 ? ` +${selectedCount - 2}` : "")
        : loading
          ? "Yükleniyor..."
          : disabled
            ? field.slug === "model"
              ? "Önce marka seçiniz"
              : field.slug === "seri"
                ? "Önce model seçiniz"
                : "Önce motor/seri seçiniz"
            : "Seçim yok";
      const searchKey = field.slug;
      const searchVal = dropdownSearch[searchKey] || "";
      const showSearch = optionList.length >= 8;
      const filteredOptions = showSearch
        ? optionList.filter((o) => String(o || "").toLocaleLowerCase("tr").includes(searchVal.toLocaleLowerCase("tr")))
        : optionList;
      if (isSingleSelect) {
        const selected = selectedValue[0] || "";
        const selectedPreviewSingle = selected
          ? selected
          : loading
            ? "Yükleniyor..."
            : disabled
              ? "Önce marka seçiniz"
              : "Seçim yok";
        return (
          <div key={field.slug} className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <details className={`rounded-xl border ${fieldError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'}`}>
              <summary className={`cursor-pointer select-none px-3 py-2 text-sm font-semibold text-gray-700 flex items-center justify-between ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <span>{selected ? "Seçim yapıldı" : "Seçenekleri aç"}</span>
                <span className="text-xs text-gray-500">{selectedPreviewSingle}</span>
              </summary>
              <div className="space-y-1 p-2 pt-0">
                {(showSearch || selected) && (
                  <div className="flex items-center gap-2 pb-2">
                    {showSearch && (
                      <input
                        type="text"
                        value={searchVal}
                        onChange={(e) => setDropdownSearch((prev) => ({ ...prev, [searchKey]: e.target.value }))}
                        placeholder="Seçeneklerde ara..."
                        className="flex-1 px-3 py-2 text-xs border rounded-lg focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 bg-gray-50/30 hover:bg-white hover:border-gray-300"
                        disabled={disabled || loading}
                      />
                    )}
                    {selected && (
                      <button
                        type="button"
                        onClick={() => updateAttribute(field.slug, "")}
                        className="px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        disabled={disabled || loading}
                      >
                        Temizle
                      </button>
                    )}
                  </div>
                )}
                {filteredOptions.length === 0 && (
                  <div className="text-xs text-gray-500 px-2 py-2">Seçenek bulunamadı.</div>
                )}
                {filteredOptions.map((opt) => {
                  const checked = selected === opt;
                  return (
                    <label key={opt} className={`flex items-center gap-2 text-sm px-2 py-2 rounded w-full ${disabled || loading ? 'cursor-not-allowed text-gray-400' : 'hover:bg-gray-50 cursor-pointer'}`}>
                      <input
                        type="radio"
                        name={`${field.slug}-single`}
                        checked={checked}
                        disabled={disabled || loading}
                        onChange={() => {
                          updateAttribute(field.slug, opt);
                          closeDetailsIfNeeded(document.activeElement);
                        }}
                        className="rounded-full border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </details>
            {showEmptyHint && (
              <div className="text-xs text-gray-500">
                Bu markaya ait model bulunamadı.
              </div>
            )}
            <button
              type="button"
              onClick={() => setManualAttrModes((prev) => ({ ...prev, [field.slug]: true }))}
              className="text-xs font-semibold text-cyan-600 mt-1 hover:text-cyan-700 focus:outline-none flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-cyan-50 w-fit transition-colors"
            >
              Listede yok mu? Elle gir
            </button>
            {fieldError && <div className="text-xs text-red-500">{fieldError}</div>}
          </div>
        );
      }
      return (
        <div key={field.slug} className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <details className={`rounded-xl border ${fieldError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'}`}>
            <summary className={`cursor-pointer select-none px-3 py-2 text-sm font-semibold text-gray-700 flex items-center justify-between ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <span>{selectedCount ? `${selectedCount} seçenek seçildi` : "Seçenekleri aç"}</span>
              <span className="text-xs text-gray-500">{selectedPreview}</span>
            </summary>
            <div className="space-y-1 p-2 pt-0">
              {(showSearch || selectedCount > 0) && (
                <div className="flex items-center gap-2 pb-2">
                  {showSearch && (
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setDropdownSearch((prev) => ({ ...prev, [searchKey]: e.target.value }))}
                      placeholder="Seçeneklerde ara..."
                      className="flex-1 px-3 py-2 text-xs border rounded-lg focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 bg-gray-50/30 hover:bg-white hover:border-gray-300"
                      disabled={disabled || loading}
                    />
                  )}
                  {selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => updateAttribute(field.slug, [])}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      disabled={disabled || loading}
                    >
                      Temizle
                    </button>
                  )}
                </div>
              )}
              {filteredOptions.length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-2">Seçenek bulunamadı.</div>
              )}
                {filteredOptions.map((opt) => {
                  const checked = selectedValue.includes(opt);
                return (
                  <label key={opt} className={`flex items-center gap-2 text-sm px-2 py-2 rounded w-full ${disabled || loading ? 'cursor-not-allowed text-gray-400' : 'hover:bg-gray-50 cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled || loading}
                      onChange={(e) => {
                        const next = new Set(selectedValue.map(String));
                        if (e.target.checked) next.add(opt);
                        else next.delete(opt);
                          if (opt === "Farketmez") {
                            if (e.target.checked) {
                              next.clear();
                              next.add("Farketmez");
                            }
                          } else if (next.has("Farketmez")) {
                            next.delete("Farketmez");
                          }
                        updateAttribute(field.slug, Array.from(next));
                        closeDetailsIfNeeded(e.currentTarget);
                      }}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                );
              })}
            </div>
          </details>
          {showEmptyHint && (
            <div className="text-xs text-gray-500">
              Bu markaya ait model bulunamadı.
            </div>
          )}
          <button
            type="button"
            onClick={() => setManualAttrModes((prev) => ({ ...prev, [field.slug]: true }))}
            className="text-xs font-semibold text-cyan-600 mt-1 hover:text-cyan-700 focus:outline-none flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-cyan-50 w-fit transition-colors"
          >
            Listede yok mu? Elle gir
          </button>
          {fieldError && <div className="text-xs text-red-500">{fieldError}</div>}
        </div>
      );
    }

    if (field.type === "range-number") {
      const minKey = field.minKey || `${field.slug}Min`;
      const maxKey = field.maxKey || `${field.slug}Max`;
      const minValue = attrs[minKey] ?? "";
      const maxValue = attrs[maxKey] ?? "";
      const minError = errorFor(minKey);
      const maxError = errorFor(maxKey);
      return (
        <div key={field.slug} className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                value={minValue}
                onChange={(e) => updateAttribute(minKey, e.target.value)}
                placeholder={field.minLabel || "Min"}
                min={field.min}
                max={field.max}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 ${minError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300'}`}
              />
              {minError && <div className="text-xs text-red-500 mt-1">{minError}</div>}
            </div>
            <div>
              <input
                type="number"
                value={maxValue}
                onChange={(e) => updateAttribute(maxKey, e.target.value)}
                placeholder={field.maxLabel || "Max"}
                min={field.min}
                max={field.max}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 ${maxError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300'}`}
              />
              {maxError && <div className="text-xs text-red-500 mt-1">{maxError}</div>}
            </div>
          </div>
        </div>
      );
    }

    if (field.type === "boolean") {
      const value = !!attrs[field.slug];
      const fieldError = errorFor(field.slug);
      return (
        <div key={field.slug} className="space-y-2">
          <label className="flex items-center gap-3 text-sm font-bold text-gray-700">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateAttribute(field.slug, e.target.checked)}
              className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span>{label} {required && <span className="text-red-500">*</span>}</span>
          </label>
          {fieldError && <div className="text-xs text-red-500">{fieldError}</div>}
        </div>
      );
    }

    if (field.type === "multiselect") {
      const value = Array.isArray(attrs[field.slug]) ? attrs[field.slug] : [];
      const fieldError = errorFor(field.slug);
      const options = (field.options || []).map((o) => String(o));
      const withAny = !options.includes("Farketmez");
      const optionList = withAny ? ["Farketmez", ...options] : options;
      const searchKey = `${field.slug}:multi`;
      const searchVal = dropdownSearch[searchKey] || "";
      const showSearch = optionList.length >= 8;
      const filteredOptions = showSearch
        ? optionList.filter((o) => String(o || "").toLocaleLowerCase("tr").includes(searchVal.toLocaleLowerCase("tr")))
        : optionList;
      const selectedCount = value.length;
      const selectedPreview = selectedCount
        ? value.slice(0, 2).join(", ") + (selectedCount > 2 ? ` +${selectedCount - 2}` : "")
        : "Seçim yok";
      return (
        <div key={field.slug} className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <details className={`rounded-xl border ${fieldError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'}`}>
            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>{selectedCount ? `${selectedCount} seçenek seçildi` : "Seçenekleri aç"}</span>
              <span className="text-xs text-gray-500">{selectedPreview}</span>
            </summary>
            <div className="space-y-1 p-2 pt-0">
              {(showSearch || selectedCount > 0) && (
                <div className="flex items-center gap-2 pb-2">
                  {showSearch && (
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setDropdownSearch((prev) => ({ ...prev, [searchKey]: e.target.value }))}
                      placeholder="Seçeneklerde ara..."
                      className="flex-1 px-3 py-2 text-xs border rounded-lg focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 bg-gray-50/30 hover:bg-white hover:border-gray-300"
                    />
                  )}
                  {selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => updateAttribute(field.slug, [])}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              )}
              {filteredOptions.length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-2">Seçenek bulunamadı.</div>
              )}
              {filteredOptions.map((opt) => {
                const checked = value.includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 text-sm px-2 py-2 rounded hover:bg-gray-50 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(value.map(String));
                        if (e.target.checked) next.add(opt);
                        else next.delete(opt);
                        if (opt === "Farketmez") {
                          if (e.target.checked) {
                            next.clear();
                            next.add("Farketmez");
                          }
                        } else if (next.has("Farketmez")) {
                          next.delete("Farketmez");
                        }
                        updateAttribute(field.slug, Array.from(next));
                        closeDetailsIfNeeded(e.currentTarget);
                      }}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                );
              })}
            </div>
          </details>
          {fieldError && <div className="text-xs text-red-500">{fieldError}</div>}
        </div>
      );
    }

    if (field.type === "select" || (isVasita && field.slug === "model")) {
      const value = Array.isArray(attrs[field.slug])
        ? attrs[field.slug]
        : attrs[field.slug]
          ? [String(attrs[field.slug])]
          : [];
      const fieldError = errorFor(field.slug);
      const options = (field.options || []).map((o) => String(o));
      const withAny = field.slug !== "marka" && field.slug !== "model" && !options.includes("Farketmez");
      const optionList = withAny ? ["Farketmez", ...options] : options;
      const searchKey = `${field.slug}:select`;
      const searchVal = dropdownSearch[searchKey] || "";
      const showSearch = optionList.length >= 8;
      const filteredOptions = showSearch
        ? optionList.filter((o) => String(o || "").toLocaleLowerCase("tr").includes(searchVal.toLocaleLowerCase("tr")))
        : optionList;
      const selectedCount = value.length;
      const selectedPreview = selectedCount
        ? value.slice(0, 2).join(", ") + (selectedCount > 2 ? ` +${selectedCount - 2}` : "")
        : "Seçim yok";
      if (field.slug === "marka" || field.slug === "model") {
        const selected = value[0] || "";
        const selectedPreviewSingle = selected || "Seçim yok";
        return (
          <div key={field.slug} className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <details className={`rounded-xl border ${fieldError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'}`}>
              <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>{selected ? "Seçim yapıldı" : "Seçenekleri aç"}</span>
                <span className="text-xs text-gray-500">{selectedPreviewSingle}</span>
              </summary>
              <div className="space-y-1 p-2 pt-0">
                {(showSearch || selected) && (
                  <div className="flex items-center gap-2 pb-2">
                    {showSearch && (
                      <input
                        type="text"
                        value={searchVal}
                        onChange={(e) => setDropdownSearch((prev) => ({ ...prev, [searchKey]: e.target.value }))}
                        placeholder="Seçeneklerde ara..."
                        className="flex-1 px-3 py-2 text-xs border rounded-lg focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 bg-gray-50/30 hover:bg-white hover:border-gray-300"
                      />
                    )}
                    {selected && (
                      <button
                        type="button"
                        onClick={() => updateAttribute(field.slug, "")}
                        className="px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        Temizle
                      </button>
                    )}
                  </div>
                )}
                {filteredOptions.length === 0 && (
                  <div className="text-xs text-gray-500 px-2 py-2">Seçenek bulunamadı.</div>
                )}
                {filteredOptions.map((opt) => {
                  const checked = selected === opt;
                  return (
                    <label key={opt} className="flex items-center gap-2 text-sm px-2 py-2 rounded hover:bg-gray-50 cursor-pointer w-full">
                      <input
                        type="radio"
                        name={`${field.slug}-single`}
                        checked={checked}
                        onChange={() => {
                          updateAttribute(field.slug, opt);
                          closeDetailsIfNeeded(document.activeElement);
                        }}
                        className="rounded-full border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </details>
            {fieldError && <div className="text-xs text-red-500">{fieldError}</div>}
          </div>
        );
      }
      return (
        <div key={field.slug} className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <details className={`rounded-xl border ${fieldError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'}`}>
            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>{selectedCount ? `${selectedCount} seçenek seçildi` : "Seçenekleri aç"}</span>
              <span className="text-xs text-gray-500">{selectedPreview}</span>
            </summary>
            <div className="space-y-1 p-2 pt-0">
              {(showSearch || selectedCount > 0) && (
                <div className="flex items-center gap-2 pb-2">
                  {showSearch && (
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setDropdownSearch((prev) => ({ ...prev, [searchKey]: e.target.value }))}
                      placeholder="Seçeneklerde ara..."
                      className="flex-1 px-3 py-2 text-xs border rounded-lg focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 bg-gray-50/30 hover:bg-white hover:border-gray-300"
                    />
                  )}
                  {selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => updateAttribute(field.slug, [])}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              )}
              {filteredOptions.length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-2">Seçenek bulunamadı.</div>
              )}
              {filteredOptions.map((opt) => {
                const checked = value.includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 text-sm px-2 py-2 rounded hover:bg-gray-50 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(value.map(String));
                        if (e.target.checked) next.add(opt);
                        else next.delete(opt);
                        if (opt === "Farketmez") {
                          if (e.target.checked) {
                            next.clear();
                            next.add("Farketmez");
                          }
                        } else if (next.has("Farketmez")) {
                          next.delete("Farketmez");
                        }
                        updateAttribute(field.slug, Array.from(next));
                        closeDetailsIfNeeded(e.currentTarget);
                      }}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                );
              })}
            </div>
          </details>
          {fieldError && <div className="text-xs text-red-500">{fieldError}</div>}
        </div>
      );
    }

    const value = attrs[field.slug] ?? "";
    const fieldError = errorFor(field.slug);
    return (
      <div key={field.slug} className="space-y-2">
        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={field.type === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => updateAttribute(field.slug, e.target.value)}
          className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 ${fieldError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300'}`}
        />
        {fieldError && <div className="text-xs text-red-500">{fieldError}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-lg shadow-gray-200/40">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 rounded-xl">
              <FileText className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Temel Bilgiler</h3>
              <p className="text-xs text-gray-500 font-medium">İhtiyacınızı detaylandırın</p>
            </div>
          </div>
          
          {selectedCategory && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="text-gray-600">{selectedCategory.name}</span>
              {subcategoryName && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-cyan-700">{subcategoryName}</span>
                </>
              )}
            </div>
          )}
        </div>
        
        {selectedCategory && (
          <div className="sm:hidden mb-4 flex items-center gap-2 text-xs font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
             <span className="text-gray-600">{selectedCategory.name}</span>
             {subcategoryName && (
               <>
                 <ChevronRight className="w-3 h-3 text-gray-400" />
                 <span className="text-cyan-700">{subcategoryName}</span>
               </>
             )}
          </div>
        )}
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            Ne arıyorsunuz? <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Örn: Temiz iPhone 13 arıyorum, Boyasız 2020 Honda Civic..."
              className={`
                w-full pl-4 pr-4 py-3 text-base border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300
                placeholder:text-gray-400
                ${errors.title 
                  ? 'border-red-300 bg-red-50/50 focus:ring-red-200' 
                  : 'border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300 hover:shadow-sm focus:bg-white focus:shadow-md'
                }
              `}
            />
          </div>
          <div className="flex justify-between mt-2 px-1">
            {errors.title ? (
              <span className="text-red-600 text-xs font-bold flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5"/>{errors.title}</span>
            ) : (
              <span className="text-gray-400 text-xs font-medium">En az 10 karakter</span>
            )}
            <span className={`text-xs font-bold ${(formData.title?.length || 0) >= 10 ? 'text-emerald-600' : 'text-gray-400'}`}>{formData.title?.length || 0}/50</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            Aradığınız Ürünü Anlatın <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            rows={5}
            placeholder="Aradığınız ürünün durumunu, rengini, varsa kusurlarını kabul edip etmeyeceğinizi belirtin..."
            className={`
              w-full p-4 text-sm border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 resize-none
              placeholder:text-gray-400
              ${errors.description 
                ? 'border-red-300 bg-red-50/50 focus:ring-red-200' 
                : 'border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300 hover:shadow-sm focus:bg-white focus:shadow-md'
              }
            `}
          />
          <div className="flex justify-between mt-2 px-1">
            {errors.description ? (
              <span className="text-red-600 text-xs font-bold flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5"/>{errors.description}</span>
            ) : (
              <span className="text-gray-400 text-xs font-medium">En az 20 karakter</span>
            )}
            <span className={`text-xs font-bold ${(formData.description?.length || 0) >= 20 ? 'text-emerald-600' : 'text-gray-400'}`}>{formData.description?.length || 0}/500</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-1">
            Resim Ekle
          </label>
          <div className="bg-gray-50/30 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-600 font-medium">
                Maks. 20MB • {formData.images.length}/10
              </div>
              <label
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  uploading || formData.images.length >= 10
                    ? 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-cyan-700 border-cyan-200 hover:bg-cyan-50 cursor-pointer'
                }`}
              >
                {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  disabled={uploading || formData.images.length >= 10}
                  onChange={(e) => {
                    handleImageUpload(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {Array.isArray(formData.images) && formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.images.slice(0, 10).map((img, idx) => (
                  <div key={`${img}-${idx}`} className="relative border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div className="relative aspect-square">
                      <Image src={normalizeImageSrc(img)} alt={`Resim ${idx + 1}`} fill unoptimized className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = formData.images.filter((_, i) => i !== idx);
                        updateFormData('images', next);
                      }}
                      className="w-full py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border-t border-red-100"
                    >
                      Kaldır
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {(formData.subcategory && (attributeLoading || attributeFields.length > 0 || attributeLoadError)) && (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-lg shadow-gray-200/40">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 rounded-xl">
              <Search className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Aradığınız Ürünün Özellikleri</h3>
              <p className="text-xs text-gray-500 font-medium">Kategoriye özel filtreleri seçin</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
              {filledAttributeCount}/{attributeFields.length} seçili
            </span>
          </div>
        </div>

        {attributeLoading && (
          <div className="text-sm text-gray-500 font-medium">Özellikler yükleniyor...</div>
        )}

        {!attributeLoading && attributeLoadError && (
          <div className="text-sm text-red-500 font-medium">{attributeLoadError}</div>
        )}

        {!attributeLoading && !attributeLoadError && attributeFields.length === 0 && (
          <div className="text-sm text-gray-500 font-medium">Bu kategori için ek özellik bulunmuyor.</div>
        )}

        {!attributeLoading && !attributeLoadError && attributeFields.length > 0 && (
          <div className="space-y-4">
            <div className="sm:hidden text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full w-fit">
              {filledAttributeCount}/{attributeFields.length} seçili
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(() => {
                const attrs = formData.attributes || {};
                const ordered = attributeFields
                  .slice()
                  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
                if (!isVasita) return ordered.map(renderAttributeField);
                const hasMarka = String(attrs["marka"] || "").trim().length > 0;
                const hasModel = String(attrs["model"] || "").trim().length > 0;
                const hasSeri = String(attrs["seri"] || "").trim().length > 0;
                const hasSeriField = ordered.some((f) => f.slug === "seri");
                return ordered
                  .filter((f) => {
                    if (f.slug === "model") return hasMarka;
                    if (f.slug === "seri") return hasModel;
                    if (f.slug === "paket") return hasSeriField ? hasSeri : hasModel;
                    return true;
                  })
                  .map(renderAttributeField);
              })()}
            </div>
          </div>
        )}
      </div>
    )}
 </div>
  );
});

const LocationBudgetStep = memo(function LocationBudgetStep({ formData, errors, updateFormData }: {
  formData: FormData;
  errors: Record<string, string>;
  updateFormData: (field: keyof FormData, value: any) => void;
}) {
  const [manualModes, setManualModes] = useState<Record<string, boolean>>({});
  const manualDistrict = manualModes['district'];
  const manualNeighborhood = manualModes['neighborhood'];
  const selectedProvince = getProvinceByName(formData.city);
  const availableDistricts = selectedProvince ? getDistrictsByProvince(selectedProvince.name) : [];
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<string[]>([]);
  const [neighborhoodLoading, setNeighborhoodLoading] = useState(false);

  useEffect(() => {
    if (formData.category !== 'emlak') {
      setDistrictOptions([]);
      return;
    }
    if (!formData.city || manualDistrict) {
      setDistrictOptions([]);
      return;
    }
    setDistrictLoading(true);
    const params = new URLSearchParams();
    params.set('city', formData.city);
    fetch(`/api/locations/districts?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setDistrictOptions(Array.isArray(data) ? data : []))
      .catch(() => setDistrictOptions([]))
      .finally(() => setDistrictLoading(false));
  }, [formData.category, formData.city, manualDistrict]);

  useEffect(() => {
    if (formData.category !== 'emlak') {
      setNeighborhoodOptions([]);
      return;
    }
    if (!formData.city || !formData.district || manualNeighborhood) {
      setNeighborhoodOptions([]);
      return;
    }
    setNeighborhoodLoading(true);
    const params = new URLSearchParams();
    params.set('city', formData.city);
    params.set('district', formData.district);
    fetch(`/api/locations/neighborhoods?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setNeighborhoodOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => setNeighborhoodOptions([]))
      .finally(() => setNeighborhoodLoading(false));
  }, [formData.category, formData.city, formData.district, manualNeighborhood]);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Location Section */}
      <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <MapPin className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Konum Bilgileri</h3>
            <p className="text-xs text-gray-500 font-medium">Hizmetin gerçekleşeceği konum</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">İl <span className="text-red-500">*</span></label>
            {manualModes['city'] ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => {
                  updateFormData('city', e.target.value);
                  updateFormData('district', '');
                  updateFormData('neighborhood', '');
                }}
                placeholder="İl giriniz"
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none ${errors.city ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
              />
            ) : (
              <div className="relative group/select">
                <select
                  value={formData.city}
                  onChange={(e) => {
                    updateFormData('city', e.target.value);
                    updateFormData('district', '');
                    updateFormData('neighborhood', '');
                  }}
                  className={`w-full px-4 py-3 text-sm border rounded-xl appearance-none bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none cursor-pointer ${errors.city ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
                >
                  <option value="">İl Seçiniz</option>
                  {TURKEY_PROVINCES?.map((province) => (
                    <option key={province.name} value={province.name}>{province.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none group-hover/select:text-cyan-500 transition-colors" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setManualModes(prev => ({ ...prev, city: !prev.city }))}
              className="text-xs font-semibold text-cyan-600 mt-2 hover:text-cyan-700 focus:outline-none flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-cyan-50 w-fit transition-colors"
            >
              {manualModes['city'] ? <List className="w-3.5 h-3.5"/> : <Search className="w-3.5 h-3.5"/>}
              {manualModes['city'] ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
            </button>
            {errors.city && <span className="text-red-500 text-xs font-bold flex items-center gap-1.5 mt-2 animate-in slide-in-from-left-2"><AlertCircle className="w-3.5 h-3.5"/>{errors.city}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">İlçe <span className="text-red-500">*</span></label>
            {manualModes['district'] ? (
              <input
                type="text"
                value={formData.district}
                onChange={(e) => {
                  updateFormData('district', e.target.value);
                  updateFormData('neighborhood', '');
                }}
                placeholder="İlçe giriniz"
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none ${errors.district ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
              />
            ) : (
              <div className="relative group/select">
                <select
                  value={formData.district}
                  onChange={(e) => {
                    updateFormData('district', e.target.value);
                    updateFormData('neighborhood', '');
                  }}
                  disabled={(!formData.city && !manualModes['city']) || (formData.category === 'emlak' && districtLoading)}
                  className={`
                    w-full px-4 py-3 text-sm border rounded-xl appearance-none bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none cursor-pointer
                    ${errors.district ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}
                    ${((!formData.city && !manualModes['city']) || (formData.category === 'emlak' && districtLoading)) ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:border-gray-200' : ''}
                  `}
                >
                  <option value="">İlçe Seçiniz</option>
                  {formData.category === 'emlak'
                    ? districtOptions?.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))
                    : availableDistricts?.map((district) => (
                        <option key={district.id} value={district.name}>{district.name}</option>
                      ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none group-hover/select:text-cyan-500 transition-colors" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setManualModes(prev => ({ ...prev, district: !prev.district }))}
              className="text-xs font-semibold text-cyan-600 mt-2 hover:text-cyan-700 focus:outline-none flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-cyan-50 w-fit transition-colors"
            >
              {manualModes['district'] ? <List className="w-3.5 h-3.5"/> : <Search className="w-3.5 h-3.5"/>}
              {manualModes['district'] ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
            </button>
            {errors.district && <span className="text-red-500 text-xs font-bold flex items-center gap-1.5 mt-2 animate-in slide-in-from-left-2"><AlertCircle className="w-3.5 h-3.5"/>{errors.district}</span>}
          </div>
        </div>

        {formData.category === 'emlak' && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Mahalle <span className="text-red-500">*</span></label>
              {manualModes['neighborhood'] ? (
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => updateFormData('neighborhood', e.target.value)}
                  placeholder="Mahalle giriniz"
                  className={`w-full px-4 py-3 text-sm border rounded-xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none ${errors.neighborhood ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
                />
              ) : (
                <div className="relative group/select">
                  <select
                    value={formData.neighborhood}
                    onChange={(e) => updateFormData('neighborhood', e.target.value)}
                    disabled={!formData.city || !formData.district || neighborhoodLoading}
                    className={`
                      w-full px-4 py-3 text-sm border rounded-xl appearance-none bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none cursor-pointer
                      ${errors.neighborhood ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}
                      ${(!formData.city || !formData.district || neighborhoodLoading) ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:border-gray-200' : ''}
                    `}
                  >
                    <option value="">{neighborhoodLoading ? 'Yükleniyor...' : 'Mahalle Seçiniz'}</option>
                    {neighborhoodOptions?.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none group-hover/select:text-cyan-500 transition-colors" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setManualModes(prev => ({ ...prev, neighborhood: !prev.neighborhood }))}
                className="text-xs font-semibold text-cyan-600 mt-2 hover:text-cyan-700 focus:outline-none flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-cyan-50 w-fit transition-colors"
              >
                {manualModes['neighborhood'] ? <List className="w-3.5 h-3.5"/> : <Search className="w-3.5 h-3.5"/>}
                {manualModes['neighborhood'] ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
              </button>
              {errors.neighborhood && <span className="text-red-500 text-xs font-bold flex items-center gap-1.5 mt-2 animate-in slide-in-from-left-2"><AlertCircle className="w-3.5 h-3.5"/>{errors.neighborhood}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Budget Section */}
      <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Bütçe Planlaması</h3>
            <p className="text-xs text-gray-500 font-medium">Bütçe aralığınızı belirleyin</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 ml-1">Ayırdığınız Bütçe (TL) <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group/input">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-200 group-hover/input:border-cyan-200 group-hover/input:text-cyan-600 transition-colors">EN DÜŞÜK</span>
              <input
                type="number"
                min="0"
                value={formData.minBudget}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || Number(val) >= 0) {
                    updateFormData('minBudget', val);
                  }
                }}
                className={`w-full pl-32 pr-4 py-3 text-sm border rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none font-medium ${errors.minBudget ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
                placeholder="0"
              />
            </div>
            <div className="relative group/input">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-200 group-hover/input:border-cyan-200 group-hover/input:text-cyan-600 transition-colors">EN YÜKSEK</span>
              <input
                key="budget-input"
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || Number(val) >= 0) {
                    updateFormData('budget', val);
                  }
                }}
                className={`w-full pl-32 pr-4 py-3 text-sm border rounded-xl bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none font-medium ${errors.budget ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
                placeholder="0"
              />
            </div>
          </div>
          {(errors.minBudget || errors.budget) && (
            <span className="text-red-500 text-xs font-bold flex items-center gap-1.5 mt-2 animate-in slide-in-from-left-2"><AlertCircle className="w-3.5 h-3.5"/>{errors.minBudget || errors.budget}</span>
          )}
          <p className="mt-3 text-xs text-gray-500 font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-500" />
            Satıcılar bu bütçeye göre size teklif verecektir.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg shadow-sm ring-1 ring-cyan-100">
            <Info className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-cyan-900">Önemli Bilgilendirme</h3>
            <p className="mt-1 text-xs text-cyan-700/80 font-medium leading-relaxed">
              Varsagel ödeme sistemine sahip değildir. Biz sadece alıcı ve satıcıyı buluşturan bir aracı platformuz. Ödeme ve teslimat detaylarını satıcı ile görüşerek belirleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

const ReviewStep = memo(function ReviewStep({ formData, categories, attributeFields }: { formData: FormData, categories: Category[], attributeFields: AttributeField[] }) {
  const selectedCategory = categories.find((c: any) => c.slug === formData.category);
  const findSubcategory = (items: SubCategory[], slug: string): SubCategory | undefined => {
    for (const item of items) {
      if (item.slug === slug || item.fullSlug === slug) return item;
      if (item.subcategories) {
        const found = findSubcategory(item.subcategories, slug);
        if (found) return found;
      }
    }
    return undefined;
  };
  const selectedSubcategory = selectedCategory && formData.subcategory
    ? findSubcategory(selectedCategory.subcategories || [], formData.subcategory)
    : undefined;
  const categoryImage = useMemo(() => getCategoryImage(formData.category), [formData.category]);
  const mainPreviewSrc = useMemo(
    () => normalizeImageSrc(formData.images[0] || categoryImage),
    [formData.images, categoryImage]
  );

  const attributeItems = (() => {
    const attrs = formData.attributes || {};
    const fieldsBySlug = new Map(attributeFields.map((f) => [f.slug, f]));
    const rangeKeys = new Set<string>();
    const rangeItems = attributeFields
      .filter((f) => f.type === "range-number")
      .map((f) => {
        const minKey = f.minKey || `${f.slug}Min`;
        const maxKey = f.maxKey || `${f.slug}Max`;
        rangeKeys.add(minKey);
        rangeKeys.add(maxKey);
        const minVal = attrs[minKey];
        const maxVal = attrs[maxKey];
        const hasMin = minVal !== undefined && String(minVal).trim() !== "";
        const hasMax = maxVal !== undefined && String(maxVal).trim() !== "";
        if (!hasMin && !hasMax) return null;
        const label = f.name || f.slug;
        const parts = [
          hasMin ? `${f.minLabel || "Min"}: ${minVal}` : null,
          hasMax ? `${f.maxLabel || "Max"}: ${maxVal}` : null,
        ].filter(Boolean).join(" • ");
        return { label, value: parts };
      })
      .filter(Boolean) as { label: string; value: string }[];
    const normalItems = Object.entries(attrs)
      .filter(([k, v]) => !rangeKeys.has(k) && v !== undefined && String(v).trim() !== "")
      .map(([k, v]) => {
        const field = fieldsBySlug.get(k);
        const label = field?.name || k;
        const value = Array.isArray(v)
          ? v.map((item) => String(item)).filter((item) => item.trim()).join(", ")
          : typeof v === "boolean"
            ? (v ? "Evet" : "Hayır")
            : String(v);
        if (!value.trim()) return null;
        return { label, value };
      })
      .filter(Boolean) as { label: string; value: string }[];
    return [...rangeItems, ...normalItems];
  })();

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            Talep Özeti
          </h3>
          <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-[11px] font-bold uppercase tracking-wider rounded-full border border-cyan-100 shadow-sm">Taslak</span>
        </div>
        
        <div className="p-5 space-y-5">
          {formData.images && formData.images?.length > 0 && (
            <div className="mb-5 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group-hover:border-cyan-100 transition-colors">
              <div className="relative h-40 w-full rounded-xl overflow-hidden bg-white group-hover:scale-105 transition-transform duration-500">
                <Image
                  src={mainPreviewSrc}
                  alt="Referans Görsel"
                  fill
                  unoptimized
                  className="object-contain drop-shadow-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = categoryImage;
                  }}
                />
              </div>
              {formData.images.length > 1 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {formData.images.slice(0, 10).map((img, idx) => (
                    <div key={`${img}-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                      <Image
                        src={normalizeImageSrc(img || categoryImage)}
                        alt={`Referans Görsel ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = categoryImage;
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="group/item">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block group-hover/item:text-cyan-600 transition-colors">Başlık</span>
                <p className="text-gray-900 font-bold text-base leading-tight">{formData.title || 'Belirtilmemiş'}</p>
              </div>
              <div className="group/item">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block group-hover/item:text-cyan-600 transition-colors">Kategori</span>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedCategory?.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedSubcategory?.name}</span>
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="group/item">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block group-hover/item:text-cyan-600 transition-colors">Konum</span>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-red-500" />
                  </div>
                  {formData.city}, {formData.district}{formData.neighborhood ? `, ${formData.neighborhood}` : ''}
                </p>
              </div>
              <div className="group/item">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block group-hover/item:text-cyan-600 transition-colors">Hedef Bütçe</span>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 font-black text-xl tracking-tight">
                  {formData.minBudget || formData.budget
                    ? `${formData.minBudget ? `${formData.minBudget} TL` : '0'} – ${formData.budget ? `${formData.budget} TL` : '∞'}`
                    : 'Belirtilmemiş'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Açıklama</span>
            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap hover:bg-white hover:shadow-md transition-all duration-300">
              {formData.description || 'Açıklama girilmemiş'}
            </div>
          </div>

          <div className="pt-5 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Özellikler</span>
            {attributeItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attributeItems.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 text-sm">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-gray-800 font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 text-gray-600 text-sm">
                Özellik belirtilmemiş
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 shadow-lg shadow-emerald-100/50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-full shadow-md ring-4 ring-emerald-50 animate-pulse">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">Her Şey Hazır!</h3>
            <p className="mt-1 text-xs text-emerald-700 font-medium">
              Talebiniz yayınlanmaya hazır. Onayladıktan sonra satıcılar teklif vermeye başlayacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

function TalepOlusturPage() {
  const sp = useSearchParams();
  const [categories, setCategories] = useState<any[]>([]);
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
    neighborhood: "",
    minBudget: "",
    budget: "",
    images: [],
    attributes: {},
  });

  const subcats = useMemo(() => {
    const staticCat = STATIC_CATEGORIES.find((c) => c.slug === formData.category);
    const apiCat = categories.find((c) => c.slug === formData.category);
    const staticList = staticCat?.subcategories ?? [];
    const apiList = apiCat?.subcategories ?? [];
    if (staticList.length && apiList.length) {
      return mergeSubcategoryTrees(staticList, apiList);
    }
    return staticList.length ? staticList : apiList;
  }, [formData.category, categories]);

  const selectedCategoryName = useMemo(() => {
    const apiName = categories.find((c) => c.slug === formData.category)?.name;
    const staticName = STATIC_CATEGORIES.find((c) => c.slug === formData.category)?.name;
    const name = apiName || staticName || formData.category;
    return name ? titleCaseTR(name) : "";
  }, [categories, formData.category]);

  const selectedSubcategoryName = useMemo(() => {
    if (!formData.subcategory) return "";
    const apiBase = categories.find((c) => c.slug === formData.category);
    const staticBase = STATIC_CATEGORIES.find((c) => c.slug === formData.category);
    const base = apiBase?.subcategories?.length ? apiBase : staticBase;
    if (!base?.subcategories?.length) return "";
    const name = findSubcategoryName(base.subcategories, formData.subcategory);
    return name ? titleCaseTR(name) : "";
  }, [categories, formData.category, formData.subcategory]);
  const selectedSubcategoryPath = useMemo(() => {
    if (!formData.subcategory) return [];
    const apiBase = categories.find((c) => c.slug === formData.category);
    const staticBase = STATIC_CATEGORIES.find((c) => c.slug === formData.category);
    const base = apiBase?.subcategories?.length ? apiBase : staticBase;
    if (!base?.subcategories?.length) return [];
    return findSubcategoryPath(base.subcategories, formData.subcategory);
  }, [categories, formData.category, formData.subcategory]);
  const categorySlug = formData.subcategoryFullSlug || formData.subcategory || formData.category;
  const isVasita = useMemo(() => {
    const slug = (categorySlug || "").toLowerCase();
    return slug.includes("vasita") ||
      slug.includes("otomobil") ||
      slug.includes("araba") ||
      slug.includes("arazi") ||
      slug.includes("suv") ||
      slug.includes("pickup") ||
      slug.includes("minivan") ||
      slug.includes("panelvan") ||
      slug.includes("motosiklet") ||
      slug.includes("kamyon") ||
      slug.includes("cekici") ||
      slug.includes("otobus") ||
      slug.includes("minibus") ||
      slug.includes("ticari") ||
      slug.includes("kiralik");
  }, [categorySlug]);
  const normalizeVehicleToken = useCallback((value: string) => {
    return value
      .toLocaleLowerCase("tr")
      .replace(/[ç]/g, "c")
      .replace(/[ğ]/g, "g")
      .replace(/[ı]/g, "i")
      .replace(/[ö]/g, "o")
      .replace(/[ş]/g, "s")
      .replace(/[ü]/g, "u")
      .replace(/[^a-z0-9]/g, "");
  }, []);
  const normalizeVasitaSlug = useCallback((rawSlug?: string, rawName?: string) => {
    const slug = normalizeVehicleToken(String(rawSlug || ""));
    const name = normalizeVehicleToken(String(rawName || ""));
    const has = (v: string) => slug.includes(v) || name.includes(v);
    if (has("marka")) return "marka";
    if (has("model") && !has("modelyili")) return "model";
    if (slug === "seri" || name === "seri" || has("motorseri")) return "seri";
    if (has("paket") || has("donanim") || has("trim")) return "paket";
    return rawSlug || "";
  }, [normalizeVehicleToken]);
  const attrs = formData.attributes || {};
  const brandSource = attrs["marka"];
  const modelSource = attrs["model"];
  const seriesSource = attrs["seri"];
  const brandList = useMemo(() => {
    const arr = Array.isArray(brandSource)
      ? brandSource.map((b: any) => String(b))
      : brandSource
        ? [String(brandSource)]
        : [];
    const filtered = arr.filter((v: string) => v.trim());
    return filtered;
  }, [brandSource]);
  const modelList = useMemo(() => {
    const arr = Array.isArray(modelSource)
      ? modelSource.map((m: any) => String(m))
      : modelSource
        ? [String(modelSource)]
        : [];
    return arr.filter((v: string) => v.trim());
  }, [modelSource]);
  const seriesList = useMemo(() => {
    const arr = Array.isArray(seriesSource)
      ? seriesSource.map((s: any) => String(s))
      : seriesSource
        ? [String(seriesSource)]
        : [];
    return arr.filter((v: string) => v.trim());
  }, [seriesSource]);
  const brandKey = brandList.join("|");
  const modelKey = modelList.join("|");
  const seriesKey = seriesList.join("|");

  const [attributeFields, setAttributeFields] = useState<AttributeField[]>([]);
  const [attributeLoading, setAttributeLoading] = useState(false);
  const [attributeLoadError, setAttributeLoadError] = useState<string | null>(null);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<string[]>([]);
  const [trimOptions, setTrimOptions] = useState<string[]>([]);
  const [modelLoading, setModelLoading] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [trimLoading, setTrimLoading] = useState(false);
  const prevBrandRef = useRef<string | null>(null);
  const prevModelRef = useRef<string | null>(null);
  const prevSeriesRef = useRef<string | null>(null);

  const router = useRouter();
  const editId = sp.get("editId") || sp.get("edit");

  useEffect(() => {
    if (!editId) return;
    
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/talep?id=${editId}`);
        if (res.ok) {
          const data = await res.json();
          const attrs = data.attributes || {};
          setFormData({
            title: data.title,
            description: data.description,
            category: data.category.slug,
            subcategory: data.subCategory?.slug || '',
            city: data.location.city,
            district: data.location.district,
            neighborhood: attrs.mahalle ? String(attrs.mahalle) : '',
            minBudget: attrs.minPrice ? String(attrs.minPrice) : '',
            budget: attrs.maxPrice ? String(attrs.maxPrice) : (data.price ? String(data.price) : ''),
            images: data.images || [],
            attributes: attrs || {},
          });
        } else {
          toast({ title: 'Hata', description: 'Talep bilgileri yüklenemedi', variant: 'destructive' });
        }
      } catch (e) {
        console.error(e);
        toast({ title: 'Hata', description: 'Bir hata oluştu', variant: 'destructive' });
      }
    };
    
    fetchListing();
  }, [editId]);


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
    if (!formData.category && categories?.length) {
      setFormData(prev => ({ ...prev, category: defaultCategory || categories[0].slug }));
    }
  }, [categories, defaultCategory, formData.category]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!formData.category) {
        if (active) {
          setAttributeFields([]);
          setAttributeLoading(false);
          setAttributeLoadError(null);
        }
        return;
      }
      setAttributeLoading(true);
      setAttributeLoadError(null);
      try {
        const qs = formData.subcategory ? `?subcategory=${encodeURIComponent(formData.subcategory)}` : "";
        const res = await fetch(`/api/categories/${formData.category}/attributes${qs}`);
        if (!res.ok) throw new Error("load-failed");
        const data = await res.json();
        const slugMap = new Map<string, string>();
        const mapped = Array.isArray(data)
          ? data
              .filter((a) => a?.showInRequest !== false)
              .map((a) => {
                let options: string[] | undefined;
                if (Array.isArray(a.optionsJson)) {
                  options = a.optionsJson.map((o: any) => String(o));
                } else if (typeof a.optionsJson === "string") {
                  try {
                    const parsed = JSON.parse(a.optionsJson);
                    if (Array.isArray(parsed)) options = parsed.map((o: any) => String(o));
                  } catch {
                    options = a.optionsJson.split(",").map((s: string) => s.trim()).filter(Boolean);
                  }
                }
                const normalizedSlug = isVasita ? normalizeVasitaSlug(a.slug, a.name) : a.slug;
                if (isVasita && a.slug && normalizedSlug && normalizedSlug !== a.slug) {
                  slugMap.set(a.slug, normalizedSlug);
                }
                return {
                  id: a.id,
                  name: a.name,
                  slug: normalizedSlug || a.slug,
                  type: a.type,
                  options,
                  required: a.required,
                  minKey: a.minKey,
                  maxKey: a.maxKey,
                  min: a.min,
                  max: a.max,
                  minLabel: a.minLabel,
                  maxLabel: a.maxLabel,
                } as AttributeField;
              })
          : [];
        if (active) {
          setAttributeFields(mapped);
          if (mapped.length === 0) {
            setFormData((prev) => {
              if (!prev.attributes || Object.keys(prev.attributes).length === 0) return prev;
              return { ...prev, attributes: {} };
            });
          } else {
            const allowed = new Set<string>();
            mapped.forEach((f) => {
              if (f.type === "range-number") {
                const minKey = f.minKey || `${f.slug}Min`;
                const maxKey = f.maxKey || `${f.slug}Max`;
                allowed.add(minKey);
                allowed.add(maxKey);
              } else {
                allowed.add(f.slug);
              }
            });
            setFormData((prev) => {
              const current = prev.attributes || {};
              const next: Record<string, any> = {};
              let changed = false;
              for (const [k, v] of Object.entries(current)) {
                const mappedKey = slugMap.get(k) || k;
                if (mappedKey !== k) changed = true;
                if (allowed.has(mappedKey)) {
                  next[mappedKey] = v;
                } else {
                  changed = true;
                }
              }
              if (!changed && Object.keys(next).length === Object.keys(current).length) return prev;
              return { ...prev, attributes: next };
            });
          }
        }
      } catch {
        if (active) {
          setAttributeFields([]);
          setAttributeLoadError("Özellikler yüklenemedi");
        }
      } finally {
        if (active) setAttributeLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [formData.category, formData.subcategory, isVasita, normalizeVasitaSlug]);

  useEffect(() => {
    if (!isVasita) {
      prevBrandRef.current = null;
      prevModelRef.current = null;
      prevSeriesRef.current = null;
      setModelOptions([]);
      setSeriesOptions([]);
      setTrimOptions([]);
      return;
    }
    if (prevBrandRef.current !== null && prevBrandRef.current !== brandKey) {
      setFormData((prev) => {
        const current = prev.attributes || {};
        const next = { ...current };
        let changed = false;
        if (next.model !== undefined) { delete next.model; changed = true; }
        if (next.seri !== undefined) { delete next.seri; changed = true; }
        if (next.paket !== undefined) { delete next.paket; changed = true; }
        return changed ? { ...prev, attributes: next } : prev;
      });
    }
    if (prevModelRef.current !== null && prevModelRef.current !== modelKey) {
      setFormData((prev) => {
        const current = prev.attributes || {};
        const next = { ...current };
        let changed = false;
        if (next.seri !== undefined) { delete next.seri; changed = true; }
        if (next.paket !== undefined) { delete next.paket; changed = true; }
        return changed ? { ...prev, attributes: next } : prev;
      });
    }
    if (prevSeriesRef.current !== null && prevSeriesRef.current !== seriesKey) {
      setFormData((prev) => {
        const current = prev.attributes || {};
        const next = { ...current };
        let changed = false;
        if (next.paket !== undefined) { delete next.paket; changed = true; }
        return changed ? { ...prev, attributes: next } : prev;
      });
    }
    prevBrandRef.current = brandKey;
    prevModelRef.current = modelKey;
    prevSeriesRef.current = seriesKey;
  }, [isVasita, brandKey, modelKey, seriesKey]);

  useEffect(() => {
    let active = true;
    
    // Doğrudan categorySlug kontrolü yapalım
    const isVehicleCategory = isVasita;
    
    if (!isVehicleCategory || brandList.length === 0) {
      setModelOptions([]);
      setModelLoading(false);
      return;
    }
    setModelLoading(true);
    const params = new URLSearchParams();
    params.set("type", "models");
    params.set("category", categorySlug || "");
    brandList.forEach((b) => params.append("brand", b));
    fetch(`/api/vehicle-data?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!active) return;
        setModelOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setModelOptions([]);
      })
      .finally(() => {
        if (active) setModelLoading(false);
      });
    return () => { active = false; };
  }, [categorySlug, brandKey, brandList, isVasita]);

  useEffect(() => {
    let active = true;
    
    // Doğrudan categorySlug kontrolü yapalım - isVasita closure sorunu var
    const isVehicleCategory = isVasita;
    
    if (!isVehicleCategory || brandList.length === 0 || modelList.length === 0) {
      setSeriesOptions([]);
      setSeriesLoading(false);
      return;
    }
    setSeriesLoading(true);
    const params = new URLSearchParams();
    params.set("type", "series");
    params.set("category", categorySlug || "");
    brandList.forEach((b) => params.append("brand", b));
    modelList.forEach((m) => params.append("model", m));
    fetch(`/api/vehicle-data?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!active) return;
        setSeriesOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setSeriesOptions([]);
      })
      .finally(() => {
        if (active) setSeriesLoading(false);
      });
    return () => { active = false; };
  }, [categorySlug, brandKey, modelKey, brandList, modelList, isVasita]);

  useEffect(() => {
    let active = true;
    
    // Doğrudan categorySlug kontrolü yapalım - isVasita closure sorunu var
    const isVehicleCategory = isVasita;
    
    if (!isVehicleCategory || brandList.length === 0 || modelList.length === 0 || seriesList.length === 0) {
      setTrimOptions([]);
      setTrimLoading(false);
      return;
    }
    setTrimLoading(true);
    const params = new URLSearchParams();
    params.set("type", "trims");
    params.set("category", categorySlug || "");
    brandList.forEach((b) => params.append("brand", b));
    modelList.forEach((m) => params.append("model", m));
    seriesList.forEach((s) => params.append("series", s));
    fetch(`/api/vehicle-data?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!active) return;
        setTrimOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setTrimOptions([]);
      })
      .finally(() => {
        if (active) setTrimLoading(false);
      });
    return () => { active = false; };
  }, [categorySlug, brandKey, modelKey, seriesKey, brandList, modelList, seriesList, isVasita]);

  useEffect(() => {
    // Recursive validation helper
    const isValidSubcategory = (items: SubCategory[], slug: string): boolean => {
      if (!slug) return false;
      return items.some(item => {
        if (item.slug === slug || item.fullSlug === slug) return true;
        if (item.subcategories && item.subcategories.length > 0) {
          return isValidSubcategory(item.subcategories, slug);
        }
        return false;
      });
    };

    const valid = isValidSubcategory(subcats, formData.subcategory);
    
    if (!valid && formData.subcategory) {
       // If currently selected subcategory is NOT in the tree at all, reset to first available.
       // But if subcategory is empty, we might want to auto-select ONLY if it's a flat list?
       // For Emlak, we don't want to auto-select 'konut' necessarily, or maybe we do.
       // But crucial fix is: don't reset if it IS valid deeply.
       
       // If valid is false, it means slug is not found anywhere in the tree.
       if (formData.subcategory !== "") {
          setFormData(prev => ({ ...prev, subcategory: "" }));
       }
    }

    // Generic default image logic
    if (formData.subcategory || formData.category) {
      setFormData(prev => {
        const defaultPath = getSubcategoryImage(formData.subcategory, formData.category);
        
        // Case 1: No images -> Set default
        if (prev.images.length === 0) {
          return { ...prev, images: [defaultPath] };
        }
        
        // Case 2: Has images, check if it's a default image (starts with /images/defaults/)
        // If so, update it to the new subcategory's default
        const firstImage = prev.images[0];
        if ((firstImage.startsWith('/images/defaults/') || firstImage.startsWith('/images/subcategories/') || firstImage.startsWith('/images/placeholder-')) && firstImage !== defaultPath) {
           return { ...prev, images: [defaultPath, ...prev.images.slice(1)] };
        }
        
        return prev;
      });
    }
  }, [formData.category, formData.subcategory, subcats]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorSummary, setErrorSummary] = useState<string[]>([]);
  const attributeLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    attributeFields.forEach((f) => {
      const base = f.name || f.slug;
      if (f.type === "range-number") {
        const minKey = f.minKey || `${f.slug}Min`;
        const maxKey = f.maxKey || `${f.slug}Max`;
        map[`attr:${minKey}`] = `${base} ${f.minLabel || "Min"}`;
        map[`attr:${maxKey}`] = `${base} ${f.maxLabel || "Max"}`;
      } else {
        map[`attr:${f.slug}`] = base;
      }
    });
    return map;
  }, [attributeFields]);

  const validateStep = useCallback((step: number, data: FormData = formData): boolean => {
    try {
      const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!data.category) newErrors.category = 'Lütfen kategori seçiniz';
      if (!data.subcategory) newErrors.subcategory = 'Lütfen alt kategori seçiniz';
    }

    if (step === 2) {
      if (!data.title?.trim()) {
        newErrors.title = 'Lütfen başlık giriniz';
      }
      else if ((data.title?.trim().length || 0) < 10) {
        newErrors.title = 'Başlık en az 10 karakter olmalıdır';
      }
      
      if (!data.description?.trim()) {
        newErrors.description = 'Lütfen açıklama giriniz';
      }
      else if ((data.description?.trim().length || 0) < 20) {
        newErrors.description = 'Açıklama en az 20 karakter olmalıdır';
      }
      if (attributeFields.length > 0) {
        const attrs = data.attributes || {};
        for (const field of attributeFields) {
          if (field.type !== "range-number") continue;
          const minKey = field.minKey || `${field.slug}Min`;
          const maxKey = field.maxKey || `${field.slug}Max`;
          const minVal = attrs[minKey];
          const maxVal = attrs[maxKey];
          const hasMin = minVal !== undefined && String(minVal).trim() !== "";
          const hasMax = maxVal !== undefined && String(maxVal).trim() !== "";
          if (hasMin && hasMax) {
            const a = Number(minVal);
            const b = Number(maxVal);
            if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
              newErrors[`attr:${minKey}`] = 'Minimum değer maksimumdan büyük olamaz';
              newErrors[`attr:${maxKey}`] = 'Maksimum değer minimumdan küçük olamaz';
            }
          }
        }
      }
    }

    if (step === 3) {
    if (!data.city?.trim()) newErrors.city = 'Lütfen şehir seçiniz';
    if (!data.district?.trim()) newErrors.district = 'Lütfen ilçe seçiniz';
    if (data.category === 'emlak' && !data.neighborhood?.trim()) newErrors.neighborhood = 'Lütfen mahalle seçiniz';
    if (!data.minBudget) newErrors.minBudget = 'Lütfen minimum bütçe giriniz';
    else if (parseInt(data.minBudget) < 0) newErrors.minBudget = 'Minimum bütçe 0 TL veya daha fazla olmalıdır';
    if (!data.budget) newErrors.budget = 'Lütfen maksimum bütçe giriniz';
    else if (parseInt(data.budget) < 1) newErrors.budget = 'Maksimum bütçe 1 TL veya daha fazla olmalıdır';
    if (data.minBudget && data.budget) {
      const a = parseInt(data.minBudget);
      const b = parseInt(data.budget);
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        newErrors.minBudget = 'Minimum bütçe maksimum bütçeden büyük olamaz';
        newErrors.budget = 'Maksimum bütçe minimum bütçeden küçük olamaz';
      }
    }
  }

    setErrors(newErrors);

    // Hata özeti oluştur
    const items = Object.keys(newErrors);
    const labels: Record<string,string> = { 
      category:'Kategori', 
      subcategory:'Alt kategori', 
      title:'Başlık', 
      description:'Açıklama', 
      city:'İl', 
      district:'İlçe', 
      neighborhood:'Mahalle',
      minBudget:'Minimum bütçe', 
      budget:'Maksimum bütçe'
    };

    const detailedErrors = items.map(k => {
      const fieldLabel = labels[k] || attributeLabelMap[k] || k;
      const errorMsg = newErrors[k];
      
      if (errorMsg.includes('En az') || errorMsg.includes('En çok') || errorMsg.includes('Minimum') || errorMsg.includes('Maksimum')) {
        return `${fieldLabel}: ${errorMsg}`;
      }
      
      return fieldLabel;
    });
    
    setErrorSummary(detailedErrors);

    return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Error in validateStep:', error);
      return false;
    }
  }, [formData, attributeFields, attributeLabelMap]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = 'Lütfen kategori seçiniz';
    if (!formData.subcategory) newErrors.subcategory = 'Lütfen alt kategori seçiniz';
    if (!formData.title?.trim()) newErrors.title = 'Lütfen başlık giriniz';
    else if ((formData.title?.trim().length || 0) < 10) newErrors.title = 'Başlık en az 10 karakter olmalıdır';
    if (!formData.description?.trim()) newErrors.description = 'Lütfen açıklama giriniz';
    else if ((formData.description?.trim().length || 0) < 20) newErrors.description = 'Açıklama en az 20 karakter olmalıdır';
    if (!formData.city?.trim()) newErrors.city = 'Lütfen şehir seçiniz';
    if (!formData.district?.trim()) newErrors.district = 'Lütfen ilçe seçiniz';
    if (!formData.minBudget) newErrors.minBudget = 'Lütfen minimum bütçe giriniz';
    else if (parseInt(formData.minBudget) < 0) newErrors.minBudget = 'Minimum bütçe 0 TL veya daha fazla olmalıdır';
    if (!formData.budget) newErrors.budget = 'Lütfen maksimum bütçe giriniz';
    else if (parseInt(formData.budget) < 1) newErrors.budget = 'Maksimum bütçe 1 TL veya daha fazla olmalıdır';
    if (formData.minBudget && formData.budget) {
      const a = parseInt(formData.minBudget);
      const b = parseInt(formData.budget);
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        newErrors.minBudget = 'En düşük, En yüksek’ten büyük olamaz';
        newErrors.budget = 'En yüksek, En düşük’ten küçük olamaz';
      }
    }
    if (attributeFields.length > 0) {
      const attrs = formData.attributes || {};
      for (const field of attributeFields) {
        if (field.type !== "range-number") continue;
        const minKey = field.minKey || `${field.slug}Min`;
        const maxKey = field.maxKey || `${field.slug}Max`;
        const minVal = attrs[minKey];
        const maxVal = attrs[maxKey];
        const hasMin = minVal !== undefined && String(minVal).trim() !== "";
        const hasMax = maxVal !== undefined && String(maxVal).trim() !== "";
        if (hasMin && hasMax) {
          const a = Number(minVal);
          const b = Number(maxVal);
          if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
            newErrors[`attr:${minKey}`] = 'Minimum değer maksimumdan büyük olamaz';
            newErrors[`attr:${maxKey}`] = 'Maksimum değer minimumdan küçük olamaz';
          }
        }
      }
    }
    setErrors(newErrors);
    const items = Object.keys(newErrors);
    const labels: Record<string,string> = { 
      category:'Kategori', 
      subcategory:'Alt kategori', 
      title:'Başlık', 
      description:'Açıklama', 
      city:'İl', 
      district:'İlçe', 
      minBudget:'Minimum bütçe', 
      budget:'Maksimum bütçe'
    };
 
    const detailedErrors = items.map(k => {
      const fieldLabel = labels[k] || attributeLabelMap[k] || k;
      const errorMsg = newErrors[k];
      
      if (errorMsg.includes('En az') || errorMsg.includes('En çok') || errorMsg.includes('Minimum') || errorMsg.includes('Maksimum')) {
        return `${fieldLabel}: ${errorMsg}`;
      }
      
      return fieldLabel;
    });
    
    setErrorSummary(detailedErrors);
    return items.length === 0;
  }, [formData, attributeFields, attributeLabelMap]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => {
      if (field === 'category') {
        if (prev.category === value) return prev;
        return { ...prev, category: value, subcategory: '', subcategoryFullSlug: undefined, images: [], attributes: {} };
      }
      if (field === 'subcategory') {
        if (prev.subcategory === value) return prev;
        return { ...prev, subcategory: value, subcategoryFullSlug: undefined, attributes: {} };
      }
      return { ...prev, [field]: value };
    });

    if (field === 'category' || field === 'subcategory') {
      if (Object.keys(errors).length) setErrors({});
      if (errorSummary.length) setErrorSummary([]);
      return;
    }

    if (errors[field as string]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field as string];
        return n;
      });
    }
  }, [errors, errorSummary]);

  const updateAttribute = useCallback((key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      attributes: { ...(prev.attributes || {}), [key]: value },
    }));
    const errKey = `attr:${key}`;
    if (errors[errKey]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[errKey];
        return n;
      });
    }
    if (errorSummary.length) setErrorSummary([]);
  }, [errors, errorSummary]);

  const nextStep = useCallback((overrideData?: Partial<FormData>) => {
    try {
      const currentData = { ...formData, ...overrideData };
      const isValid = validateStep(currentStep, currentData);
      
      if (isValid && currentStep < STEPS.length) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast({ title: 'Eksik alanlar', description: 'Lütfen yukarıdaki eksik alanları kontrol ediniz.', variant: 'destructive' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error in nextStep:', error);
      toast({ title: 'Hata', description: 'Bir hata oluştu. Lütfen tekrar deneyiniz.', variant: 'destructive' });
    }
  }, [validateStep, currentStep, formData]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleAdCreate = useCallback(async () => {
    const ok = validateAll();
    if (!ok) {
      toast({ title: 'Eksik alanlar', description: 'Lütfen yukarıdaki eksik alanları kontrol ediniz.', variant: 'destructive' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    try {
      toast({
        title: editId ? "İlan güncelleniyor..." : "İlanınız oluşturuluyor...",
        description: "Lütfen bekleyiniz",
        variant: "info",
      });

      const url = editId ? `/api/talep?id=${editId}` : '/api/talep-olustur';
      const method = editId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
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
          budget: formData.budget ? String(parseInt(formData.budget)) : '',
          images: formData.images,
          attributes: {
            ...Object.fromEntries(
              Object.entries(formData.attributes || {}).filter(([, v]) => {
                if (Array.isArray(v)) return v.length > 0;
                if (typeof v === "boolean") return true;
                if (typeof v === "number") return !Number.isNaN(v);
                if (v === null || v === undefined) return false;
                if (typeof v === "string") return v.trim() !== "";
                return true;
              })
            ),
            ...(formData.minBudget ? { minPrice: parseInt(formData.minBudget) } : {}),
            ...(formData.budget ? { maxPrice: parseInt(formData.budget) } : {}),
            ...(formData.category === 'emlak' && formData.neighborhood?.trim() ? { mahalle: formData.neighborhood.trim() } : {}),
          }
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const listingCode = result?.data?.code;
        const listingId = result?.data?.id;
        const successText = result.message || (editId ? 'Talep başarıyla güncellendi!' : 'Talebiniz başarıyla oluşturuldu!');
        const codeText = !editId && (listingCode || listingId) ? ` Talep No: ${listingCode || listingId}` : '';
        toast({
          title: "Başarılı!",
          description: `${successText}${codeText}`,
          variant: "success",
        });
        
        const callbackUrl = sp.get('callbackUrl');
        if (editId) {
          router.push(callbackUrl || '/profil');
        } else {
          const nextPath = listingCode || listingId ? `/talep/${listingCode || listingId}` : '/';
          router.push(nextPath);
        }
      } else {
        toast({
          title: "Hata!",
          description: result.error || "İşlem başarısız oldu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Hata!",
        description: "Bir sorun oluştu. Lütfen tekrar deneyiniz.",
        variant: "destructive",
      });
    }
  }, [formData, validateAll, editId, router, sp]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < STEPS.length) {
      nextStep();
    }
    // Son adımda enter ile submit olmasını engelliyoruz.
    // Kullanıcı butona tıklamalı.
  }, [currentStep, nextStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CategorySelection formData={formData} errors={errors} updateFormData={updateFormData} subcats={subcats} categories={categories} />;
      case 2:
        return <DetailsStep formData={formData} errors={errors} updateFormData={updateFormData} categories={categories} attributeFields={attributeFields} attributeLoading={attributeLoading} attributeLoadError={attributeLoadError} updateAttribute={updateAttribute} modelOptions={modelOptions} seriesOptions={seriesOptions} trimOptions={trimOptions} modelLoading={modelLoading} seriesLoading={seriesLoading} trimLoading={trimLoading} />;
      case 3:
        return <LocationBudgetStep formData={formData} errors={errors} updateFormData={updateFormData} />;
      case 4:
        return <ReviewStep formData={formData} categories={categories} attributeFields={attributeFields} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-cyan-900 to-blue-900 mb-3 drop-shadow-sm">
            {editId ? 'Talebi Düzenle' : 'Yeni Talep Oluştur'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            {editId ? 'Talep detaylarınızı güncelleyerek daha iyi teklifler alın' : 'İhtiyacınızı detaylandırın, satıcılar size en uygun teklifleri sunsun'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 border border-white/50 overflow-hidden ring-1 ring-gray-900/5">
          <div className="p-6 sm:p-10">
            {errorSummary?.length > 0 && (
              <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-800 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-red-100/50">
                <div className="flex-shrink-0 p-2 bg-red-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 py-1">
                  <h4 className="font-bold text-base mb-2">⚠️ Lütfen eksik alanları doldurunuz:</h4>
                  <div className="space-y-1.5">
                    {errorSummary.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm font-medium">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-red-200"></span>
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200/60">
                    <p className="text-xs text-red-700 font-semibold">
                      💡 Tüm zorunlu alanları doldurduktan sonra devam edebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-3 sm:mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50/50 px-4 py-3 sm:py-3.5 text-sm font-semibold text-cyan-900">
              <span className="text-cyan-700">Kategori:</span>
              {selectedCategoryName ? (
                <>
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-cyan-900 shadow-sm">
                    {selectedCategoryName}
                  </span>
                  {selectedSubcategoryPath.length > 0 ? (
                    selectedSubcategoryPath.map((item, index) => (
                      <div key={`${item.fullSlug || item.slug}:${index}`} className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-cyan-400" />
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-cyan-900 shadow-sm">
                          {titleCaseTR(item.name)}
                        </span>
                      </div>
                    ))
                  ) : selectedSubcategoryName ? (
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-cyan-400" />
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-cyan-900 shadow-sm">
                        {selectedSubcategoryName}
                      </span>
                    </div>
                  ) : null}
                </>
              ) : (
                <span className="rounded-full bg-white px-3 py-1 text-xs text-cyan-900 shadow-sm">
                  Seçilmedi
                </span>
              )}
            </div>

            <StepIndicator currentStep={currentStep} />

            <form onSubmit={handleSubmit} className="mt-10">
              {renderStep()}
              
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`
                    flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 w-full sm:w-auto
                    ${currentStep === 1 
                      ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-lg hover:shadow-gray-200/50 border border-transparent hover:border-gray-100'
                    }
                  `}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Geri Dön
                </button>

                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => nextStep()}
                    className="group relative flex items-center justify-center gap-2 px-10 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 overflow-hidden w-full sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Devam Et
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAdCreate}
                    className="group relative flex items-center justify-center gap-2 px-10 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-semibold hover:from-emerald-500 hover:to-green-500 transition-all duration-300 shadow-xl shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-1 overflow-hidden w-full sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {editId ? 'İlanı Güncelle' : 'İlanı Yayınla'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
          <Info className="w-4 h-4" />
          <p>Varsagel güvenli ihtiyaç bulma platformu • Tüm hakları saklıdır</p>
        </div>
      </div>
    </div>
  );
}

export default function TalepForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Yükleniyor...</p>
        </div>
      </div>
    }>
      <TalepOlusturPage />
    </Suspense>
  );
}
