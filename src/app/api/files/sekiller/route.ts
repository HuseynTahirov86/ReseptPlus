import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), './storage/sekiller');

// Helper to ensure the directory exists
async function ensureStorageDirectory() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

// GET /api/files/sekiller - List all files
export async function GET(req: NextRequest) {
  try {
    await ensureStorageDirectory();
    const files = await fs.readdir(STORAGE_DIR);
    const imageFiles = files
        .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
        .map(filename => ({
            filename,
            url: `/api/files/sekiller/${filename}`
        }));
    
    // Sort by creation time, newest first
    const sortedFiles = await Promise.all(
        imageFiles.map(async (file) => {
            const stats = await fs.stat(path.join(STORAGE_DIR, file.filename));
            return { ...file, createdAt: stats.mtime.getTime() };
        })
    );

    sortedFiles.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json(sortedFiles);
  } catch (error) {
    console.error('Fayl siyahısı xətası:', error);
    return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 });
  }
}
