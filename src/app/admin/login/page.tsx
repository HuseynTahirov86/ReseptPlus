'use client';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useState } from "react";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Logo } from '@/components/logo';

function AuthForm() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async () => {
    if (!auth) {
        setError("Firebase Auth xidməti hazır deyil.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (creationError: any) {
            handleFirebaseAuthError(creationError);
        }
      } else {
        handleFirebaseAuthError(e);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleFirebaseAuthError = (e: any) => {
     switch (e.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          setError('Bu email ilə hesab tapılmadı və ya şifrə yanlışdır.');
          break;
        case 'auth/wrong-password':
          setError('Yanlış şifrə. Zəhmət olmasa, yenidən cəhd edin.');
          break;
        case 'auth/invalid-email':
          setError('Zəhmət olmasa, düzgün bir email adresi daxil edin.');
          break;
        case 'auth/email-already-in-use':
          setError('Bu email artıq mövcuddur. Zəhmət olmasa, daxil olun.');
          break;
        case 'auth/weak-password':
          setError('Şifrə çox zəifdir. Ən azı 6 simvol olmalıdır.');
          break;
        default:
          setError('Gözlənilməz bir xəta baş verdi: ' + e.message);
          break;
      }
  }

  return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Panelə Giriş</CardTitle>
          <CardDescription>
            İdarəetmə panelinə daxil olmaq üçün məlumatlarınızı daxil edin.
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifrə</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleAuthAction} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Gözləyin..." : 'Davam Et'}
          </Button>
        </CardFooter>
      </Card>
  )
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary/50 p-4">
            <div className='absolute top-8 left-8'>
                <Link href="/">
                    <Logo />
                </Link>
            </div>
            <AuthForm />
        </div>
    )
}
