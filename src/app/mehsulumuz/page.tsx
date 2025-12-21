'use client';

import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import * as LucideIcons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { ProductFeature } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const IconComponent = ({ iconName, className }: { iconName: string, className?: string }) => {
    const Icon = (LucideIcons as any)[iconName];
    if (!Icon) {
        return null;
    }
    return <Icon className={className} />;
};

function FeatureSkeleton() {
    return (
        <Card className="flex flex-col text-center items-center rounded-xl border-transparent bg-background shadow-lg p-6">
            <div className="mb-4 rounded-full bg-muted p-4">
                <Skeleton className="h-10 w-10" />
            </div>
            <CardHeader className="p-0">
                 <Skeleton className="h-6 w-32 mx-auto" />
            </CardHeader>
            <CardContent className="p-0 mt-2 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mx-auto mt-2" />
            </CardContent>
        </Card>
    );
}


export default function ProductPage() {
    const { firestore } = useFirebase();
    const featuresQuery = useMemoFirebase(() => firestore && query(collection(firestore, "productFeatures"), orderBy("title")), [firestore]);
    const { data: productFeatures, isLoading } = useCollection<ProductFeature>(featuresQuery);

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Məhsulumuz</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              ReseptPlus-ın səhiyyə idarəçiliyini necə dəyişdirdiyini kəşf edin.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container">
             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {isLoading && Array.from({length: 6}).map((_, i) => <FeatureSkeleton key={i} />)}
              {!isLoading && productFeatures?.map((feature) => (
                <Card key={feature.id} className="flex flex-col text-center items-center rounded-xl border-transparent bg-background shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20 p-6">
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
               {!isLoading && productFeatures?.length === 0 && (
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
