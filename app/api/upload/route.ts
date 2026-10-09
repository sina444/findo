import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink, stat } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    let files: { url: string; name: string; size: number }[] = [];
    try {
      const entries = await readdir(uploadDir);
      for (const entry of entries) {
        const filePath = path.join(uploadDir, entry);
        const stats = await stat(filePath);
        if (stats.isFile()) {
          files.push({ url: `/uploads/${entry}`, name: entry, size: stats.size });
        }
      }
    } catch { /* directory doesn't exist yet */ }
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || !url.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'آدرس نامعتبر' }, { status: 400 });
    }
    const filePath = path.join(process.cwd(), 'public', url.replace('/uploads/', ''));
    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'حذف ناموفق بود' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'فایلی ارسال نشده است' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles: { url: string; name: string; size: number }[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `فرمت ${file.name} مجاز نیست` }, { status: 400 });
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `حجم ${file.name} بیش از ۵ مگابایت است` }, { status: 400 });
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      uploadedFiles.push({
        url: `/uploads/${fileName}`,
        name: file.name,
        size: file.size,
      });
    }

    return NextResponse.json({ files: uploadedFiles }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'بارگذاری ناموفق بود' }, { status: 500 });
  }
}
