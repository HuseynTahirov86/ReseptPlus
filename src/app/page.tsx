

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Users, Stethoscope, HeartPulse } from "lucide-react";


export default function MarketingHomePage() {
    
    const heroImage = PlaceHolderImages[0];
    const patientAvatar = PlaceHolderImages[1];
    const doctorAvatar = PlaceHolderImages[2];
    const pharmacistAvatar = PlaceHolderImages[3];

    const features = [
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Xəstələr üçün",
      description:
        "Reseptlərinizə asanlıqla daxil olun, yaxınlıqdakı aptekləri tapın və dərman tarixçənizi bir təhlükəsiz yerdə idarə edin.",
    },
    {
      icon: <Stethoscope className="h-10 w-10 text-primary" />,
      title: "Həkimlər üçün",
      description:
        "Saniyələr ərzində rəqəmsal reseptlər yaradın, imzalayın və göndərin. Ağıllı doza və qarşılıqlı təsir təklifləri üçün AI-dan yararlanın.",
    },
    {
      icon: <HeartPulse className="h-10 w-10 text-primary" />,
      title: "Apteklər üçün",
      description:
        "Reseptləri real vaxt rejimində yoxlayın, inventarınızı səmərəli şəkildə idarə edin və müştərilərinizə həmişəkindən daha sürətli xidmət göstərin.",
    },
  ];

   const testimonials = [
    {
      avatar: patientAvatar,
      name: "Ayşə Yılmaz",
      role: "Xəstə",
      text: "ReseptPlus ailəmin reseptlərini idarə etməyi inanılmaz dərəcədə sadələşdirdi. Hər şeyi telefonumda görə bilirəm və dərmanlarımın stokda olduğu ən yaxın apteki tapa bilirəm.",
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
      text: "Reseptlərin yoxlanılması əvvəllər bir problem idi. ReseptPlus ilə bu, anlıqdır. İş axınımız daha rəvandır və xəstə qayğısına daha çox diqqət yetirə bilirik.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 lg:py-40">
           {heroImage && (
             <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover object-center opacity-10"
                data-ai-hint={heroImage.imageHint}
                priority
             />
           )}
          <div className="container relative z-10 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Səhiyyəni Qüsursuz Birləşdiririk.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
              ReseptPlus, həkimləri, aptekləri və xəstələri daha təhlükəsiz və səmərəli səhiyyə təcrübəsi üçün bir araya gətirən hərtərəfli elektron resept sistemidir.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">İndi Başlayın</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/haqqimizda">Daha Çox Məlumat</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-secondary/50 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Hər Kəs Üçün Vahid Platforma
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                ReseptPlus xəstələrin, həkimlərin və əczaçıların unikal ehtiyaclarını ödəmək üçün hazırlanmışdır.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <Card key={i} className="flex transform flex-col justify-between rounded-xl border-transparent bg-background shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20">
                  <CardHeader className="items-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4">
                        {feature.icon}
                    </div>
                    <CardTitle className="mt-4 text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 lg:py-32">
          <div className="container">
            <div className="mx-auto mb-16 max-w-3xl text-center">
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
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background text-3xl font-bold text-primary shadow-md">1</div>
                <h3 className="text-xl font-semibold">Həkim Recepti Yazır</h3>
                <p className="mt-2 text-muted-foreground">
                  Həkimlər intuitiv interfeysimizdən istifadə edərək reseptlər yaradır və rəqəmsal olaraq imzalayır.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background text-3xl font-bold text-primary shadow-md">2</div>
                <h3 className="text-xl font-semibold">Xəstə Qəbul Edir</h3>
                <p className="mt-2 text-muted-foreground">
                  Xəstələr e-resepti dərhal ReseptPlus profillərində alırlar.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background text-3xl font-bold text-primary shadow-md">3</div>
                <h3 className="text-xl font-semibold">Aptek Təqdim Edir</h3>
                <p className="mt-2 text-muted-foreground">
                  Əczaçılar dərmanı vermədən əvvəl resepti real vaxt rejimində skan edir və yoxlayır.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
         <section id="testimonials" className="w-full bg-secondary/50 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Səhiyyə Mütəxəssisləri və Xəstələr Tərəfindən Etibar Edilir
              </h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <Card key={i} className="p-6 bg-background rounded-xl shadow-lg">
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
      <MarketingFooter />
    </div>
  );
}
