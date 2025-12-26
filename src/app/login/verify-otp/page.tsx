'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/firebase';
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function VerifyOtpPage() {
  const { verifyUserSession, generatedOtp, isUserLoading } = useFirebase();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = () => {
    setLoading(true);
    setError(null);
    if (otp === generatedOtp) {
      verifyUserSession();
      // The RedirectHandler in FirebaseProvider will handle the redirect.
    } else {
      setError('Təsdiq kodu yanlışdır. Zəhmət olmasa, yenidən cəhd edin.');
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/50 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/50 p-4">
      <div className="absolute left-8 top-8">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck /> Təhlükəsizlik Yoxlaması
          </CardTitle>
          <CardDescription>
            Sistemə girişi tamamlamaq üçün email ünvanınıza göndərilən 6
            rəqəmli təsdiq kodunu daxil edin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Xəta</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {generatedOtp && (
            <Alert
              variant="default"
              className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
            >
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700 dark:text-blue-300">
                Təcrübi Rejim
              </AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                Bu bir simulyasiyadır. Real email göndərilmir. Təsdiq kodu:{' '}
                <strong className="font-mono">{generatedOtp}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp">Təsdiq Kodu</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleVerify} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Yoxlanılır...' : 'Təsdiqlə'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
