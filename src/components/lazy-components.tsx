import dynamic from 'next/dynamic';

// Lazy load heavy components
export const TalepCard = dynamic(
  () => import('@/components/home/TalepCardOptimized').then(mod => mod.default),
  { 
    loading: () => <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      <div className="h-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>,
    ssr: false 
  }
);
