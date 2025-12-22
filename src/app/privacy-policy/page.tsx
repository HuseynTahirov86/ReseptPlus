import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1 py-16 md:py-24">
        <div className="container max-w-4xl animate-fade-in-up">
            <article className="prose dark:prose-invert max-w-none">
              <h1>Məxfilik Siyasəti</h1>
              <p>Son yenilənmə: {new Date().toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

              <h2>Giriş</h2>
              <p>
                "ReseptPlus" olaraq, sizin məxfiliyinizə hörmət edirik və şəxsi məlumatlarınızı qorumağa sadiqik. Bu məxfilik siyasəti, platformamızdan istifadə etdiyiniz zaman hansı məlumatları topladığımızı, onlardan necə istifadə etdiyimizi və hüquqlarınızı sizə izah edəcək.
              </p>

              <h2>Topladığımız Məlumatlar</h2>
              <p>Biz aşağıdakı növ məlumatları toplaya bilərik:</p>
              <ul>
                <li><strong>Şəxsi İdentifikasiya Məlumatları:</strong> Ad, soyad, email ünvanı, telefon nömrəsi, FİN kod, doğum tarixi.</li>
                <li><strong>Səhiyyə Məlumatları:</strong> Yazılan reseptlər, diaqnozlar, dərmanlar və həkim qeydləri kimi həssas məlumatlar.</li>
                <li><strong>Texniki Məlumatlar:</strong> IP ünvanı, brauzer növü, giriş vaxtları və istifadə etdiyiniz cihaz haqqında məlumatlar.</li>
              </ul>

              <h2>Məlumatlardan Necə İstifadə Edirik?</h2>
              <p>Topladığımız məlumatlar aşağıdakı məqsədlər üçün istifadə olunur:</p>
              <ul>
                <li>Platformanın əsas funksionallığını təmin etmək (resept yazmaq, təsdiqləmək və s.).</li>
                <li>Sizə daha yaxşı xidmət göstərmək və təcrübənizi fərdiləşdirmək.</li>
                <li>Sistem təhlükəsizliyini təmin etmək və saxtakarlığın qarşısını almaq.</li>
                <li>Platformanı təkmilləşdirmək üçün anonim statistik təhlillər aparmaq.</li>
              </ul>

              <h2>Məlumatların Paylaşılması</h2>
              <p>
                Sizin həssas səhiyyə məlumatlarınız heç bir halda marketinq məqsədləri üçün üçüncü tərəflərlə paylaşılmır. Məlumatlar yalnız aşağıdakı hallarda paylaşıla bilər:
              </p>
              <ul>
                <li>Resept prosesində iştirak edən tərəflər arasında (həkim, xəstə, əczaçı).</li>
                <li>Qanunun tələb etdiyi hallarda və ya məhkəmə qərarı ilə.</li>
              </ul>

              <h2>Təhlükəsizlik</h2>
              <p>
                Məlumatlarınızın təhlükəsizliyini təmin etmək üçün həm texniki, həm də təşkilati tədbirlər görürük. Bütün məlumatlar ötürülmə zamanı və saxlanarkən şifrələnir.
              </p>

              <h2>Dəyişikliklər</h2>
              <p>
                Bu məxfilik siyasətini zamanla yeniləyə bilərik. Bütün dəyişikliklər bu səhifədə dərc olunacaq.
              </p>

              <h2>Əlaqə</h2>
              <p>
                Məxfilik siyasətimizlə bağlı hər hansı bir sualınız olarsa, bizimlə <a href="mailto:privacy@reseptplus.az">privacy@reseptplus.az</a> ünvanı vasitəsilə əlaqə saxlaya bilərsiniz.
              </p>
            </article>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
