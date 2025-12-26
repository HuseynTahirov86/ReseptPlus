'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/firebase';
import { sendEmailVerification, reload } from 'firebase/auth';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailCheck, Loader2, ShieldCheck, MailWarning } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const { user, isUserLoading, authState } = useFirebase();
  const auth = useAuth();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Redirect if user is already verified and authenticated
  useEffect(() => {
    if (!isUserLoading && authState === 'AUTHENTICATED') {
      router.push('/dashboard');
    }
  }, [authState, isUserLoading, router]);

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
        setError("İstifadəçi tapılmadı. Zəhmət olmasa, yenidən daxil olun.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
        await sendEmailVerification(auth.currentUser);
        setEmailSent(true);
    } catch (e: any) {
        setError(`Email göndərilərkən xəta baş verdi: ${e.message}`);
    } finally {
        setLoading(false);
    }
  };
  
  const handleCheckVerification = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    await reload(auth.currentUser);
    // onAuthStateChanged in FirebaseProvider will handle the redirect if verified
    if (auth.currentUser.emailVerified) {
        router.push('/dashboard');
    } else {
        setError("Email hələ təsdiqlənməyib. Zəhmət olmasa, email qutunuzu yoxlayın.");
    }
    setLoading(false);
  }

  if (isUserLoading || authState !== 'AWAITING_EMAIL_VERIFICATION') {
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
            <MailWarning /> Email-i Təsdiqləyin
          </CardTitle>
          <CardDescription>
            Sistemə girişi tamamlamaq üçün <span className="font-bold">{auth.currentUser?.email}</span> ünvanına göndərilən təsdiq linkinə klikləyin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive">
                <MailCheck className="h-4 w-4" />
                <AlertTitle>Xəta</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {emailSent && (
                <Alert variant="default" className="border-green-500 text-green-700">
                <MailCheck className="h-4 w-4" />
                <AlertTitle>Göndərildi!</AlertTitle>
                <AlertDescription>Yeni təsdiq emaili uğurla göndərildi.</AlertDescription>
                </Alert>
            )}
            <p className='text-sm text-muted-foreground'>
                Email-i görmürsünüzsə, "Spam" və ya "Junk" qovluqlarını yoxlayın. Linkə kliklədikdən sonra aşağıdakı düyməyə basın.
            </p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" onClick={handleCheckVerification} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MailCheck className="mr-2 h-4 w-4"/>}
            {loading ? 'Yoxlanılır...' : 'Mən Təsdiqlədim, Davam Et'}
          </Button>
           <Button className="w-full" variant="outline" onClick={handleResendEmail} disabled={loading}>
             Yenidən Göndər
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
