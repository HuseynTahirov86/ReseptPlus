import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Handshake, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { db } from "@/firebase/server-init";
import type { SupportingOrganization, ClientCompany } from "@/lib/types";

async function getPartners() {
    try {
        const supportingOrgsSnapshot = await db.collection("supportingOrganizations").get();
        const supportingOrganizations = supportingOrgsSnapshot.docs.map(doc => doc.data() as SupportingOrganization);

        const clientCompaniesSnapshot = await db.collection("clientCompanies").get();
        const clientCompanies = clientCompaniesSnapshot.docs.map(doc => doc.data() as ClientCompany);
        
        return { supportingOrganizations, clientCompanies };
    } catch (error) {
        console.error("Error fetching partners:", error);
        return { supportingOrganizations: [], clientCompanies: [] };
    }
}


export default async function PartnersPage() {
    const { supportingOrganizations, clientCompanies } = await getPartners();
    
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Partnyorlarımız</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Missiyamızı dəstəkləyən və platformamıza etimad edən qurumlarla fəxr edirik.
            </p>
          </div>
        </section>

        <section id="supporters" className="py-16 md:py-24">
            <div className="container">
                <div className="mx-auto mb-12 max-w-3xl text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
                    <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl flex items-center justify-center gap-3">
                        <Handshake className="h-10 w-10 text-primary" />
                        Dəstəkçilərimiz
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Səhiyyənin rəqəmsal transformasiyası yolunda bizə dəstək olan və innovasiyaları təşviq edən təşkilatlar.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {supportingOrganizations.map((org, i) => (
                        <Card 
                            key={org.id} 
                            className="flex flex-col items-center text-center p-6 bg-glass-bg border-glass-border rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20 animate-fade-in-up"
                            style={{ animationDelay: `${i * 0.1 + 0.2}s`, animationDuration: '0.9s' }}
                        >
                            <div className="relative w-48 h-24 mb-4">
                                <Image src={org.logoUrl} alt={`${org.name} logo`} fill className="object-contain" />
                            </div>
                            <CardContent className="p-0">
                                <h3 className="font-semibold text-lg">{org.name}</h3>
                                <p className="text-muted-foreground text-sm mt-1">{org.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                    {supportingOrganizations.length === 0 && (
                        <p className="col-span-full text-center text-muted-foreground">Hazırda heç bir dəstəkçi təşkilat yoxdur.</p>
                    )}
                </div>
            </div>
        </section>

        <section id="clients" className="py-16 md:py-24 bg-secondary/50">
            <div className="container">
                <div className="mx-auto mb-12 max-w-3xl text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
                     <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl flex items-center justify-center gap-3">
                        <Building className="h-10 w-10 text-primary" />
                        Müştərilərimiz
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        ReseptPlus platformasına etimad edərək öz fəaliyyətlərini gücləndirən və xəstə məmnuniyyətini artıran klinikalar və apteklər.
                    </p>
                </div>
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {clientCompanies.map((company, i) => (
                         <Card 
                            key={company.id} 
                            className="flex flex-col items-center text-center p-6 bg-glass-bg border-glass-border rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20 animate-fade-in-up"
                            style={{ animationDelay: `${i * 0.1 + 0.2}s`, animationDuration: '0.9s' }}
                        >
                            <div className="relative w-40 h-20 mb-4">
                                <Image src={company.logoUrl} alt={`${company.name} logo`} fill className="object-contain" />
                            </div>
                             <CardContent className="p-0">
                                <h3 className="font-semibold text-lg">{company.name}</h3>
                                <p className="text-muted-foreground text-sm mt-1">{company.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                     {clientCompanies.length === 0 && (
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
