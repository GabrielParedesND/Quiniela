export default function SponsorBanner() {
  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-[60]">
      <div className="max-w-4xl mx-auto h-20 flex items-center justify-center p-2">
        <div className="w-full h-full bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs uppercase tracking-widest font-bold">
          <span className="bg-white px-4 py-1 rounded shadow-sm">Espacio para Marca Patrocinadora</span>
        </div>
      </div>
    </div>
  );
}
