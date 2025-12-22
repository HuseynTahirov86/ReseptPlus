import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1 py-16 md:py-24">
        <div className="container max-w-4xl animate-fade-in-up">
            <article className="prose dark:prose-invert max-w-none">
              <h1>Xidmət Şərtləri</h1>
              <p>Son yenilənmə: {new Date().toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

              <h2>1. Razılaşma</h2>
              <p>
                "ReseptPlus" platformasına daxil olmaqla və ya ondan istifadə etməklə, siz bu Xidmət Şərtlərinə və bütün müvafiq qanun və qaydalara tabe olmağa razılaşırsınız. Əgər bu şərtlərdən hər hansı biri ilə razı deyilsinizsə, platformadan istifadə etməyiniz qadağandır.
              </p>

              <h2>2. Lisenziyadan İstifadə</h2>
              <p>
                Sizə yalnız şəxsi, qeyri-kommersiya məqsədli istifadə üçün platformanın funksiyalarından istifadə etmək üçün məhdud, geri alına bilən lisenziya verilir. Bu lisenziya sizə aşağıdakı hüquqları vermir:
              </p>
              <ul>
                <li>Platformanın hər hansı bir hissəsini dəyişdirmək, kopyalamaq və ya törəmə əsərlər yaratmaq;</li>
                <li>Platformanı dekompilyasiya etmək və ya tərs mühəndislik etmək;</li>
                <li>Hər hansı bir avtomatlaşdırılmış sistemdən (botlar, skriptlər) istifadə edərək platformaya daxil olmaq.</li>
              </ul>

              <h2>3. Məsuliyyətdən İmtina</h2>
              <p>
                "ReseptPlus" platforması "olduğu kimi" təqdim olunur. Platformanın fasiləsiz və ya xətasız olacağına zəmanət vermirik. Platforma tibbi məsləhət vermir. Bütün tibbi qərarlar yalnız lisenziyalı səhiyyə mütəxəssisləri tərəfindən verilməlidir. Yanlış diaqnoz, müalicə və ya dərman təyin edilməsi ilə bağlı heç bir məsuliyyət daşımırıq.
              </p>

              <h2>4. İstifadəçi Davranışı</h2>
              <p>Siz razılaşırsınız ki, platformadan aşağıdakı məqsədlər üçün istifadə etməyəcəksiniz:</p>
              <ul>
                <li>Qanunsuz və ya saxta fəaliyyətlər həyata keçirmək.</li>
                <li>Başqa bir şəxsin hesabına icazəsiz daxil olmaq.</li>
                <li>Platformanın normal fəaliyyətini pozmaq və ya ona müdaxilə etmək.</li>
              </ul>

              <h2>5. Məhdudiyyətlər</h2>
              <p>
                Heç bir halda "ReseptPlus" və ya onun təchizatçıları platformadan istifadə və ya istifadə edə bilməmək nəticəsində yaranan hər hansı bir zərərə (məlumat itkisi, işin dayanması və s. daxil olmaqla) görə məsuliyyət daşımayacaq.
              </p>

              <h2>6. Şərtlərin Dəyişdirilməsi</h2>
              <p>
                "ReseptPlus" bu xidmət şərtlərini istənilən vaxt xəbərdarlıq etmədən yeniləyə bilər. Platformadan istifadə etməyə davam etməklə, siz həmin vaxt qüvvədə olan versiyaya tabe olmağa razılaşırsınız.
              </p>
              
               <h2>Əlaqə</h2>
              <p>
                Xidmət şərtlərimizlə bağlı hər hansı bir sualınız olarsa, bizimlə <a href="mailto:legal@reseptplus.az">legal@reseptplus.az</a> ünvanı vasitəsilə əlaqə saxlaya bilərsiniz.
              </p>
            </article>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
