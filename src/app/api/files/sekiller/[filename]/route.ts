import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import mime from 'mime';

const STORAGE_DIR = path.join(process.cwd(), './storage/sekiller');

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // --- Təhlükəsizlik Yoxlamaları ---
  // Path traversal cəhdlərinin qarşısını alır
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse(JSON.stringify({ error: 'Keçərsiz fayl adı' }), { status: 400 });
  }

  try {
    const filePath = path.join(STORAGE_DIR, filename);

    // Faylın mövcudluğunu yoxlayır
    await fs.access(filePath);

    // Fayl üçün stream yaradır
    const stream = createReadStream(filePath);

    // MIME növünü təyin edir
    const contentType = mime.getType(filePath) || 'application/octet-stream';

    // Cache-Control başlığını təyin edir
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    // Streaming Response qaytarır
    return new NextResponse(stream as any, { status: 200, headers });

  } catch (error: any) {
    // Fayl tapılmadıqda 404 xətası qaytarır
    if (error.code === 'ENOENT') {
      return new NextResponse(JSON.stringify({ error: 'Şəkil tapılmadı' }), { status: 404 });
    }
    
    console.error('Fayl servis xətası:', error);
    return new NextResponse(JSON.stringify({ error: 'Daxili server xətası' }), { status: 500 });
  }
}
