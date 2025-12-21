
import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Newspaper } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function BlogPage() {
    const blogPosts = [
    {
      id: 1,
      title: "Səhiyyədə Rəqəmsal Transformasiya: E-reseptlərin Rolu",
      description: "E-resept sistemlərinin səhiyyə sənayesində necə inqilab yaratdığını və həm həkimlər, həm də xəstələr üçün hansı faydaları təqdim etdiyini araşdırın.",
      imageUrl: "https://picsum.photos/seed/blog1/600/400",
      imageHint: "digital health",
      date: "15 Oktyabr 2024",
      author: "Dr. Aysel Məmmədova"
    },
    {
      id: 2,
      title: "Dərman Təhlükəsizliyi: AI Qarşılıqlı Təsirləri Necə Aşkarlayır?",
      description: "Süni intellektin potensial təhlükəli dərman qarşılıqlı təsirlərini proqnozlaşdırmaq və həkimlərə daha təhlükəsiz müalicə planları tərtib etməkdə necə kömək etdiyini öyrənin.",
      imageUrl: "https://picsum.photos/seed/blog2/600/400",
      imageHint: "artificial intelligence",
      date: "10 Oktyabr 2024",
      author: "Əli Vəliyev, Əczaçı"
    },
     {
      id: 3,
      title: "Xəstə Məlumatlarının Məxfiliyi: Bulud Əsaslı Sistemlərdə Təhlükəsizlik",
      description: "SaglikNet kimi platformalarda xəstə məlumatlarının məxfiliyini və təhlükəsizliyini təmin etmək üçün istifadə olunan ən son texnologiyalar haqqında məlumat əldə edin.",
      imageUrl: "https://picsum.photos/seed/blog3/600/400",
      imageHint: "data security",
      date: "5 Oktyabr 2024",
      author: "Leyla Həsənova, Kibertəhlükəsizlik Mütəxəssisi"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Blog</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Səhiyyə texnologiyaları və SaglikNet yenilikləri haqqında ən son məqalələr.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container">
             <div className="grid gap-8 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="group block">
                  <Card className="overflow-hidden h-full flex flex-col">
                    <div className="relative h-48 w-full">
                        <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="cover" data-ai-hint={post.imageHint} />
                    </div>
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                      <CardDescription>{post.date} • {post.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{post.description}</p>
                    </CardContent>
                     <CardFooter>
                       <span className="text-sm font-semibold text-primary group-hover:underline">Daha çox oxu →</span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

    