'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, ImageOff, Library, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

interface MediaFile {
  filename: string;
  url: string;
}

interface MediaLibraryPickerProps {
  onSelect: (url: string) => void;
}

function MediaLibraryGrid({ onSelect, closeDialog }: { onSelect: (url: string) => void, closeDialog: () => void }) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    async function fetchFiles() {
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
    }
    fetchFiles();
  });

  const handleSelect = (url: string) => {
    onSelect(window.location.origin + url);
    closeDialog();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Xəta</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <ImageOff className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Media Kitabxanası Boşdur</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Başlamaq üçün yeni bir şəkil yükləyin.
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin/upload" target="_blank">
            <Upload className="mr-2 h-4 w-4" />
            Şəkil Yüklə
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
      {files.map((file) => (
        <Card
          key={file.filename}
          className="group relative overflow-hidden cursor-pointer"
          onClick={() => handleSelect(file.url)}
        >
          <div className="aspect-square w-full relative">
            <Image
              src={file.url}
              alt={file.filename}
              fill
              objectFit="cover"
              sizes="(max-width: 768px) 33vw, 25vw"
              className="transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-semibold text-center p-2">Seç</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function MediaLibraryPicker({ onSelect }: MediaLibraryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSelect = (url: string) => {
    onSelect(url);
    toast({
      title: 'Seçildi!',
      description: 'Şəkil URL-i uğurla yeniləndi.',
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
            <Library className="mr-2 h-4 w-4" />
            Kitabxanadan Seç
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media Kitabxanasından Seçin</DialogTitle>
        </DialogHeader>
        <MediaLibraryGrid onSelect={handleSelect} closeDialog={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}