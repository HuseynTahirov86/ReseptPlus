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

export default async function AboutUsPage() {
    const teamMembers = await getTeamMembers();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Haqqımızda</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              ReseptPlus-ın arxasındakı missiya, vizyon və komanda ilə tanış olun.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container grid gap-16 md:grid-cols-2 items-center">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s', animationDuration: '0.9s' }}>
              <h2 className="text-3xl font-bold">Missiyamız</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Səhiyyə xidmətlərinin göstərilməsində inqilab etmək üçün texnologiyanın gücündən istifadə edərək, həkimlər, əczaçılar və xəstələr arasında qüsursuz, təhlükəsiz və səmərəli bir ekosistem yaratmaq. Biz, hər kəs üçün səhiyyə xidmətlərini daha əlçatan, şəffaf və idarəolunan etməyi hədəfləyirik.
              </p>
            </div>
            <div className="flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.4s', animationDuration: '0.9s' }}>
              <Target className="w-48 h-48 text-primary drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]" />
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container">
            <h2 className="text-center text-3xl font-bold animate-fade-in-up" style={{ animationDuration: '0.9s' }}>Dəyərlərimiz</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s', animationDuration: '0.9s' }}>
                <Building className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">İnnovasiya</h3>
                <p className="mt-2 text-muted-foreground">Səhiyyənin mürəkkəb problemlərini həll etmək üçün daim yeni texnoloji yollar axtarırıq və tətbiq edirik.</p>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s', animationDuration: '0.9s' }}>
                <Users className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">İstifadəçi Mərkəzlilik</h3>
                <p className="mt-2 text-muted-foreground">Platformamızın hər bir istifadəçisinin – həkim, xəstə və əczaçının – ehtiyaclarını və təcrübəsini ön planda tuturuq.</p>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s', animationDuration: '0.9s' }}>
                <Target className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Etibarlılıq</h3>
                <p className="mt-2 text-muted-foreground">Məlumatların təhlükəsizliyi, məxfiliyi və sistemin dayanıqlılığı bizim üçün ən yüksək və güzəştsiz prioritetdir.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="team" className="py-16 md:py-24">
            <div className="container">
                <div className="mx-auto mb-12 max-w-3xl text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
                <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                    Komandamızla Tanış Olun
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    ReseptPlus-ın arxasında dayanan istedadlı və fədakar insanlar.
                </p>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member, i) => (
                    <Card 
                        key={member.id} 
                        className="text-center p-6 bg-glass-bg rounded-xl shadow-lg border-glass-border transition-transform duration-300 hover:-translate-y-2 hover:shadow-primary/20 animate-fade-in-up"
                        style={{ animationDelay: `${i * 0.1 + 0.3}s`, animationDuration: '0.9s' }}
                    >
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
