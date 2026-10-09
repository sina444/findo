'use client';

import { useEffect, useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { apiGet, apiPut } from '@/lib/admin-api';

const contentGroups = [
  {
    title: 'بخش اصلی (Hero)',
    fields: [
      { key: 'hero_title', label: 'عنوان اصلی' },
      { key: 'hero_subtitle', label: 'زیرعنوان' },
      { key: 'hero_cta_primary', label: 'متن دکمه اصلی' },
      { key: 'hero_cta_secondary', label: 'متن دکمه دوم' },
    ],
  },
  {
    title: 'بنر تبلیغاتی (Promo)',
    fields: [
      { key: 'promo_badge', label: 'برچسب' },
      { key: 'promo_title', label: 'عنوان' },
      { key: 'promo_subtitle', label: 'زیرعنوان' },
      { key: 'promo_cta', label: 'متن دکمه' },
      { key: 'promo_image', label: 'تصویر (URL)' },
    ],
  },
  {
    title: 'بخش ویژگی‌ها (Why Choose Us)',
    fields: [
      { key: 'about_title', label: 'عنوان' },
      { key: 'about_subtitle', label: 'زیرعنوان' },
    ],
  },
  {
    title: 'خبرنامه',
    fields: [
      { key: 'newsletter_title', label: 'عنوان' },
      { key: 'newsletter_subtitle', label: 'زیرعنوان' },
    ],
  },
  {
    title: 'فوتر و تماس',
    fields: [
      { key: 'footer_description', label: 'توضیحات فوتر' },
      { key: 'contact_phone', label: 'شماره تماس' },
      { key: 'contact_email', label: 'ایمیل' },
      { key: 'contact_address', label: 'آدرس' },
      { key: 'social_facebook', label: 'لینک فیسبوک' },
      { key: 'social_instagram', label: 'لینک اینستاگرام' },
      { key: 'social_twitter', label: 'لینک توییتر' },
    ],
  },
];

export default function AdminContentPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiGet('/content')
      .then(data => setContent(data as Record<string, string>))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut('/content', content);
      setSaved(true);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-white/60" />)}</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#20251F]">محتوای سایت</h1>
          <p className="mt-1 text-sm text-[#687067]">متن‌ها و اطلاعات سایت را بدون نیاز به کدنویسی ویرایش کنید</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4A7D52] disabled:opacity-50">
          <Save className="h-4 w-4" />
          {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
        </button>
      </div>

      <div className="space-y-6">
        {contentGroups.map(group => (
          <div key={group.title} className="rounded-xl border border-[#E8F0E5] bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#3F6B45]" />
              <h2 className="text-sm font-semibold text-[#20251F]">{group.title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {group.fields.map(field => (
                <div key={field.key} className={field.key.includes('image') || field.key.includes('description') || field.key.includes('address') ? 'md:col-span-2' : ''}>
                  <label className="mb-1 block text-sm font-medium text-[#20251F]">{field.label}</label>
                  {field.key.includes('description') || field.key.includes('address') ? (
                    <textarea
                      value={content[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white"
                    />
                  ) : (
                    <input
                      type="text"
                      value={content[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] px-3 py-2 text-sm outline-none focus:border-[#3F6B45] focus:bg-white"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
