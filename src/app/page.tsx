import Link from "next/link";
import { ArrowRight, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Users, Stethoscope, HeartPulse, Building } from "lucide-react";
import type { ClientCompany, SupportingOrganization } from "@/lib/types";
import { db } from "@/firebase/server-init";

async function getPartners() {
    try {
        const supportingOrgsSnapshot = await db.collection("supportingOrganizations").limit(4).get();
        const supportingOrganizations = supportingOrgsSnapshot.docs.map(doc => doc.data() as SupportingOrganization);

        const clientCompaniesSnapshot = await db.collection("clientCompanies").limit(4).get();
        const clientCompanies = clientCompaniesSnapshot.docs.map(doc => doc.data() as ClientCompany);
        
        return { supportingOrganizations, clientCompanies };
    } catch (error) {
        console.error("Error fetching partners:", error);
        return { supportingOrganizations: [], clientCompanies: [] };
    }
}


export default async function MarketingHomePage() {
  const { supportingOrganizations, clientCompanies } = await getPartners();
  const allPartners = [...supportingOrganizations, ...clientCompanies];

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');
  const patientAvatar = PlaceHolderImages.find(img => img.id === 'testimonial-patient');
  const doctorAvatar = PlaceHolderImages.find(img => img.id === 'testimonial-doctor');
  const pharmacistAvatar = PlaceHolderImages.find(img => img.id === 'testimonial-pharmacist');

  const features = [
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Xəstələr üçün",
      description:
        "Reseptlərinizə anında daxil olun, dərman tarixçənizi izləyin və dərmanlarınızı almaq üçün ən yaxın uyğun apteki asanlıqla tapın.",
    },
    {
      icon: <Stethoscope className="h-10 w-10 text-primary" />,
      title: "Həkimlər üçün",
      description:
        "İş axınınızı sürətləndirin. Rəqəmsal reseptləri saniyələr ərzində yaradın, AI dəstəkli təkliflərlə səhvləri minimuma endirin və xəstələrinizə daha çox vaxt ayırın.",
    },
    {
      icon: <HeartPulse className="h-10 w-10 text-primary" />,
      title: "Apteklər üçün",
      description:
        "Kağız reseptlərin yaratdığı xaosu unudun. Reseptləri dərhal yoxlayın, inventarınızı effektiv idarə edin və müştəri məmnuniyyətini artırın.",
    },
  ];

  const testimonials = [
    {
      avatar: patientAvatar,
      name: "Aynur Vəliyeva",
      role: "Xəstə",
      text: "ReseptPlus həyatımı çox asanlaşdırdı. Artıq reseptlərimi itirmirəm və lazım olan bütün dərmanların olduğu ən yaxın apteki bir düymə ilə tapa bilirəm. Möhtəşəmdir!",
    },
    {
      avatar: doctorAvatar,
      name: "Dr. Elşən Ağayev",
      role: "Kardioloq",
      text: "Rəqəmsal resept sistemi vaxtıma inanılmaz dərəcədə qənaət edir. AI təklifləri isə potensial dərman qarşılıqlı təsirləri barədə məni xəbərdar edərək əlavə bir təhlükəsizlik qatı yaradır.",
    },
    {
      avatar: pharmacistAvatar,
      name: "Leyla Həsənova",
      role: "Əczaçı",
      text: "Əvvəllər həkim xəttini oxumaq üçün xeyli vaxt itirirdik. İndi hər şey aydın və səhvsizdir. Bu sistem aptekimizdəki iş axınını tamamilə dəyişdi.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 lg:py-48 overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="container relative z-10 text-center">
            <div
              className="mx-auto max-w-4xl animate-fade-in-up rounded-xl border border-glass-border bg-glass-bg/80 p-8 shadow-2xl backdrop-blur-lg"
              style={{ animationDelay: '0.2s', animationDuration: '0.9s' }}
            >
              <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Səhiyyəni Rəqəmsal Zirvəyə Daşıyırıq.
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
                ReseptPlus, həkimləri, aptekləri və xəstələri daha təhlükəsiz və səmərəli səhiyyə təcrübəsi üçün bir araya gətirən vahid elektron resept platformasıdır.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg" style={{ animationDelay: '0.4s', animationDuration: '0.9s' }} className="animate-fade-in-up">
                  <Link href="/login">Platformaya Keçid</Link>
                </Button>
                <Button asChild size="lg" variant="outline" style={{ animationDelay: '0.6s', animationDuration: '0.9s' }} className="animate-fade-in-up">
                  <Link href="/haqqimizda">Daha Çox Məlumat</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        {allPartners.length > 0 && (
          <section className="py-16">
            <div className="container">
              <div className="mx-auto text-center">
                <h3 className="text-sm font-semibold text-muted-foreground tracking-widest uppercase animate-fade-in-up">Bizə Etibar Edənlər</h3>
                <div className="mt-6 flow-root">
                  <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                    {allPartners.map((partner) => (
                      <div key={partner.id} className="relative h-12 w-32 flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <Image
                          src={partner.logoUrl}
                          alt={partner.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Hər Kəs Üçün Vahid Platforma
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                ReseptPlus xəstələrin, həkimlərin və əczaçıların unikal ehtiyaclarını qarşılayaraq səhiyyə prosesini hər kəs üçün asanlaşdırır.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <Card 
                  key={i} 
                  className="flex transform flex-col justify-between rounded-xl border-glass-border bg-glass-bg p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.2 + 0.4}s`, animationDuration: '0.9s' }}
                >
                  <CardHeader className="items-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container">
            <div className="mx-auto mb-16 max-w-3xl text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Sadə, Təhlükəsiz və Sürətli
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Prosesimiz maksimum səmərəlilik və təhlükəsizlik üçün nəzərdə tutulmuşdur: 3 sadə addımla tanış olun.
              </p>
            </div>
            <div className="relative grid gap-12 md:grid-cols-3">
              <div className="absolute left-1/2 top-10 hidden h-0.5 w-2/3 -translate-x-1/2 bg-border md:block"></div>
              <div className="relative flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '0.2s', animationDuration: '0.9s' }}>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background text-3xl font-bold text-primary shadow-md">1</div>
                <h3 className="text-xl font-semibold">Rəqəmsal Receptin Yazılması</h3>
                <p className="mt-2 text-muted-foreground">
                  Həkimlər intuitiv interfeysimizdən istifadə edərək reseptlər yaradır və rəqəmsal olaraq imzalayır.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '0.4s', animationDuration: '0.9s' }}>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background text-3xl font-bold text-primary shadow-md">2</div>
                <h3 className="text-xl font-semibold">Anında Xəstəyə Çatdırılma</h3>
                <p className="mt-2 text-muted-foreground">
                  Xəstələr e-resepti dərhal ReseptPlus profillərində alırlar və bildirişlə məlumatlandırılırlar.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '0.6s', animationDuration: '0.9s' }}>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background text-3xl font-bold text-primary shadow-md">3</div>
                <h3 className="text-xl font-semibold">Aptekdə Asan Təqdimat</h3>
                <p className="mt-2 text-muted-foreground">
                  Əczaçılar dərmanı vermədən əvvəl resepti unikal kod ilə real vaxt rejimində skan edir və yoxlayır.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-16 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                İstifadəçilərimiz Nə Deyir?
              </h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <Card 
                  key={i} 
                  className="p-6 bg-glass-bg rounded-xl shadow-lg border-glass-border animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.2 + 0.4}s`, animationDuration: '0.9s' }}
                >
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

         {/* Call to Action Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="relative overflow-hidden rounded-2xl bg-primary/90 px-6 py-16 text-center shadow-xl animate-fade-in-up" style={{ animationDuration: '0.9s', animationDelay: '0.5s' }}>
               <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-80"></div>
               <div className="relative z-10">
                  <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">Səhiyyənin Gələcəyinə Bu Gün Qoşulun</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90">
                      Rəqəmsal transformasiyanın bir parçası olun və ReseptPlus-ın yaratdığı fərqi özünüz kəşf edin.
                  </p>
                  <Button asChild size="lg" variant="outline" className="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      <Link href="/login">İndi Başlayın <ArrowRight className="ml-2 h-5 w-5"/></Link>
                  </Button>
               </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
