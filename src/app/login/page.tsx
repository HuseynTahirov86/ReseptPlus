'use client';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAuthAction = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, try to sign in
      await signInWithEmailAndPassword(auth, email, password);
      // Redirection is handled by the FirebaseProvider
    } catch (e: any) {
      // If user is not found, it means it's the first time for a special user (like superadmin)
      // or a user being created by an admin. Let's try to create an account.
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Redirection is handled by the FirebaseProvider after creation
        } catch (creationError: any) {
            // Handle errors during creation (e.g., weak password)
            handleFirebaseAuthError(creationError);
        }
      } else {
        // Handle other sign-in errors (e.g., wrong password)
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

  if (!isMounted) {
    return null;
  }

  return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sistemə Giriş</CardTitle>
          <CardDescription>
            Hesabınıza daxil olmaq üçün məlumatlarınızı daxil edin.
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
            <Input id="email" type="email" placeholder="email@nümunə.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifrə</Label>
            <Input id="password" type="password" placeholder="şifrəniz" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
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
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user) {
            const role = user.profile?.role;
            if (role === 'admin' || role === 'system_admin') {
                router.push('/admin/dashboard');
            } else if (role === 'doctor' || role === 'head_doctor' || role === 'pharmacist' || role === 'head_pharmacist') {
                router.push('/dashboard');
            }
        }
    }, [user, isUserLoading, router]);
    
    if (isUserLoading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
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
