'use client';

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  HeartPulse,
  Pill,
  Stethoscope,
  Users,
  LogIn,
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useState } from "react";
import { useRouter } from "next/navigation";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-image");
  const patientAvatar = PlaceHolderImages.find((img) => img.id === "testimonial-patient");
  const doctorAvatar = PlaceHolderImages.find((img) => img.id === "testimonial-doctor");
  const pharmacistAvatar = PlaceHolderImages.find((img) => img.id === "testimonial-pharmacist");

  const features = [
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Xəstələr üçün",
      description:
        "Reseptlərinizə asanlıqla daxil olun, yaxınlıqdakı aptekləri tapın və dərman tarixçənizi bir təhlükəsiz yerdə idarə edin.",
      link: "/dashboard",
    },
    {
      icon: <Stethoscope className="h-10 w-10 text-primary" />,
      title: "Həkimlər üçün",
      description:
        "Saniyələr ərzində rəqəmsal reseptlər yaradın, imzalayın və göndərin. Ağıllı doza və qarşılıqlı təsir təklifləri üçün AI-dan yararlanın.",
      link: "/dashboard",
    },
    {
      icon: <Pill className="h-10 w-10 text-primary" />,
      title: "Apteklər üçün",
      description:
        "Reseptləri real vaxt rejimində yoxlayın, inventarınızı səmərəli şəkildə idarə edin və müştərilərinizə həmişəkindən daha sürətli xidmət göstərin.",
      link: "/dashboard",
    },
  ];

  const testimonials = [
    {
      avatar: patientAvatar,
      name: "Ayşə Yılmaz",
      role: "Xəstə",
      text: "SaglikNet ailəmin reseptlərini idarə etməyi inanılmaz dərəcədə sadələşdirdi. Hər şeyi telefonumda görə bilirəm və dərmanlarımın stokda olduğu ən yaxın apteki tapa bilirəm.",
    },
    {
      avatar: doctorAvatar,
      name: "Dr. Mehmet Öztürk",
      role: "Həkim",
      text: "Bu, resept yazmağın gələcəyidir. Daha sürətli, daha təhlükəsizdir və AI təklifləri fantastik bir təhlükəsizlik şəbəkəsidir. Resept səhvlərini azaltmışam və çox vaxta qənaət etmişəm.",
    },
    {
      avatar: pharmacistAvatar,
      name: "Fatma Kaya",
      role: "Əczaçı",
      text: "Reseptlərin yoxlanılması əvvəllər bir problem idi. SaglikNet ilə bu, anlıqdır. İş axınımız daha rəvandır və xəstə qayğısına daha çox diqqət yetirə bilirik.",
    },
  ];

  const { user, isUserLoading } = useUser();
  const router = useRouter();

  if (isUserLoading) {
    return <div className="w-full h-screen flex items-center justify-center">Yüklənir...</div>
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-auto flex items-center">
            <Logo />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container grid items-center gap-16 px-4 md:px-6 lg:grid-cols-2">
            <div className="space-y-6">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Səhiyyəni Qüsursuz Birləşdiririk.
              </h1>
              <p className="max-w-[600px] text-lg text-muted-foreground">
                SaglikNet, həkimləri, aptekləri və xəstələri daha təhlükəsiz və səmərəli səhiyyə təcrübəsi üçün bir araya gətirmək məqsədi ilə hazırlanmış hərtərəfli elektron resept sistemidir.
              </p>
            </div>
            <LoginForm />
          </div>
        </section>

        <section id="features" className="w-full bg-secondary/50 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Hər Kəs Üçün Vahid Platforma
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                SaglikNet xəstələrin, həkimlərin və əczaçıların unikal ehtiyaclarını ödəmək üçün hazırlanmışdır.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <Card key={i} className="flex transform flex-col justify-between transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle className="mt-4 text-2xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-24 lg:py-32">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Sadə, Təhlükəsiz və Sürətli
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Prosesimiz maksimum səmərəlilik və təhlükəsizlik üçün nəzərdə tutulmuşdur.
              </p>
            </div>
            <div className="relative grid gap-12 md:grid-cols-3">
              <div className="absolute left-0 top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-border md:block"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold text-primary">1</div>
                <h3 className="text-xl font-semibold">Həkim Recepti Yazır</h3>
                <p className="mt-2 text-muted-foreground">
                  Həkimlər intuitiv interfeysimizdən istifadə edərək reseptlər yaradır və rəqəmsal olaraq imzalayır.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold text-primary">2</div>
                <h3 className="text-xl font-semibold">Xəstə Qəbul Edir</h3>
                <p className="mt-2 text-muted-foreground">
                  Xəstələr e-resepti dərhal SaglikNet profillərində alırlar.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold text-primary">3</div>
                <h3 className="text-xl font-semibold">Aptek Təqdim Edir</h3>
                <p className="mt-2 text-muted-foreground">
                  Əczaçılar dərmanı vermədən əvvəl resepti real vaxt rejimində skan edir və yoxlayır.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full bg-secondary/50 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Səhiyyə Mütəxəssisləri və Xəstələr Tərəfindən Etibar Edilir
              </h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <Card key={i} className="p-6">
                  <CardContent className="p-0">
                    <p className="italic text-muted-foreground">"{testimonial.text}"</p>
                    <div className="mt-6 flex items-center">
                      {testimonial.avatar && (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={testimonial.avatar.imageUrl} alt={testimonial.avatar.description} data-ai-hint={testimonial.avatar.imageHint} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="ml-4">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} SaglikNet. Bütün hüquqlar qorunur.
            </p>
          </div>
          <div className="flex items-center space-x-4">
             <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Məxfilik Siyasəti</Link>
             <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Xidmət Şərtləri</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async (action: 'login' | 'signup') => {
    setLoading(true);
    setError(null);
    try {
      if (action === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
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
              <Input id="login-email" type="email" placeholder="email@nümunə.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Şifrə</Label>
              <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleAuthAction('login')} disabled={loading}>
                {loading ? "Gözləyin..." : "Daxil Ol"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Yeni hesab yaradın</CardTitle>
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
              <Input id="signup-email" type="email" placeholder="email@nümunə.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Şifrə</Label>
              <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleAuthAction('signup')} disabled={loading}>
                 {loading ? "Gözləyin..." : "Qeydiyyatdan Keç"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
