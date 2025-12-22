'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  ClipboardCopy,
  ImageOff,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';

interface MediaFile {
  filename: string;
  url: string;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/files/sekiller');
      if (!response.ok) {
        throw new Error('Faylları yükləmək mümkün olmadı.');
      }
      const data: MediaFile[] = await response.json();
      setFiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    toast({
      title: 'Kopyalandı!',
      description: 'Şəkil URL-i müvəffəqiyyətlə kopyalandı.',
    });
  };

  const handleDelete = async (filename: string) => {
    try {
      const response = await fetch(`/api/files/sekiller/${filename}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Faylı silmək mümkün olmadı.');
      }
      toast({
        title: 'Uğurlu!',
        description: `"${filename}" adlı fayl uğurla silindi.`,
      });
      // Refresh file list after deletion
      fetchFiles();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: err.message,
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Media Kitabxanası</CardTitle>
          <CardDescription>
            Yüklənmiş şəkilləri idarə edin. Yeni şəkilləri{' '}
            <Link href="/admin/upload" className="text-primary underline">
              Fayl Yüklə
            </Link>{' '}
            səhifəsindən əlavə edə bilərsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Xəta</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && files.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <ImageOff className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Media Kitabxanası Boşdur</h3>
                <p className="mt-2 text-sm text-muted-foreground">Başlamaq üçün yeni bir şəkil yükləyin.</p>
                <Button asChild className="mt-6">
                    <Link href="/admin/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Şəkil Yüklə
                    </Link>
                </Button>
            </div>
          )}

          {!loading && !error && files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {files.map((file) => (
                <Card key={file.filename} className="group relative overflow-hidden">
                  <div className="aspect-square w-full relative">
                    <Image
                      src={file.url}
                      alt={file.filename}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                    />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => handleCopyUrl(file.url)}
                            title="URL-i kopyala"
                        >
                            <ClipboardCopy className="h-5 w-5" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    title="Şəkli sil"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Silməyi təsdiq edin</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bu əməliyyat geri qaytarıla bilməz. "{file.filename}" faylı serverdən həmişəlik silinəcək.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(file.filename)}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    Bəli, Sil
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                  </div>
                   <div className="p-2 text-xs text-muted-foreground truncate" title={file.filename}>
                        {file.filename}
                    </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
