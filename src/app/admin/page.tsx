export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Admin Paneli (Demo)</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Bu sayfa, kullanıcı/ilan/teklif yönetimi için iskelet olarak eklenmiştir. Yetkilendirme ve veritabanı entegrasyonu sonraki adımlarda eklenecektir.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-medium">Kullanıcılar</h2>
          <p className="text-sm text-zinc-600">Toplam: —</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-medium">İlanlar</h2>
          <p className="text-sm text-zinc-600">Toplam: —</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-medium">Teklifler</h2>
          <p className="text-sm text-zinc-600">Toplam: —</p>
        </div>
      </div>
    </div>
  );
}