'use client';

import { Logo } from '@/components/logo';
import {
  ArrowDown,
  BarChart3,
  Bot,
  CircleDollarSign,
  Cpu,
  FileText,
  Goal,
  HeartPulse,
  Lightbulb,
  Map,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const sections = [
  { id: 'cover', title: 'Başlanğıc' },
  { id: 'problem', title: 'Problem' },
  { id: 'solution', title: 'Həll Yolu' },
  { id: 'product', title: 'Məhsul / Demo' },
  { id: 'value-prop', title: 'Dəyər Təklifi' },
  { id: 'market-size', title: 'Bazar Həcmi' },
  { id: 'business-model', title: 'Biznes Modeli' },
  { id: 'traction', title: 'İnkişaf Mərhələsi' },
  { id: 'competition', title: 'Rəqabət' },
  { id: 'technology', title: 'Texnologiya' },
  { id: 'team', title: 'Komanda' },
  { id: 'roadmap', title: 'Yol Xəritəsi' },
  { id: 'ask', title: 'Tələb' },
];

const Slide = ({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    id={id}
    className={`min-h-screen w-full flex flex-col justify-center items-center p-8 md:p-16 text-white snap-start ${className}`}
  >
    <div className="container max-w-5xl animate-fade-in-up">{children}</div>
  </section>
);

export default function PitchDeckPage() {
  const [activeSection, setActiveSection] = useState('cover');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="bg-gray-900 scroll-smooth">
      <Link href="/" className="absolute top-8 left-8 z-20">
        <Logo className="text-white" />
      </Link>

      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id} className="flex items-center justify-end gap-2">
              <span
                className={`text-xs text-right transition-all duration-300 ${
                  activeSection === section.id
                    ? 'opacity-100 text-white'
                    : 'opacity-0 text-gray-400'
                }`}
              >
                {section.title}
              </span>
              <a
                href={`#${section.id}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-primary scale-150'
                    : 'bg-gray-500 hover:bg-gray-300'
                }`}
              />
            </li>
          ))}
        </ul>
      </nav>

      <main className="snap-y snap-mandatory h-screen overflow-y-auto">
        <Slide id="cover" className="bg-gray-900 text-center">
          <Logo className="mx-auto mb-8 invert brightness-0" />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            ReseptPlus
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-300">
            Səhiyyəni Rəqəmsal Zirvəyə Daşıyırıq.
          </p>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ArrowDown className="w-8 h-8" />
          </div>
        </Slide>

        <Slide id="problem" className="bg-gray-800">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            Problem <span className="text-primary">.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-700/50 rounded-lg">
              <HeartPulse className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-xl font-semibold">Kağız Resept Səhvləri</h3>
              <p className="mt-2 text-gray-300">
                Əl ilə yazılan reseptlər oxunmaz ola bilər, bu da yanlış
                dozajlara və dərman səhvlərinə yol açaraq xəstə təhlükəsizliyini
                riskə atır.
              </p>
            </div>
            <div className="p-6 bg-gray-700/50 rounded-lg">
              <Users className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-xl font-semibold">Qopuq Əlaqə</h3>
              <p className="mt-2 text-gray-300">
                Həkim, əczaçı və xəstə arasında effektiv məlumat axını yoxdur.
                Bu, vaxt itkisinə və müalicə prosesində gecikmələrə səbəb olur.
              </p>
            </div>
            <div className="p-6 bg-gray-700/50 rounded-lg">
              <FileText className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-xl font-semibold">Mərkəzləşdirilmiş Tarixçə Yoxdur</h3>
              <p className="mt-2 text-gray-300">
                Xəstənin tam tibbi tarixçəsi vahid bir yerdə toplanmır, bu da
                həkimlərin məlumatlı qərar verməsini çətinləşdirir.
              </p>
            </div>
          </div>
        </Slide>

        <Slide id="solution" className="bg-gray-900">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            Həll Yolumuz <span className="text-primary">.</span>
          </h2>
          <p className="text-center text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
            ReseptPlus, səhiyyə ekosisteminin bütün iştirakçılarını —
            <span className="text-primary font-semibold">həkimləri</span>,{' '}
            <span className="text-primary font-semibold">əczaçıları</span> və{' '}
            <span className="text-primary font-semibold">xəstələri</span> —
            vahid, təhlükəsiz və səmərəli bir rəqəmsal platformada birləşdirir.
          </p>
          <div className="text-center mt-12">
             <ShieldCheck className="w-24 h-24 text-green-500 mx-auto drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
             <p className="mt-4 font-semibold text-lg">Təhlükəsiz, Sürətli və Vahid Sistem</p>
          </div>
        </Slide>

        <Slide id="product" className="bg-gray-800">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            Məhsul / Necə İşləyir? <span className="text-primary">.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-center items-center">
            <div className="p-6 bg-gray-700/50 rounded-lg">
                <Users className="w-12 h-12 text-primary mx-auto mb-4"/>
                <h3 className="text-xl font-semibold">Həkim Paneli</h3>
                <p className="mt-2 text-gray-300">Xəstəni axtarır, resepti rəqəmsal olaraq yazır və AI məsləhəti alır.</p>
            </div>
             <div className="text-2xl font-bold text-primary animate-pulse">→</div>
            <div className="p-6 bg-gray-700/50 rounded-lg">
                <Cpu className="w-12 h-12 text-primary mx-auto mb-4"/>
                <h3 className="text-xl font-semibold">Aptek Paneli</h3>
                <p className="mt-2 text-gray-300">İki faktorlu təsdiqlə resepti yoxlayır və dərmanı təhvil verir.</p>
            </div>
          </div>
        </Slide>

        <Slide id="value-prop" className="bg-gray-900">
             <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
                Unikal Dəyər Təklifimiz <span className="text-primary">.</span>
            </h2>
             <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-4">
                    <Bot className="w-12 h-12 text-primary mx-auto mb-4"/>
                    <h3 className="text-xl font-semibold">AI-Dəstəkli Qərar</h3>
                    <p className="mt-2 text-gray-300">Həkimlər üçün diaqnoz və dərman qarşılıqlı təsirləri barədə AI məsləhətləri.</p>
                </div>
                 <div className="p-4">
                    <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4"/>
                    <h3 className="text-xl font-semibold">İki Faktorlu Təhlükəsizlik</h3>
                    <p className="mt-2 text-gray-300">Həm FİN kod, həm də xəstənin telefonuna göndərilən birdəfəlik kod ilə resept yoxlaması.</p>
                </div>
                 <div className="p-4">
                    <Map className="w-12 h-12 text-primary mx-auto mb-4"/>
                    <h3 className="text-xl font-semibold">Ağıllı Aptek Axtarışı</h3>
                    <p className="mt-2 text-gray-300">Reseptdəki bütün dərmanların olduğu ən yaxın apteki xəritədə göstərən sistem.</p>
                </div>
            </div>
        </Slide>

        <Slide id="market-size" className="bg-gray-800">
             <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
                Bazar Həcmi (Azərbaycan) <span className="text-primary">.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-gray-700/50 rounded-lg">
                    <h3 className="text-2xl font-bold text-primary">TAM</h3>
                    <p className="text-4xl font-bold mt-2">150M+ ₼</p>
                    <p className="mt-2 text-gray-300">Ümumi Səhiyyə Xidmətləri Bazarı</p>
                </div>
                 <div className="p-6 bg-gray-700/50 rounded-lg">
                    <h3 className="text-2xl font-bold text-primary">SAM</h3>
                    <p className="text-4xl font-bold mt-2">50M+ ₼</p>
                    <p className="mt-2 text-gray-300">Elektron Səhiyyə və Resept Bazarı</p>
                </div>
                 <div className="p-6 bg-gray-700/50 rounded-lg">
                    <h3 className="text-2xl font-bold text-primary">SOM</h3>
                    <p className="text-4xl font-bold mt-2">5M+ ₼</p>
                    <p className="mt-2 text-gray-300">İlk 3 İldə Hədəflənən Bazar Payı</p>
                </div>
            </div>
        </Slide>
        
        <Slide id="business-model" className="bg-gray-900">
             <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
                Biznes Modeli <span className="text-primary">.</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-gray-800/60 rounded-lg">
                    <h3 className="text-2xl font-semibold flex items-center gap-3"><Users className="text-primary"/> Xəstəxanalar (B2B SaaS)</h3>
                    <p className="mt-4 text-xl">Aylıq abunəlik haqqı (hər həkim üçün)</p>
                    <p className="text-3xl font-bold mt-2">20 ₼ <span className="text-lg font-normal text-gray-400">/həkim/ay</span></p>
                </div>
                 <div className="p-8 bg-gray-800/60 rounded-lg">
                    <h3 className="text-2xl font-semibold flex items-center gap-3"><CircleDollarSign className="text-primary"/> Apteklər (Tranzaksiya)</h3>
                    <p className="mt-4 text-xl">Hər təhvil verilən reseptdən komissiya</p>
                    <p className="text-3xl font-bold mt-2">3% <span className="text-lg font-normal text-gray-400">/resept</span></p>
                </div>
            </div>
        </Slide>

        <Slide id="traction" className="bg-gray-800">
             <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
                İnkişaf Mərhələsi <span className="text-primary">.</span>
            </h2>
            <div className="max-w-2xl mx-auto">
                <ul className="space-y-6 text-lg">
                    <li className="flex items-center gap-4"><CheckCircleIcon className="text-green-500"/> <strong>MVP Hazırdır:</strong> Tam funksional prototip (Həkim, Əczaçı, Xəstə panelləri).</li>
                    <li className="flex items-center gap-4"><CheckCircleIcon className="text-green-500"/> <strong>Pilot Razılaşma:</strong> Naxçıvan Dövlət Universiteti ilə pilot layihə üçün ilkin razılıq.</li>
                     <li className="flex items-center gap-4"><CheckCircleIcon className="text-green-500"/> <strong>Texnoloji Stack:</strong> Müasir və genişlənə bilən arxitektura (Next.js, Firebase, Google AI).</li>
                </ul>
            </div>
        </Slide>

        <Slide id="competition" className="bg-gray-900">
             <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
                Rəqabət <span className="text-primary">.</span>
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-600">
                            <th className="p-4">Xüsusiyyət</th>
                            <th className="p-4 text-primary font-bold">ReseptPlus</th>
                            <th className="p-4">Ənənəvi Kağız Resept</th>
                            <th className="p-4">Xəstəxana Daxili Sistemlər</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-700"><td className="p-4">AI Dəstəyi</td><td className="p-4 text-green-500">Var</td><td className="p-4 text-red-500">Yoxdur</td><td className="p-4 text-red-500">Yoxdur</td></tr>
                        <tr className="border-b border-gray-700"><td className="p-4">Vahid Ekosistem</td><td className="p-4 text-green-500">Var</td><td className="p-4 text-red-500">Yoxdur</td><td className="p-4 text-yellow-500">Məhdud</td></tr>
                        <tr className="border-b border-gray-700"><td className="p-4">Aptek Axtarışı</td><td className="p-4 text-green-500">Var</td><td className="p-4 text-red-500">Yoxdur</td><td className="p-4 text-red-500">Yoxdur</td></tr>
                        <tr className="border-b border-gray-700"><td className="p-4">İki Faktorlu Təsdiq</td><td className="p-4 text-green-500">Var</td><td className="p-4 text-red-500">Yoxdur</td><td className="p-4 text-red-500">Yoxdur</td></tr>
                    </tbody>
                </table>
            </div>
        </Slide>

        <Slide id="technology" className="bg-gray-800">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
                Texnologiya və Təhlükəsizlik <span className="text-primary">.</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 className="text-2xl font-semibold mb-4">Arxitektura</h3>
                    <ul className="space-y-2 list-disc pl-5">
                        <li><strong>Frontend:</strong> Next.js & React</li>
                        <li><strong>Backend & DB:</strong> Firebase (Firestore, Auth)</li>
                        <li><strong>AI/ML:</strong> Google Genkit (Gemini)</li>
                        <li><strong>Hosting:</strong> Firebase App Hosting</li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-2xl font-semibold mb-4">Təhlükəsizlik</h3>
                    <ul className="space-y-2 list-disc pl-5">
                         <li>Rol-əsaslı giriş nəzarəti (RBAC)</li>
                        <li>Bütün məlumatların şifrələnməsi (at-rest & in-transit)</li>
                        <li>İki faktorlu resept yoxlama (FIN + OTP)</li>
                    </ul>
                </div>
            </div>
        </Slide>

        <Slide id="team" className="bg-gray-900">
             <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
                Komanda <span className="text-primary">.</span>
            </h2>
            <p className="text-center text-xl text-gray-400">Bu bölməyə komanda üzvləri haqqında məlumat yerləşdiriləcək.</p>
        </Slide>
        
        <Slide id="roadmap" className="bg-gray-800">
             <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
                Yol Xəritəsi <span className="text-primary">.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-gray-700/50 rounded-lg">
                    <h3 className="text-xl font-semibold">İlk 6 Ay</h3>
                    <ul className="mt-4 space-y-2 list-disc pl-5">
                        <li>Pilot layihənin NDU-da başlaması</li>
                        <li>Mobil tətbiq (Pasiyent üçün) MVP</li>
                        <li>İlk 5 apteklə partnyorluq</li>
                    </ul>
                </div>
                <div className="p-6 bg-gray-700/50 rounded-lg">
                    <h3 className="text-xl font-semibold">12 Ay</h3>
                    <ul className="mt-4 space-y-2 list-disc pl-5">
                        <li>Genişləndirilmiş analitika paneli</li>
                        <li>Sığorta şirkətləri ilə inteqrasiya</li>
                        <li>Bakı bazarına giriş</li>
                    </ul>
                </div>
                 <div className="p-6 bg-gray-700/50 rounded-lg">
                    <h3 className="text-xl font-semibold">Uzunmüddətli</h3>
                    <ul className="mt-4 space-y-2 list-disc pl-5">
                        <li>Telemedisina funksiyaları</li>
                        <li>Dərmanların evə çatdırılması inteqrasiyası</li>
                        <li>Beynəlxalq bazarlara çıxış</li>
                    </ul>
                </div>
            </div>
        </Slide>

        <Slide id="ask" className="bg-gray-900 text-center">
             <h2 className="text-4xl md:text-5xl font-bold mb-12">
                Tələbimiz <span className="text-primary">.</span>
            </h2>
            <p className="text-5xl font-bold text-primary">50,000 ₼</p>
            <p className="mt-4 text-xl text-gray-300">12 aylıq əməliyyat xərcləri, komandanın genişləndirilməsi və marketinq üçün.</p>
             <p className="mt-8 text-xl text-gray-300">və ya</p>
             <p className="mt-8 text-2xl font-semibold">Strateji Tərəfdaşlıq</p>
             <p className="mt-2 text-lg text-gray-400">Pilot layihələrin həyata keçirilməsi və bazarın genişləndirilməsi üçün.</p>
        </Slide>

      </main>
    </div>
  );
}


function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
