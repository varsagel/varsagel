import { AUTOMOBILE_BRAND_MODELS, AUTOMOBILE_MODEL_SERIES } from '@/data/automobile-data';

export default function AutomobileDataTest() {
  // Sample data for demonstration
  const sampleBrands = Object.keys(AUTOMOBILE_BRAND_MODELS).slice(0, 10);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Otomobil Veri Entegrasyonu Testi</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Veri Özeti</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Toplam Marka</h3>
            <p className="text-2xl font-bold text-blue-600">{Object.keys(AUTOMOBILE_BRAND_MODELS).length}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Toplam Model</h3>
            <p className="text-2xl font-bold text-green-600">
              {Object.values(AUTOMOBILE_BRAND_MODELS).reduce((sum, models) => sum + models.length, 0)}
            </p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Toplam Seri</h3>
            <p className="text-2xl font-bold text-purple-600">
              {Object.values(AUTOMOBILE_MODEL_SERIES).reduce((brandSum: number, brandData: any) => 
                brandSum + Object.values(brandData).reduce((modelSum: number, series: any) => modelSum + series.length, 0)
              , 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Örnek Marka-Model Hiyerarşisi</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          {sampleBrands.map(brand => {
            const models = AUTOMOBILE_BRAND_MODELS[brand as keyof typeof AUTOMOBILE_BRAND_MODELS]?.slice(0, 3) || [];
            return (
              <div key={brand} className="mb-4">
                <h3 className="font-semibold text-lg text-gray-800">{brand}</h3>
                <div className="ml-4">
                  {models.map(model => {
                    const series = (AUTOMOBILE_MODEL_SERIES as any)[brand]?.[model] || [];
                    return (
                      <div key={model} className="mb-2">
                        <span className="font-medium text-gray-700">{model}</span>
                        {series.length > 0 && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({series.slice(0, 3).join(', ')}${series.length > 3 ? '...' : ''})
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {AUTOMOBILE_BRAND_MODELS[brand as keyof typeof AUTOMOBILE_BRAND_MODELS]?.length > 3 && (
                    <p className="text-sm text-gray-500 ml-4">
                      +{AUTOMOBILE_BRAND_MODELS[brand as keyof typeof AUTOMOBILE_BRAND_MODELS].length - 3} daha fazla model...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Veri Kaynağı</h3>
        <p className="text-yellow-700">
          Bu veriler sahibinden_data_full.xlsx dosyasından otomatik olarak işlenmiştir. 
          Toplam {Object.keys(AUTOMOBILE_BRAND_MODELS).length} marka, {Object.values(AUTOMOBILE_BRAND_MODELS).reduce((sum, models) => sum + models.length, 0)} model ve 
          {Object.values(AUTOMOBILE_MODEL_SERIES).reduce((brandSum: number, brandData: any) => 
            brandSum + Object.values(brandData).reduce((modelSum: number, series: any) => modelSum + series.length, 0)
          , 0)} seri içermektedir.
        </p>
      </div>
    </div>
  );
}