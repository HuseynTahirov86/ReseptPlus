
import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Check, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const plans = [
    {
        title: "Fərdi Həkim",
        price: "49₼",
        period: "/ay",
        description: "Fərdi fəaliyyət göstərən həkimlər üçün mükəmməl seçim.",
        features: [
            "Limitsiz resept yazma",
            "500 xəstəyə qədər idarəetmə",
            "AI dərman təklifləri",
            "E-mail dəstəyi"
        ],
        isPopular: false,
    },
    {
        title: "Klinika",
        price: "199₼",
        period: "/ay",
        description: "Kiçik və orta ölçülü klinikalar üçün ideal həll.",
        features: [
            "10 həkimə qədər hesab",
            "5000 xəstəyə qədər idarəetmə",
            "Genişləndirilmiş AI analizləri",
            "Prioritetli dəstək"
        ],
        isPopular: true,
    },
    {
        title: "Xəstəxana",
        price: "Xüsusi",
        period: "",
        description: "Böyük xəstəxanalar və səhiyyə şəbəkələri üçün fərdi həllər.",
        features: [
            "Limitsiz həkim və xəstə",
            "Fərdi inteqrasiyalar (HL7/FHIR)",
            "Xüsusi analitika paneli",
            "24/7 texniki dəstək"
        ],
        isPopular: false,
    }
  ]
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
                {plans.map(plan => (
                    <Card key={plan.title} className={plan.isPopular ? "border-primary border-2 shadow-lg relative" : ""}>
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
                            <Button className="w-full">{plan.title === 'Xəstəxana' ? "Əlaqə Saxlayın" : "Planı Seçin"}</Button>
                        </CardFooter>
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

    