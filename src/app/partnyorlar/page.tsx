'use client';

import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Handshake, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { SupportingOrganization, ClientCompany } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaceHolderImages } from "@/lib/placeholder-images";

function PartnerSkeleton() {
    return (
        <Card className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-lg">
            <Skeleton className="relative w-48 h-24 mb-4" />
            <CardContent className="p-0 w-full">
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full mt-2 mx-auto" />
            </CardContent>
        </Card>
    );
}


export default function PartnersPage() {
    const { firestore } = useFirebase();

    const supportingOrgsQuery = useMemoFirebase(() => firestore && collection(firestore, "supportingOrganizations"), [firestore]);
    const clientCompaniesQuery = useMemoFirebase(() => firestore && collection(firestore, "clientCompanies"), [firestore]);

    const { data: supportingOrganizations, isLoading: loadingSupporters } = useCollection<SupportingOrganization>(supportingOrgsQuery);
    const { data: clientCompanies, isLoading: loadingClients } = useCollection<ClientCompany>(clientCompaniesQuery);
    
    const partnerImages = PlaceHolderImages.filter(p => p.id.startsWith("partner-"));


  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Partnyorlarımız</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Missiyamızı dəstəkləyən və bizə etimad edən qurumlar.
            </p>
          </div>
        </section>

        <section id="supporters" className="py-16 md:py-24">
            <div className="container">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl flex items-center justify-center gap-3">
                        <Handshake className="h-10 w-10 text-primary" />
                        Dəstəkçilərimiz
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Səhiyyənin rəqəmsal transformasiyası yolunda bizə dəstək olan təşkilatlar.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {loadingSupporters && Array.from({ length: 3 }).map((_, i) => <PartnerSkeleton key={i} />)}
                    {supportingOrganizations?.map((org, index) => {
                        const img = partnerImages[index % partnerImages.length];
                        return (
                        <Card key={org.id} className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20">
                            <div className="relative w-48 h-24 mb-4">
                                <Image src={img.imageUrl} alt={`${org.name} logo`} layout="fill" objectFit="contain" data-ai-hint={img.imageHint}/>
                            </div>
                            <CardContent className="p-0">
                                <h3 className="font-semibold text-lg">{org.name}</h3>
                                <p className="text-muted-foreground text-sm mt-1">{org.description}</p>
                            </CardContent>
                        </Card>
                    )})}
                    {!loadingSupporters && supportingOrganizations?.length === 0 && (
                        <p className="col-span-full text-center text-muted-foreground">Hazırda heç bir dəstəkçi təşkilat yoxdur.</p>
                    )}
                </div>
            </div>
        </section>

        <section id="clients" className="py-16 md:py-24 bg-secondary/50">
            <div className="container">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                     <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl flex items-center justify-center gap-3">
                        <Building className="h-10 w-10 text-primary" />
                        Müştərilərimiz
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        ReseptPlus platformasına etimad edərək fəaliyyətlərini gücləndirən şirkətlər.
                    </p>
                </div>
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {loadingClients && Array.from({ length: 4 }).map((_, i) => <PartnerSkeleton key={i} />)}
                    {clientCompanies?.map((company, index) => {
                        const img = partnerImages[(index + supportingOrganizations.length) % partnerImages.length];
                        return (
                         <Card key={company.id} className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20">
                            <div className="relative w-40 h-20 mb-4">
                                <Image src={img.imageUrl} alt={`${company.name} logo`} layout="fill" objectFit="contain" data-ai-hint={img.imageHint} />
                            </div>
                             <CardContent className="p-0">
                                <h3 className="font-semibold text-lg">{company.name}</h3>
                                <p className="text-muted-foreground text-sm mt-1">{company.description}</p>
                            </CardContent>
                        </Card>
                    )})}
                     {!loadingClients && clientCompanies?.length === 0 && (
                        <p className="col-span-full text-center text-muted-foreground">Hazırda heç bir müştəri şirkət yoxdur.</p>
                    )}
                </div>
            </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  );
}
