'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UploadCloud, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadedUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Zəhmət olmasa, bir fayl seçin.');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadedUrl(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server xətası: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadedUrl(result.url);
      
    } catch (err: any) {
      setError(err.message || 'Yükləmə zamanı xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Şəkil Yükləmə Sistemi</CardTitle>
          <CardDescription>
            Serverə şəkil yükləyin və API vasitəsilə servis edilən URL-i əldə edin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Şəkil</Label>
              <Input id="picture" type="file" onChange={handleFileChange} accept="image/jpeg,image/png,image/webp" />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Xəta</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading || !file}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yüklənir...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Yüklə
                </>
              )}
            </Button>
          </form>

          {uploadedUrl && (
            <div className="mt-8 space-y-4 animate-in fade-in-50">
                <Alert>
                    <AlertTitle>Yükləmə Uğurlu!</AlertTitle>
                    <AlertDescription className="break-all">
                        Şəkil URL-i: <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-primary hover:underline">{uploadedUrl}</a>
                    </AlertDescription>
                </Alert>

              <Card>
                <CardHeader>
                    <CardTitle>Önizləmə</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-video w-full max-w-md rounded-md border overflow-hidden">
                        <Image src={uploadedUrl} alt="Yüklənmiş şəkil" layout="fill" objectFit="contain" />
                    </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
