'use client';

import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { PricingPlan } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function PlanSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-3/5" />
                <Skeleton className="h-4 w-4/5 mt-2" />
                <div className="pt-4">
                    <Skeleton className="h-10 w-2/5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );
}

export default function PricingPage() {
    const { firestore } = useFirebase();
    const plansQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'pricingPlans'), orderBy('price')), [firestore]);
    const { data: plans, isLoading } = useCollection<PricingPlan>(plansQuery);


  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/50">
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
                {isLoading && Array.from({length: 3}).map((_, i) => <PlanSkeleton key={i} />)}
                {!isLoading && plans?.map(plan => (
                    <Card key={plan.id} className={plan.isPopular ? "border-primary border-2 shadow-lg relative" : ""}>
                         {plan.isPopular && <div className="absolute top-0 right-4 -mt-3 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">POPULYAR</div>}
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.title}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="flex items-baseline gap-2 pt-4">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">{plan.price === 'Xüsusi' ? "Əlaqə Saxlayın" : "Planı Seçin"}</Button>
                        </CardFooter>
                    </Card>
                ))}
                 {!isLoading && plans?.length === 0 && (
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
