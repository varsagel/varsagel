import hierarchyData from '@/data/vehicle-hierarchy.json';

// Type definitions
type Hierarchy = {
    [category: string]: {
        [brand: string]: {
            [model: string]: {
                [seri: string]: string[] // Packages
            }
        }
    }
};

const hierarchy = hierarchyData as Hierarchy;

export default function AutomobileDataTest() {
  const otomobilData = hierarchy['otomobil'] || {};
  const brands = Object.keys(otomobilData).sort((a, b) => a.localeCompare(b, 'tr'));
  
  // Statistics
  const totalBrands = brands.length;
  let totalModels = 0;
  let totalSeries = 0;
  let totalPackages = 0;

  brands.forEach(brand => {
      const models = otomobilData[brand] || {};
      totalModels += Object.keys(models).length;
      Object.values(models).forEach(seriesMap => {
          totalSeries += Object.keys(seriesMap).length;
          Object.values(seriesMap).forEach(packages => {
              if (Array.isArray(packages)) {
                  totalPackages += packages.length;
              }
          });
      });
  });

  // Sample data for demonstration
  const sampleBrands = brands.slice(0, 10);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Otomobil Veri Entegrasyonu Testi</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Veri Özeti</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Toplam Marka</h3>
            <p className="text-2xl font-bold text-blue-600">{totalBrands}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Toplam Model</h3>
            <p className="text-2xl font-bold text-green-600">{totalModels}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Toplam Seri</h3>
            <p className="text-2xl font-bold text-purple-600">{totalSeries}</p>
          </div>
          <div className="bg-orange-100 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800">Toplam Paket</h3>
            <p className="text-2xl font-bold text-orange-600">{totalPackages}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Örnek Marka-Model Hiyerarşisi</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          {sampleBrands.map(brand => {
            const models = Object.keys(otomobilData[brand] || {});
            const displayModels = models.slice(0, 3);
            
            return (
              <div key={brand} className="mb-4">
                <h3 className="font-semibold text-lg text-gray-800">{brand}</h3>
                <div className="ml-4">
                  {displayModels.map(model => {
                    const seriesMap = otomobilData[brand][model] || {};
                    const series = Object.keys(seriesMap);
                    
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
                  {models.length > 3 && (
                    <p className="text-sm text-gray-500 ml-4">
                      +{models.length - 3} daha fazla model...
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
          Bu veriler vehicle-hierarchy.json dosyasından okunmaktadır. 
          Toplam {totalBrands} marka, {totalModels} model, {totalSeries} seri ve {totalPackages} paket içermektedir.
        </p>
      </div>
    </div>
  );
}
