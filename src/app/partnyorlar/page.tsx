
import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Handshake, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function PartnersPage() {
    const supportingOrganizations = [
        {
            name: "İnnovasiya və Rəqəmsal İnkişaf Agentliyi",
            logoUrl: "https://picsum.photos/seed/partner1/200/100",
            description: "Texnoloji innovasiyaların dəstəklənməsi.",
            imageHint: "government building"
        },
        {
            name: "Azərbaycan Səhiyyə Nazirliyi",
            logoUrl: "https://picsum.photos/seed/partner2/200/100",
            description: "Səhiyyə sisteminin modernləşdirilməsi.",
            imageHint: "medical symbol"
        },
        {
            name: "Startup Azerbaijan",
            logoUrl: "https://picsum.photos/seed/partner3/200/100",
            description: "Yerli startap ekosisteminin inkişafı.",
            imageHint: "startup office"
        },
    ];

    const clientCompanies = [
        {
            name: "Medistyle Hospital",
            logoUrl: "https://picsum.photos/seed/client1/200/100",
            description: "Özəl tibb mərkəzi.",
            imageHint: "modern hospital"
        },
        {
            name: "Zəfəran Apteklər Şəbəkəsi",
            logoUrl: "https://picsum.photos/seed/client2/200/100",
            description: "Geniş apteklər şəbəkəsi.",
            imageHint: "pharmacy storefront"
        },
        {
            name: "Avrasiya Klinikası",
            logoUrl: "https://picsum.photos/seed/client3/200/100",
            description: "Bütün tibbi xidmətlər.",
            imageHint: "clinic building"
        },
        {
            name: "Sağlam Ailə Tibb Mərkəzi",
            logoUrl: "https://picsum.photos/seed/client4/200/100",
            description: "Ailə sağlamlığı üzrə ixtisaslaşmışdır.",
            imageHint: "family doctor"
        }
    ];


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
                    {supportingOrganizations.map((org) => (
                        <Card key={org.name} className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20">
                            <div className="relative w-48 h-24 mb-4">
                                <Image src={org.logoUrl} alt={`${org.name} logo`} layout="fill" objectFit="contain" data-ai-hint={org.imageHint} />
                            </div>
                            <CardContent className="p-0">
                                <h3 className="font-semibold text-lg">{org.name}</h3>
                                <p className="text-muted-foreground text-sm mt-1">{org.description}</p>
                            </CardContent>
                        </Card>
                    ))}
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
                        SaglikNet platformasına etimad edərək fəaliyyətlərini gücləndirən şirkətlər.
                    </p>
                </div>
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {clientCompanies.map((company) => (
                         <Card key={company.name} className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20">
                            <div className="relative w-40 h-20 mb-4">
                                <Image src={company.logoUrl} alt={`${company.name} logo`} layout="fill" objectFit="contain" data-ai-hint={company.imageHint} />
                            </div>
                             <CardContent className="p-0">
                                <h3 className="font-semibold text-lg">{company.name}</h3>
                                <p className="text-muted-foreground text-sm mt-1">{company.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  );
}
