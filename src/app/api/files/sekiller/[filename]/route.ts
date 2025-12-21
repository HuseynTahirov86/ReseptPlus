import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import mime from 'mime';

const STORAGE_DIR = path.join(process.cwd(), './storage/sekiller');

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string | null {
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return null;
  }
  return filename;
}


// GET /api/files/sekiller/[filename] - Serves a single file
export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = sanitizeFilename(params.filename);
  if (!filename) {
      return NextResponse.json({ error: 'Keçərsiz fayl adı' }, { status: 400 });
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
      return NextResponse.json({ error: 'Şəkil tapılmadı' }, { status: 404 });
    }
    
    console.error('Fayl servis xətası:', error);
    return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 });
  }
}

// DELETE /api/files/sekiller/[filename] - Deletes a single file
export async function DELETE(
    req: NextRequest,
    { params }: { params: { filename: string } }
) {
    const filename = sanitizeFilename(params.filename);
    if (!filename) {
        return NextResponse.json({ error: 'Keçərsiz fayl adı' }, { status: 400 });
    }

    try {
        const filePath = path.join(STORAGE_DIR, filename);

        // Faylın mövcudluğunu yoxlayır
        await fs.access(filePath);

        // Faylı silir
        await fs.unlink(filePath);
        
        console.log(`Fayl silindi: ${filePath}`);

        return NextResponse.json({ message: 'Fayl uğurla silindi' }, { status: 200 });

    } catch (error: any) {
         if (error.code === 'ENOENT') {
            return NextResponse.json({ error: 'Silinəcək şəkil tapılmadı' }, { status: 404 });
        }
        
        console.error('Fayl silmə xətası:', error);
        return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 });
    }
}
