import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Check, Plus, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase/server-init";
import type { PricingPlan } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

async function getPricingPlans() {
    try {
        const snapshot = await db.collection('pricingPlans').orderBy('price').get();
        return snapshot.docs.map(doc => doc.data() as PricingPlan);
    } catch (error) {
        console.error("Error fetching pricing plans:", error);
        return [];
    }
}

const faqItems = [
    {
        question: "Sınaq müddəti varmı?",
        answer: "Bəli, seçilmiş planlar üçün 14 günlük pulsuz sınaq müddəti təklif edirik. Bu müddət ərzində platformanın bütün xüsusiyyətlərindən məhdudiyyətsiz istifadə edə bilərsiniz."
    },
    {
        question: "İstənilən vaxt planımı dəyişə və ya ləğv edə bilərəmmi?",
        answer: "Bəli, istənilən vaxt planınızı təkmilləşdirə, aşağı sala və ya ləğv edə bilərsiniz. Dəyişikliklər növbəti faktura dövrünüzdə qüvvəyə minəcək."
    },
    {
        question: "Xüsusi (Custom) plan nə deməkdir?",
        answer: "Böyük həcmli xəstəxanalar və ya unikal tələbləri olan təşkilatlar üçün xüsusi həllər və qiymət təklifləri hazırlayırıq. Ehtiyaclarınızı müzakirə etmək üçün bizimlə əlaqə saxlayın."
    },
     {
        question: "Ödəniş üçün hansı metodları qəbul edirsiniz?",
        answer: "Bütün əsas kredit kartlarını (Visa, MasterCard) və bank köçürmələrini qəbul edirik."
    }
];

export default async function PricingPage() {
    const plans = await getPricingPlans();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
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
                            ${plan.isPopular ? "border-primary border-2 shadow-2xl shadow-primary/20" : "bg-glass-bg border-glass-border"} 
                            flex flex-col rounded-2xl transition-transform duration-300 hover:-translate-y-2 animate-fade-in-up
                        `}
                        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
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

         <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container max-w-4xl">
                 <div className="mx-auto mb-12 text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
                    <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                        Tez-tez Verilən Suallar
                    </h2>
                </div>
                <Accordion type="single" collapsible className="w-full animate-fade-in-up" style={{ animationDelay: '0.2s', animationDuration: '0.9s' }}>
                    {faqItems.map((item, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                               {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  );
}
