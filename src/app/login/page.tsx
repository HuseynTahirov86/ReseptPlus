
'use client';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
import { createDoctorUser } from './actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function AuthForm() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAuthAction = async (action: 'login' | 'signup') => {
    setLoading(true);
    setError(null);
    try {
      if (action === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Special admin emails are handled by FirebaseProvider's onAuthStateChanged.
        // We only create a doctor profile for non-admin emails.
        if (userCredential.user && userCredential.user.email !== 'admin@sagliknet.az' && userCredential.user.email !== 'superadmin@reseptplus.az') {
          const result = await createDoctorUser(email, password);
          if ('error' in result) {
            setError(`Hesab yaradıldı, amma profil yaradıla bilmədi: ${result.error}`);
          }
        }
      }
    } catch (e: any) {
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
           setError('Bu email adresi artıq istifadə olunur.');
           break;
        case 'auth/weak-password':
           setError('Şifrə çox zəifdir. Ən azı 6 simvol olmalıdır.');
           break;
        default:
          setError('Gözlənilməz bir xəta baş verdi: ' + e.message);
          break;
      }
    } finally {
      setLoading(false);
    }
  };
  

  if (!isMounted) {
    return null;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Daxil Ol</TabsTrigger>
        <TabsTrigger value="signup">Qeydiyyat</TabsTrigger>
      </TabsList>
      
      <Card>
        <CardHeader>
          <CardTitle>{activeTab === 'login' ? 'Hesabınıza daxil olun' : 'Yeni hesab yaradın'}</CardTitle>
          <CardDescription>
            {activeTab === 'login' 
              ? "İdarəetmə panelinə daxil olmaq üçün məlumatlarınızı daxil edin." 
              : "Admin və ya test həkimi hesabı yaratmaq üçün qeydiyyatdan keçin."}
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
            <Input id="password" type="password" placeholder="şifrə (ən az 6 simvol)" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => handleAuthAction(activeTab as 'login' | 'signup')} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Gözləyin..." : (activeTab === 'login' ? 'Daxil Ol' : 'Qeydiyyatdan Keç')}
          </Button>
        </CardFooter>
      </Card>
      
      <TabsContent value="login" />
      <TabsContent value="signup" />
    </Tabs>
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
            } else if (role === 'doctor' || role === 'head_doctor') {
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
