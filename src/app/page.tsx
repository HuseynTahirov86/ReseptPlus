import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  HeartPulse,
  Pill,
  Stethoscope,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Logo } from "@/components/logo";

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-auto flex items-center">
            <Logo />
          </div>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link href="#features" className="transition-colors hover:text-primary">Xüsusiyyətlər</Link>
            <Link href="#how-it-works" className="transition-colors hover:text-primary">Necə İşləyir</Link>
            <Link href="#testimonials" className="transition-colors hover:text-primary">Rəylər</Link>
          </nav>
          <div className="flex items-center justify-end md:ml-6">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Daxil Ol</Link>
            </Button>
            <Button asChild className="ml-2">
              <Link href="/dashboard">Pulsuz Qeydiyyat</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Səhiyyəni Qüsursuz Birləşdiririk.
              </h1>
              <p className="max-w-[600px] text-lg text-muted-foreground">
                SaglikNet, həkimləri, aptekləri və xəstələri daha təhlükəsiz və səmərəli səhiyyə təcrübəsi üçün bir araya gətirmək məqsədi ilə hazırlanmış hərtərəfli elektron resept sistemidir.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    İndi Başlayın <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Daha Çox Məlumat</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] w-full overflow-hidden rounded-xl shadow-2xl md:h-[400px] lg:h-[500px]">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              )}
            </div>
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
