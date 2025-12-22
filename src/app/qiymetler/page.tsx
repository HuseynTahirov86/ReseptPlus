import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase/server-init";
import type { PricingPlan } from "@/lib/types";

async function getPricingPlans() {
    try {
        const snapshot = await db.collection('pricingPlans').orderBy('price').get();
        return snapshot.docs.map(doc => doc.data() as PricingPlan);
    } catch (error) {
        console.error("Error fetching pricing plans:", error);
        return [];
    }
}

export default async function PricingPage() {
    const plans = await getPricingPlans();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/30 animate-fade-in-up">
          <div className="container text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Şəffaf Qiymətlər</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Fəaliyyətinizə uyğun ən yaxşı planı seçin. Heç bir gizli ödəniş yoxdur.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container">
             <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start">
                {plans.map((plan, i) => (
                    <Card 
                        key={plan.id} 
                        className={`
                            ${plan.isPopular ? "border-primary border-2 shadow-2xl shadow-primary/20" : "bg-glass-bg border"} 
                            flex flex-col rounded-2xl transition-transform duration-300 hover:-translate-y-2 animate-fade-in-up
                        `}
                        style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'both' }}
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
                 {plans.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground">Hazırda heç bir qiymət planı mövcud deyil.</p>
                 )}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
