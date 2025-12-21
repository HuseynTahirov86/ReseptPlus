import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['jpeg', 'jpg', 'png', 'webp'];
const STORAGE_DIR = path.join(process.cwd(), './storage/sekiller');

// Qovluğun mövcud olub-olmadığını yoxlayır və lazım gələrsə yaradır
async function ensureStorageDirectory() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureStorageDirectory();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Fayl tapılmadı' }, { status: 400 });
    }
    
    // --- Təhlükəsizlik və Doğrulama Yoxlamaları ---

    // 1. Fayl ölçüsü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `Fayl ölçüsü ${MAX_FILE_SIZE / 1024 / 1024}MB-dan böyük ola bilməz` }, { status: 413 });
    }

    // 2. Fayl növü (uzantı)
    const originalFilename = file.name || 'unknown';
    const extension = originalFilename.split('.').pop()?.toLowerCase();
    
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ error: 'Yalnız jpeg, jpg, png, webp formatları icazəlidir' }, { status: 415 });
    }
    
    // --- Fayl Adının Yaradılması və Saxlanması ---

    // Təhlükəsiz və unikal fayl adı yaradır
    const randomHex = randomBytes(4).toString('hex');
    const uniqueFilename = `${Date.now()}-${randomHex}.${extension}`;
    
    // Faylı serverdə saxlayır
    const filePath = path.join(STORAGE_DIR, uniqueFilename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    console.log(`Fayl uğurla yazıldı: ${filePath}`);

    // Uğurlu cavab qaytarır
    const responseUrl = `/api/files/sekiller/${uniqueFilename}`;
    return NextResponse.json({ url: responseUrl }, { status: 201 });

  } catch (error) {
    console.error('Upload xətası:', error);
    return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 });
  }
}
