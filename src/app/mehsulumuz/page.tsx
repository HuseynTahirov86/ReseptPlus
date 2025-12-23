import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import * as LucideIcons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase/server-init";
import type { ProductFeature } from "@/lib/types";
import Image from "next/image";

async function getProductFeatures() {
    try {
        const snapshot = await db.collection("productFeatures").orderBy("title").get();
        return snapshot.docs.map(doc => doc.data() as ProductFeature);
    } catch (error) {
        console.error("Error fetching product features:", error);
        return [];
    }
}

const IconComponent = ({ iconName, className }: { iconName: string, className?: string }) => {
    const Icon = (LucideIcons as any)[iconName];
    if (!Icon) {
        return null;
    }
    return <Icon className={className} />;
};

export default async function ProductPage() {
    const productFeatures = await getProductFeatures();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Məhsulumuz</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              ReseptPlus-ın səhiyyə idarəçiliyini necə sadələşdirdiyini və təkmilləşdirdiyini kəşf edin.
            </p>
          </div>
        </section>
         <section className="py-16 md:py-24">
            <div className="container max-w-5xl">
                <div className="text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
                    <h2 className="text-3xl font-bold">Problemdən Həllə</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Ənənəvi resept prosesi səhvlərə, vaxt itkisinə və xəstə məmnuniyyətsizliyinə səbəb olur. ReseptPlus, bu problemləri aradan qaldırmaq üçün həkim, xəstə və əczaçını vahid, rəqəmsal bir platformada birləşdirərək səhiyyə xidmətlərinin gələcəyini formalaşdırır.
                    </p>
                </div>
            </div>
        </section>
        <section className="pb-16 md:pb-24">
          <div className="container">
             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {productFeatures.map((feature, i) => (
                <Card 
                  key={feature.id} 
                  className="flex flex-col text-center items-center rounded-xl border-glass-border bg-glass-bg p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1 + 0.2}s`, animationDuration: '0.9s' }}
                >
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                      <IconComponent iconName={feature.icon} className="h-10 w-10 text-primary" />
                  </div>
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
               {productFeatures.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground">Heç bir məhsul xüsusiyyəti tapılmadı.</p>
               )}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/50">
            <div className="container grid lg:grid-cols-2 gap-12 items-center">
                <div 
                  className="animate-fade-in-up" 
                  style={{ animationDelay: '0.2s', animationDuration: '0.9s' }}
                >
                    <h2 className="text-3xl font-bold">Xüsusi Həllər: ReseptPlus Terminalı</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Kompüter infrastrukturu olmayan xəstəxanalar və apteklər üçün xüsusi olaraq hazırlanmış "ReseptPlus Terminalı" ilə rəqəmsal səhiyyə hər kəs üçün əlçatandır. Bu kompakt və istifadəsi asan cihaz, internetə çıxışı məhdud olan yerlərdə belə platformamızın bütün üstünlüklərindən yararlanmağa imkan verir.
                    </p>
                    <ul className="mt-6 space-y-4 text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <LucideIcons.CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                            <span>Minimalist dizayn və asan quraşdırma.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <LucideIcons.CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                            <span>Toxunuşlu ekran vasitəsilə intuitiv idarəetmə.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <LucideIcons.CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                            <span>Offline rejimdə işləmə və avtomatik sinxronizasiya.</span>
                        </li>
                    </ul>
                </div>
                 <div 
                  className="relative animate-fade-in-up" 
                  style={{ animationDelay: '0.4s', animationDuration: '0.9s' }}
                >
                    <Image
                        src="https://i.ibb.co/G6nS5z6/Dark-Modern-Corporate-App-Development-Startup-Pitch-Deck-Presentation.png"
                        alt="ReseptPlus Terminal Device"
                        width={600}
                        height={400}
                        className="rounded-xl shadow-2xl shadow-primary/10"
                    />
                </div>
            </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  );
}
