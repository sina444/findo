'use client';

import { useEffect, useState, useCallback } from 'react';
import { Upload, Trash2, Copy, Check, Image as ImageIcon } from 'lucide-react';

interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

export default function AdminImagesPage() {
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [error, setError] = useState('');

  const loadImages = useCallback(async () => {
    try {
      const res = await fetch('/api/upload', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setImages(data.files || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadImages(); }, [loadImages]);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    setError('');
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'بارگذاری ناموفق بود');
      } else {
        loadImages();
      }
    } catch {
      setError('خطای اتصال');
    }
    setUploading(false);
  };

  const handleDelete = async (url: string) => {
    if (!confirm('آیا از حذف این تصویر مطمئن هستید؟')) return;
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      loadImages();
    } catch { /* ignore */ }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#20251F]">گالری تصاویر</h1>
        <p className="mt-1 text-sm text-[#687067]">تصاویر سایت را بارگذاری و مدیریت کنید</p>
      </div>

      {/* Upload area */}
      <div className="mb-6">
        <label
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#AFC8A8] bg-white p-8 transition-colors hover:border-[#3F6B45] hover:bg-[#F7F5EC]"
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) handleUpload(e.dataTransfer.files); }}
        >
          <Upload className={`h-10 w-10 text-[#3F6B45] ${uploading ? 'animate-bounce' : ''}`} />
          <p className="mt-3 text-sm font-medium text-[#20251F]">
            {uploading ? 'در حال بارگذاری...' : 'فایل‌ها را اینجا بکشید یا کلیک کنید'}
          </p>
          <p className="mt-1 text-xs text-[#687067]">فرمت: JPG, PNG, WebP, GIF, SVG — حداکثر ۵ مگابایت</p>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </label>
        {error && <div className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
      </div>

      {/* Images grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-white/60" />)}
        </div>
      ) : (
        <>
          {images.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <ImageIcon className="h-10 w-10 text-[#AFC8A8]" />
              <p className="mt-2 text-sm text-[#687067]">تصویری بارگذاری نشده است</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {images.map((img) => (
                <div key={img.url} className="group relative overflow-hidden rounded-xl border border-[#E8F0E5] bg-white">
                  <div className="aspect-square bg-[#F7F5EC]">
                    <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs text-[#687067]">{img.name}</p>
                    <p className="text-xs text-[#687067]">{formatSize(img.size)}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => copyUrl(img.url)}
                      className="rounded-lg bg-white p-2 text-[#20251F] hover:bg-[#F7F5EC]"
                      title="کپی آدرس"
                    >
                      {copiedUrl === img.url ? <Check className="h-4 w-4 text-[#3F6B45]" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(img.url)}
                      className="rounded-lg bg-white p-2 text-red-500 hover:bg-red-50"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
