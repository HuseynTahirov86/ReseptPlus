
import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Bot, ClipboardList, Pill, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductPage() {
  const productFeatures = [
    {
      icon: <ClipboardList className="h-10 w-10 text-primary" />,
      title: "Rəqəmsal Reseptlər",
      description: "Kağız reseptləri unudun. Həkimlər asanlıqla rəqəmsal reseptlər yaradır, xəstələr isə anında qəbul edir.",
    },
    {
      icon: <Stethoscope className="h-10 w-10 text-primary" />,
      title: "Həkimlər üçün Panel",
      description: "Xəstə tarixçəsini asanlıqla izləyin, reseptləri idarə edin və fəaliyyətiniz haqqında analitika əldə edin.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Xəstə Portalı",
      description: "Xəstələr bütün reseptlərinə bir yerdən daxil ola, dərman xatırlatmaları qura və aptekləri tapa bilərlər.",
    },
     {
      icon: <Pill className="h-10 w-10 text-primary" />,
      title: "Aptek İnteqrasiyası",
      description: "Apteklər reseptləri saniyələr içində təsdiqləyir, inventarı idarə edir və xidmət sürətini artırır.",
    },
    {
      icon: <Bot className="h-10 w-10 text-primary" />,
      title: "AI Dəstəkli Təkliflər",
      description: "Həkimlər üçün potensial dərman qarşılıqlı təsirləri, doza uyğunlaşdırmaları və təkrarlar barədə ağıllı təkliflər.",
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: "Maksimum Təhlükəsizlik",
      description: "Bütün məlumatlar ən yüksək standartlarla şifrələnir və qorunur, məxfiliyinizi tam təmin edir.",
    },
  ]
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Məhsulumuz</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              SaglikNet-in səhiyyə idarəçiliyini necə dəyişdirdiyini kəşf edin.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container">
             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {productFeatures.map((feature, i) => (
                <Card key={i} className="flex flex-col text-center items-center rounded-xl border-transparent bg-background shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20 p-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                      {feature.icon}
                  </div>
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                    <p className="text-muted-foreground">{feature.description}</p>
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

    