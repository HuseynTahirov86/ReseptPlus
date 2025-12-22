import Link from "next/link";
import { ArrowRight, Handshake, BrainCircuit, FilePlus2, MapPin, ShieldCheck, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import Image from "next/image";
import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Users, Stethoscope, HeartPulse, Building } from "lucide-react";
import type { ClientCompany, SupportingOrganization } from "@/lib/types";
import { db } from "@/firebase/server-init";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const platformFeatures = [
    {
      role: 'Həkim',
      icon: Stethoscope,
      features: [
        {
          icon: FilePlus2,
          title: "Sürətli Resept Yazma",
          description: "Intuitiv interfeyslə saniyələr içində səhvsiz, rəqəmsal reseptlər tərtib edin."
        },
        {
          icon: BrainCircuit,
          title: "AI Konsultasiya",
          description: "Mürəkkəb hallarda diaqnoz və müalicə üçün AI ilə məsləhətləşin, ikinci bir rəy alın."
        },
        {
          icon: Users,
          title: "Xəstə İdarəçiliyi",
          description: "Xəstələrinizin resept tarixçəsini və məlumatlarını vahid və təhlükəsiz bir mərkəzdən izləyin."
        }
      ]
    },
    {
      role: 'Əczaçı',
      icon: Pill,
      features: [
        {
          icon: ShieldCheck,
          title: "Təhlükəsiz Yoxlama",
          description: "Unikal kod vasitəsilə reseptlərin həqiqiliyini anında yoxlayın, saxtakarlığın qarşısını alın."
        },
        {
          icon: Building,
          title: "İnventar İdarəçiliyi",
          description: "Dərman satışlarını izləyin, anbar qalığını optimallaşdırın və tələbatı proqnozlaşdırın."
        },
        {
          icon: ArrowRight,
          title: "Səlis İş Axını",
          description: "Kağız reseptləri və anlaşılmayan həkim xətlərini unudun, müştərilərə daha sürətli xidmət göstərin."
        }
      ]
    },
    {
      role: 'Xəstə',
      icon: HeartPulse,
      features: [
        {
          icon: MapPin,
          title: "Ən Yaxın Apteki Tap",
          description: "Reseptinizdəki bütün dərmanların olduğu ən yaxın və ən uyğun apteki bir kliklə tapın."
        },
        {
          icon: FilePlus2,
          title: "Rəqəmsal Arxiv",
          description: "Bütün reseptləriniz və dərman tarixçəniz təhlükəsiz şəkildə telefonunuzda saxlanılır."
        },
        {
          icon: Handshake,
          title: "Etibarlı Proses",
          description: "Səhv dərman riskini aradan qaldıran təhlükəsiz və şəffaf bir prosesdən faydalanın."
        }
      ]
    }
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
              className="object-cover object-center brightness-50"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-transparent"></div>
          <div className="container relative z-10 text-center">
            <div
              className="mx-auto max-w-4xl animate-fade-in-up"
              style={{ animationDuration: '0.9s' }}
            >
              <h1 className="font-headline text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Səhiyyəni Rəqəmsal Zirvəyə Daşıyırıq.
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80 md:text-xl">
                ReseptPlus, həkimləri, aptekləri və xəstələri daha təhlükəsiz və səmərəli səhiyyə təcrübəsi üçün bir araya gətirən vahid elektron resept platformasıdır.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg" style={{ animationDelay: '0.2s' }} className="animate-fade-in-up">
                  <Link href="/login">Platformaya Keçid</Link>
                </Button>
                <Button asChild size="lg" variant="outline" style={{ animationDelay: '0.4s' }} className="animate-fade-in-up bg-white/10 text-white border-white/20 backdrop-blur-lg hover:bg-white/20">
                  <Link href="/haqqimizda">Daha Çox Məlumat</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {allPartners.length > 0 && (
          <section className="py-16">
            <div className="container">
              <div className="mx-auto text-center">
                <h3 className="text-sm font-semibold text-muted-foreground tracking-widest uppercase animate-fade-in-up">Bizə Etibar Edənlər</h3>
                <div className="mt-6 flow-root">
                  <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                    {allPartners.map((partner, i) => (
                      <div key={partner.id} className="relative h-12 w-32 flex-shrink-0 animate-fade-in-up" style={{ animationDelay: `${i*0.1}s` }}>
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

        {/* Platform Overview Section */}
        <section id="features" className="w-full py-16 md:py-24 bg-secondary/30">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center animate-fade-in-up">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Hər Kəs Üçün Vahid Platforma
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                ReseptPlus, səhiyyə zəncirinin hər bir iştirakçısının unikal ehtiyaclarını qarşılayan xüsusi həllər təklif edir.
              </p>
            </div>
            
            <Tabs defaultValue="Həkim" className="w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-auto">
                {platformFeatures.map((role) => (
                  <TabsTrigger key={role.role} value={role.role} className="py-3 text-base">
                    <role.icon className="mr-2 h-5 w-5" /> {role.role}
                  </TabsTrigger>
                ))}
              </TabsList>

              {platformFeatures.map((role) => (
                <TabsContent key={role.role} value={role.role} className="mt-10">
                    <div className="grid gap-8 md:grid-cols-3">
                    {role.features.map((feature, i) => (
                      <Card 
                        key={i} 
                        className="flex flex-col text-center items-center rounded-xl p-6 shadow-lg transition-all duration-300 border-glass-border bg-glass-bg hover:shadow-primary/20 hover:-translate-y-2 animate-fade-in-up"
                        style={{ animationDelay: `${i * 0.15}s`}}
                      >
                        <CardHeader className="items-center p-0">
                          <div className="mb-4 rounded-full bg-primary/10 p-4">
                            <feature.icon className="h-10 w-10 text-primary" />
                          </div>
                          <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 mt-2">
                          <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-24 lg:py-32">
          <div className="container">
            <div className="mx-auto mb-16 max-w-3xl text-center animate-fade-in-up">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Sadə, Təhlükəsiz və Sürətli
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Prosesimiz maksimum səmərəlilik və təhlükəsizlik üçün nəzərdə tutulmuşdur: 3 sadə addımla tanış olun.
              </p>
            </div>
            <div className="relative grid gap-12 md:grid-cols-3">
              <div className="absolute left-1/2 top-10 hidden h-0.5 w-2/3 -translate-x-1/2 bg-border/50 md:block"></div>
              <div className="relative flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background text-3xl font-bold text-primary shadow-lg">1</div>
                <h3 className="text-xl font-semibold">Rəqəmsal Reseptin Yazılması</h3>
                <p className="mt-2 text-muted-foreground">
                  Həkimlər intuitiv interfeysimizdən istifadə edərək reseptlər yaradır və rəqəmsal olaraq imzalayır.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background text-3xl font-bold text-primary shadow-lg">2</div>
                <h3 className="text-xl font-semibold">Anında Xəstəyə Çatdırılma</h3>
                <p className="mt-2 text-muted-foreground">
                  Xəstələr e-resepti dərhal ReseptPlus profillərində alırlar və bildirişlə məlumatlandırılırlar.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background text-3xl font-bold text-primary shadow-lg">3</div>
                <h3 className="text-xl font-semibold">Aptekdə Asan Təqdimat</h3>
                <p className="mt-2 text-muted-foreground">
                  Əczaçılar dərmanı vermədən əvvəl resepti unikal kod ilə real vaxt rejimində skan edir və yoxlayır.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container">
            <div className="relative overflow-hidden rounded-2xl bg-primary/90 px-6 py-16 text-center shadow-xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
               <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-80"></div>
               <div className="relative z-10">
                  <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">Səhiyyənin Gələcəyinə Bu Gün Qoşulun</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90">
                      Rəqəmsal transformasiyanın bir parçası olun və ReseptPlus-ın yaratdığı fərqi özünüz kəşf edin.
                  </p>
                  <Button asChild size="lg" variant="secondary" className="mt-8">
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
