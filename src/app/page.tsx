import Link from "next/link";
import { ArrowRight, Handshake, BrainCircuit, FilePlus2, MapPin, ShieldCheck, Pill, Check, Zap, Server, MessageSquare, Mail, Phone, Users, Stethoscope, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import Image from "next/image";
import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import type { ClientCompany, SupportingOrganization, PricingPlan, BlogPost } from "@/lib/types";
import { db } from "@/firebase/server-init";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function getMarketingData() {
    try {
        const plansSnapshot = await db.collection("pricingPlans").orderBy("price").get();
        const pricingPlans = plansSnapshot.docs.map(doc => doc.data() as PricingPlan);

        const blogSnapshot = await db.collection("blogPosts").orderBy('datePublished', 'desc').limit(3).get();
        const blogPosts = blogSnapshot.docs.map(doc => doc.data() as BlogPost);
        
        return { pricingPlans, blogPosts };

    } catch (error) {
        console.error("Error fetching marketing data:", error);
        return { pricingPlans: [], blogPosts: [] };
    }
}


export default async function MarketingHomePage() {
  const { pricingPlans, blogPosts } = await getMarketingData();

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

  const advantages = [
    {
      icon: ShieldCheck,
      title: "Maksimum Təhlükəsizlik",
      description: "Bütün məlumatlarınız beynəlxalq standartlara uyğun şifrələnir və qorunur."
    },
    {
      icon: Zap,
      title: "İldırım Sürətli Əməliyyatlar",
      description: "Resept yazmaqdan dərmanı təhvil almağa qədər bütün proses saniyələr içində baş verir."
    },
    {
      icon: BrainCircuit,
      title: "Süni İntellekt Dəstəyi",
      description: "Həkimlər üçün diaqnoz və müalicə, əczaçılar üçün isə inventar proqnozlaşdırılması."
    },
    {
      icon: Server,
      title: "Vahid Məlumat Bazasl",
      description: "Həkim, aptek və xəstə arasında məlumat itkisini və səhvləri aradan qaldıran vahid sistem."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 lg:py-40">
          <div className="container text-center">
            <div
              className="mx-auto max-w-4xl animate-fade-in-up"
              style={{ animationDuration: '0.9s' }}
            >
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Səhiyyəni Rəqəmsal Zirvəyə Daşıyırıq.
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
                ReseptPlus, həkimləri, aptekləri və xəstələri daha təhlükəsiz və səmərəli səhiyyə təcrübəsi üçün bir araya gətirən vahid elektron resept platformasıdır.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg" style={{ animationDelay: '0.2s' }} className="animate-fade-in-up">
                  <Link href="/login">Platformaya Keçid</Link>
                </Button>
                <Button asChild size="lg" variant="outline" style={{ animationDelay: '0.4s' }} className="animate-fade-in-up">
                  <Link href="/haqqimizda">Daha Çox Məlumat</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

         {/* Advantages Section */}
        <section id="advantages" className="w-full py-16 md:py-24 bg-secondary/50">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center animate-fade-in-up">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Niyə ReseptPlus?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Ənənəvi səhiyyənin sərhədlərini aşan, hər kəs üçün dəyər yaradan üstünlüklərimiz.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {advantages.map((adv, i) => (
                <div 
                  key={i} 
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.15 + 0.2}s`}}
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <adv.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">{adv.title}</h3>
                  <p className="mt-2 text-muted-foreground">{adv.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-24" id="pricing">
            <div className="container">
                <div className="mx-auto mb-12 max-w-3xl text-center animate-fade-in-up">
                    <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                        Şəffaf Qiymətlər
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Fəaliyyətinizə uyğun ən yaxşı planı seçin. Heç bir gizli ödəniş yoxdur.
                    </p>
                </div>
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start max-w-5xl mx-auto">
                    {pricingPlans.map((plan, i) => (
                        <Card 
                            key={plan.id} 
                            className={`
                                ${plan.isPopular ? "border-primary border-2 shadow-2xl shadow-primary/10" : "bg-card"} 
                                flex flex-col rounded-2xl transition-transform duration-300 hover:-translate-y-2 animate-fade-in-up
                            `}
                            style={{ animationDelay: `${i * 0.15 + 0.3}s`, animationDuration: '0.9s' }}
                        >
                            {plan.isPopular && <div className="absolute top-0 right-4 -mt-3 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">POPULYAR</div>}
                            <CardHeader className="flex-grow">
                                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="flex items-baseline gap-2 pt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'}>
                                    {plan.price === 'Xüsusi' ? "Əlaqə Saxlayın" : "Planı Seçin"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {pricingPlans.length === 0 && (
                        <p className="col-span-full text-center text-muted-foreground">Hazırda heç bir qiymət planı mövcud deyil.</p>
                    )}
                </div>
            </div>
        </section>

        {/* Blog Section */}
        <section className="py-16 md:py-24 bg-secondary/50" id="blog">
             <div className="container">
                <div className="mx-auto mb-12 max-w-3xl text-center animate-fade-in-up">
                    <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                        Ən Son Yeniliklər
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Səhiyyə texnologiyaları və platformamızdakı yeniliklər haqqında məqalələrimiz.
                    </p>
                </div>
                <div className="grid gap-8 lg:grid-cols-3">
                {blogPosts.length === 0 ? (
                    <p className="col-span-full text-center text-muted-foreground">Heç bir blog yazısı tapılmadı.</p>
                ) : blogPosts.map((post, i) => (
                    <Link key={post.id} href={`/blog/${post.id}`} className="group block">
                    <Card 
                        className="overflow-hidden h-full flex flex-col rounded-xl shadow-md transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-2 animate-fade-in-up"
                        style={{ animationDelay: `${i * 0.1 + 0.3}s`, animationDuration: '0.9s' }}
                    >
                        <div className="relative h-48 w-full">
                            <Image src={post.imageUrl} alt={post.title} fill className="object-cover" data-ai-hint={post.imageHint} />
                        </div>
                        <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                        <CardDescription>{new Date(post.datePublished).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })} • {post.author}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <p className="text-muted-foreground line-clamp-3">{post.description}</p>
                        </CardContent>
                        <CardFooter>
                        <span className="text-sm font-semibold text-primary group-hover:underline">Daha çox oxu →</span>
                        </CardFooter>
                    </Card>
                    </Link>
                ))}
                </div>
                 <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <Button asChild variant="outline">
                        <Link href="/blog">Bütün Yazılara Bax</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 md:py-24 lg:py-32">
          <div className="container grid gap-16 md:grid-cols-2 items-start max-w-6xl mx-auto">
             <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Bizimlə Əlaqə</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Suallarınız, təklifləriniz və ya partnyorluq imkanları üçün bizə yazın. Komandamız sizə kömək etməyə hazırdır.
                </p>
                <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Mail className="h-6 w-6"/>
                        </div>
                        <div>
                            <h3 className="font-semibold">Email</h3>
                            <a href="mailto:info@reseptplus.az" className="text-muted-foreground hover:text-primary">info@reseptplus.az</a>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Phone className="h-6 w-6"/>
                        </div>
                        <div>
                            <h3 className="font-semibold">Telefon</h3>
                            <p className="text-muted-foreground">+994 (12) 345 67 89</p>
                        </div>
                    </div>
                </div>
             </div>
             <Card 
                className="animate-fade-in-up"
                style={{ animationDelay: '0.4s' }}
              >
                <CardHeader>
                    <CardTitle>Mesaj Göndərin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Adınız</Label>
                        <Input id="name" placeholder="Adınız və Soyadınız" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="email@nümunə.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Mesajınız</Label>
                        <Textarea id="message" placeholder="Mesajınızı buraya yazın..." className="min-h-[120px]" />
                    </div>
                    <Button className="w-full">Göndər</Button>
                </CardContent>
             </Card>
          </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  );
}
