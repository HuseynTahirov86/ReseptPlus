import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { db } from "@/firebase/server-init";
import type { BlogPost } from "@/lib/types";

const sampleBlogPost: BlogPost[] = [
    {
        id: "sample-post-1",
        title: "ReseptPlus: Səhiyyədə Rəqəmsal İnqilab",
        description: "Kağız reseptlərin yaratdığı xaosu, uzun növbələri və potensial səhvləri geridə qoyun. ReseptPlus, səhiyyə sistemini necə daha ağıllı, sürətli və təhlükəsiz etdiyimizi kəşf edin.",
        author: "ReseptPlus Komandası",
        datePublished: new Date().toISOString(),
        imageUrl: "https://i.ibb.co/Nd15wKwV/hero.png",
        imageHint: "digital health",
        content: `
Kağız reseptlər dövrü artıq tarixə qarışır. Onların itməsi, oxunmaz olması və ya səhv dərmanların verilməsinə səbəb olması kimi risklər həm xəstələr, həm həkimlər, həm də əczaçılar üçün ciddi problemlər yaradır. ReseptPlus, bu problemləri kökündən həll etmək üçün yaradılmış vahid, təhlükəsiz və ağıllı bir rəqəmsal resept platformasıdır.

### Biz Nəyi Həll Edirik?

**1. Səmərəsizlik:** Həkimlər qiymətli vaxtlarını resept yazmağa, xəstələr isə apteklərdə uzun növbələr gözləməyə sərf edir. ReseptPlus ilə həkimlər reseptləri saniyələr içində tərtib edir, xəstələr isə dərmanlarını növbə gözləmədən əldə edə bilərlər.

**2. Təhlükəsizlik Riskləri:** Oxunmaz həkim yazısı və ya diqqətsizlik nəticəsində yanlış dərmanların verilməsi ciddi sağlamlıq problemlərinə yol aça bilər. Platformamız, dərman məlumatlarını standartlaşdıraraq və iki faktorlu təsdiqləmə (FİN və OTP) ilə bu riskləri minimuma endirir.

**3. Məlumat Qopuqluğu:** Xəstənin səhhəti haqqında məlumatlar (keçmiş reseptlər, allergiyalar) fərqli yerlərdə pərakəndə halda olur. ReseptPlus, bütün resept tarixçəsini vahid bir profildə toplayaraq həkimlərə daha dəqiq qərarlar vermək üçün 360 dərəcəlik bir görüntü təqdim edir.

### ReseptPlus-ın Əsas Üstünlükləri:

*   **Həkimlər üçün:** Süni intellekt dəstəkli konsultasiya, xəstə tarixçəsinə anında çıxış və daha sürətli resept yazma imkanı.
*   **Xəstələr üçün:** Kağız daşımaq dərdindən azad olmaq, apteklərdə vaxt itirməmək və bütün səhiyyə məlumatlarını bir yerdə idarə etmək.
*   **Əczaçılar üçün:** Səhvsiz və sürətli resept emalı, avtomatlaşdırılmış inventar idarəçiliyi və xəstəxanalarla birbaşa əlaqə.

Gələcəyin səhiyyəsi rəqəmsaldır. ReseptPlus, bu gələcəyə atılan ən vacib addımlardan biridir. Bizə qoşulun və bu inqilabın bir parçası olun.
        `
    }
];

async function getBlogPosts() {
    try {
        const snapshot = await db.collection('blogPosts').orderBy('datePublished', 'desc').get();
        if (snapshot.empty) {
            return sampleBlogPost;
        }
        return snapshot.docs.map(doc => doc.data() as BlogPost);
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        // On error, return the sample post to ensure the page works.
        return sampleBlogPost;
    }
}

export default async function BlogPage() {
    const blogPosts = await getBlogPosts();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Blog</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Səhiyyə texnologiyaları və ReseptPlus yenilikləri haqqında ən son məqalələr.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container">
             <div className="grid gap-8 lg:grid-cols-3">
              {blogPosts.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground">Heç bir blog yazısı tapılmadı.</p>
              ) : blogPosts.map((post, i) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="group block">
                  <Card 
                    className="overflow-hidden h-full flex flex-col bg-glass-bg border-glass-border rounded-xl shadow-lg transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-2 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.9s' }}
                  >
                    <div className="relative h-48 w-full">
                        <Image src={post.imageUrl} alt={post.title} fill className="object-cover" data-ai-hint={post.imageHint} />
                    </div>
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                      <CardDescription>{new Date(post.datePublished).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })} • {post.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
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
