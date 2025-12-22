import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Building, Target, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/firebase/server-init";
import type { TeamMember } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

async function getTeamMembers() {
    try {
        const snapshot = await db.collection("teamMembers").orderBy("name").get();
        return snapshot.docs.map(doc => doc.data() as TeamMember);
    } catch (error) {
        console.error("Error fetching team members:", error);
        return [];
    }
}

function TeamMemberSkeleton() {
    return (
        <Card className="text-center p-6 bg-background rounded-xl shadow-lg">
            <Skeleton className="h-28 w-28 rounded-full mx-auto mb-4" />
            <CardContent className="p-0">
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
            </CardContent>
        </Card>
    );
}

export default async function AboutUsPage() {
    const teamMembers = await getTeamMembers();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Haqqımızda</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              ReseptPlus-ın arxasındakı missiya və komanda ilə tanış olun.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container grid gap-16 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold">Missiyamız</h2>
              <p className="mt-4 text-muted-foreground">
                Bizim missiyamız səhiyyə sistemində inqilab etməkdir. Texnologiyadan istifadə edərək həkimlər, xəstələr və apteklər arasında qüsursuz, səmərəli və təhlükəsiz bir körpü yaratmağı hədəfləyirik. Hər kəs üçün səhiyyə xidmətlərini daha əlçatan və idarəolunan etmək üçün çalışırıq.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Target className="w-48 h-48 text-primary" />
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container">
            <h2 className="text-center text-3xl font-bold">Dəyərlərimiz</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <Building className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">İnnovasiya</h3>
                <p className="mt-2 text-muted-foreground">Səhiyyənin problemlərini həll etmək üçün daim yeni yollar axtarırıq.</p>
              </div>
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">İstifadəçi Mərkəzlilik</h3>
                <p className="mt-2 text-muted-foreground">Platformamızın hər bir istifadəçisinin ehtiyaclarını ön planda tuturuq.</p>
              </div>
              <div className="text-center">
                <Target className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Etibarlılıq</h3>
                <p className="mt-2 text-muted-foreground">Təhlükəsizlik və məlumatların məxfiliyi bizim üçün ən yüksək prioritetdir.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="team" className="py-16 md:py-24">
            <div className="container">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                    Komandamızla Tanış Olun
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    ReseptPlus-ın arxasında dayanan istedadlı və fədakar insanlar.
                </p>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                    <Card key={member.id} className="text-center p-6 bg-background rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20">
                        <Avatar className="h-28 w-28 mx-auto mb-4 border-4 border-primary/20">
                            <AvatarImage src={member.imageUrl} alt={member.name} data-ai-hint={member.imageHint} />
                            <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <CardContent className="p-0">
                            <h3 className="text-xl font-bold">{member.name}</h3>
                            <p className="text-primary font-medium">{member.role}</p>
                        </CardContent>
                    </Card>
                ))}
                 {teamMembers.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground">Heç bir komanda üzvü tapılmadı.</p>
                )}
                </div>
            </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
