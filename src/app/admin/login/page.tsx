'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useState, useEffect } from "react";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Logo } from '@/components/logo';

function AuthForm() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async (action: 'login' | 'signup') => {
    if (!auth) {
        setError("Firebase Auth xidməti hazır deyil.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      if (action === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // The redirection is now handled by the FirebaseProvider
    } catch (e: any) {
      switch (e.code) {
        case 'auth/user-not-found':
          setError('Bu email ilə hesab tapılmadı.');
          break;
        case 'auth/wrong-password':
          setError('Yanlış şifrə. Zəhmət olmasa, yenidən cəhd edin.');
          break;
        case 'auth/invalid-email':
          setError('Zəhmət olmasa, düzgün bir email adresi daxil edin.');
          break;
        case 'auth/email-already-in-use':
          setError('Bu email adresi artıq istifadə olunur.');
          break;
        case 'auth/weak-password':
          setError('Şifrə çox zəifdir. Ən azı 6 simvol olmalıdır.');
          break;
        default:
          setError('Gözlənilməz bir xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Daxil Ol</TabsTrigger>
        <TabsTrigger value="signup">Qeydiyyat</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Hesabınıza daxil olun</CardTitle>
             <CardDescription>İdarəetmə panelinə daxil olmaq üçün məlumatlarınızı daxil edin.</CardDescription>
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
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" placeholder="email@nümunə.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Şifrə</Label>
              <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleAuthAction('login')} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Gözləyin..." : "Daxil Ol"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Yeni hesab yaradın</CardTitle>
            <CardDescription>ReseptPlus-a qoşulmaq üçün qeydiyyatdan keçin.</CardDescription>
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
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" placeholder="email@nümunə.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Şifrə</Label>
              <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleAuthAction('signup')} disabled={loading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {loading ? "Gözləyin..." : "Qeydiyyatdan Keç"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default function LoginPage() {
    // The redirection logic is now fully handled by the central RedirectHandler
    // in FirebaseProvider. This component's only job is to render the login form.
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
