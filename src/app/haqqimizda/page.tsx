
import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Building, Target, Users } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Haqqımızda</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              SaglikNet-in arxasındakı missiya və komanda ilə tanış olun.
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
      </main>
      <MarketingFooter />
    </div>
  );
}

    