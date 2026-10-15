'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Microscope, Upload, Trash2, ImageIcon, AlertCircle } from 'lucide-react';
import { apiGet, apiPost, apiDelete, type PlantScan, type Crop } from '@/lib/greenhouse-api';
import { PageHeader, SectionCard, Badge, EmptyState, LoadingGrid, Field, inputClass } from '@/components/admin/GreenhouseUI';

export default function PlantDoctorPage() {
  const [scans, setScans] = useState<PlantScan[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cropId, setCropId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [scanData, cropData] = await Promise.all([apiGet<PlantScan[]>('/plant-scans'), apiGet<Crop[]>('/crops')]);
      setScans(scanData); setCrops(cropData);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      // Upload the image
      const formData = new FormData();
      formData.append('file', selectedFile);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('خطا در بارگذاری تصویر');
      const { url } = await uploadRes.json();

      // Create scan record
      await apiPost('/plant-scans', {
        imageUrl: url,
        cropId: cropId || null,
        diagnosis: 'در انتظار تحلیل',
        confidence: 0,
      });

      setSelectedFile(null);
      setPreviewUrl('');
      setCropId('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (e) {
      alert('خطا در بارگذاری تصویر');
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    await apiDelete(`/plant-scans/${id}`);
    load();
  };

  return (
    <div>
      <PageHeader title="پزشک گیاه" subtitle="تشخیص بیماری‌های گیاهی از روی تصویر" />

      {loading ? <LoadingGrid /> : (
        <>
          {/* Upload section */}
          <SectionCard title="بارگذاری تصویر گیاه">
            <div className="flex flex-col items-center gap-4">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              {previewUrl ? (
                <img src={previewUrl} alt="پیش‌نمایش" className="max-h-48 rounded-lg object-contain" />
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="flex h-48 w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#AFC8A8] bg-[#F7F5EC] hover:border-[#3F6B45]">
                  <Upload className="mb-2 h-8 w-8 text-[#AFC8A8]" />
                  <p className="text-sm text-[#687067]">برای انتخاب تصویر کلیک کنید</p>
                  <p className="mt-1 text-xs text-[#AFC8A8]">از برگ، ساقه، میوه یا ریشه عکس بگیرید</p>
                </button>
              )}

              {selectedFile && (
                <div className="flex w-full max-w-md flex-col gap-3">
                  <Field label="محصول مرتبط (اختیاری)">
                    <select className={inputClass} value={cropId} onChange={e => setCropId(e.target.value)}>
                      <option value="">بدون محصول</option>
                      {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                  <button onClick={handleUpload} disabled={uploading} className="rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52] disabled:opacity-50">
                    {uploading ? 'در حال بارگذاری...' : 'بارگذاری و تحلیل'}
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">تشخیص تصویری جایگزین آزمایش تخصصی نیست. برای تشخیص قطعی با متخصص مشورت کنید.</p>
            </div>
          </SectionCard>

          {/* Scan history */}
          <SectionCard title="تاریخچه بررسی‌ها" className="mt-6">
            {scans.length === 0 ? <EmptyState title="بررسی‌ای ثبت نشده است" icon={Microscope} /> : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scans.map(scan => (
                  <div key={scan.id} className="overflow-hidden rounded-lg border border-[#E8F0E5]">
                    <div className="relative h-40 bg-[#F7F5EC]">
                      {scan.imageUrl ? <img src={scan.imageUrl} alt={scan.diagnosis || 'اسکن'} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-[#AFC8A8]" /></div>}
                      <button onClick={() => handleDelete(scan.id)} className="absolute left-2 top-2 rounded-lg bg-white/80 p-1.5 text-red-500 hover:bg-white"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-[#20251F]">{scan.diagnosis || 'بدون تشخیص'}</p>
                      {scan.confidence > 0 && <Badge color="blue">اطمینان: {scan.confidence}%</Badge>}
                      <p className="mt-1 text-xs text-[#687067]">{new Date(scan.createdAt).toLocaleDateString('fa-IR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
