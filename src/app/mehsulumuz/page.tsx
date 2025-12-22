import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import * as LucideIcons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase/server-init";
import type { ProductFeature } from "@/lib/types";

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
          <div className="container text-center animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Məhsulumuz</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              ReseptPlus-ın səhiyyə idarəçiliyini necə dəyişdirdiyini kəşf edin.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container">
             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {productFeatures.map((feature, i) => (
                <Card 
                  key={feature.id} 
                  className="flex flex-col text-center items-center rounded-xl border-glass-border bg-glass-bg p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
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
      </main>
      <MarketingFooter />
    </div>
  );
}
