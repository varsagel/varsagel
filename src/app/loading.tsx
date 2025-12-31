export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Yükleniyor...</p>
      </div>
    </div>
  );
}
