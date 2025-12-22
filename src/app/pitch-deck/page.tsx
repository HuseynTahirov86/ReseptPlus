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
import { cn } from '@/lib/utils';

const sections = [
  { id: 'cover', title: 'Başlanğıc' },
  { id: 'problem', title: 'Problem' },
  { id: 'solution', title: 'Həll Yolu' },
  { id: 'product', title: 'Məhsul / Demo' },
  { id: 'value-prop', title: 'Dəyər Təklifi' },
  { id: 'market-size', title: 'Bazar Həcmi' },
  { id 'business-model', title: 'Biznes Modeli' },
  { id: 'traction', title: 'İnkişaf' },
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
    className={cn(
      'min-h-screen w-full flex flex-col justify-center items-center p-8 md:p-16 text-white snap-start relative overflow-hidden',
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-blue-900/40 animate-gradient-xy -z-10" />
    <div className="container max-w-6xl animate-fade-in-up">{children}</div>
  </section>
);

const AnimatedTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-shadow-glow">
        {children}
    </h2>
);

const InfoCard = ({ icon, title, description, className }: {icon: React.ReactNode, title: string, description: string, className?: string}) => (
    <div className={cn("p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg hover-glow-border transition-all duration-300 transform hover:-translate-y-1", className)}>
        <div className="w-12 h-12 text-primary mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-gray-300">{description}</p>
    </div>
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
            <li key={section.id} className="flex items-center justify-end gap-2 group">
              <span
                className={`text-xs text-right transition-all duration-300 ${
                  activeSection === section.id
                    ? 'opacity-100 text-white font-semibold'
                    : 'opacity-0 text-gray-400 group-hover:opacity-100'
                }`}
              >
                {section.title}
              </span>
              <a
                href={`#${section.id}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-primary scale-150 shadow-lg shadow-primary/50'
                    : 'bg-gray-500 hover:bg-gray-300'
                }`}
              />
            </li>
          ))}
        </ul>
      </nav>

      <main className="snap-y snap-mandatory h-screen overflow-y-auto">
        <Slide id="cover" className="text-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-0"></div>
            <div className="relative z-10">
                <Logo className="mx-auto mb-8 invert brightness-0" />
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-shadow-glow">
                    ReseptPlus
                </h1>
                <p className="mt-6 text-xl md:text-2xl text-gray-300">
                    Səhiyyəni Rəqəmsal Zirvəyə Daşıyırıq.
                </p>
                <div className="absolute bottom-[-10vh] left-1/2 -translate-x-1/2 animate-bounce">
                    <ArrowDown className="w-8 h-8" />
                </div>
            </div>
        </Slide>

        <Slide id="problem">
          <AnimatedTitle>Problem <span className="text-primary">.</span></AnimatedTitle>
          <div className="grid md:grid-cols-3 gap-8">
            <InfoCard icon={<HeartPulse className="w-full h-full"/>} title="Kağız Resept Səhvləri" description="Əl ilə yazılan reseptlər oxunmaz ola bilər, bu da yanlış dozajlara və dərman səhvlərinə yol açaraq xəstə təhlükəsizliyini riskə atır." />
            <InfoCard icon={<Users className="w-full h-full"/>} title="Qopuq Əlaqə" description="Həkim, əczaçı və xəstə arasında effektiv məlumat axını yoxdur. Bu, vaxt itkisinə və müalicə prosesində gecikmələrə səbəb olur." />
            <InfoCard icon={<FileText className="w-full h-full"/>} title="Mərkəzləşdirilmiş Tarixçə Yoxdur" description="Xəstənin tam tibbi tarixçəsi vahid bir yerdə toplanmır, bu da həkimlərin məlumatlı qərar verməsini çətinləşdirir." />
          </div>
        </Slide>

        <Slide id="solution">
          <AnimatedTitle>Həll Yolumuz <span className="text-primary">.</span></AnimatedTitle>
          <p className="text-center text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
            ReseptPlus, səhiyyə ekosisteminin bütün iştirakçılarını —
            <span className="text-primary font-semibold">həkimləri</span>,{' '}
            <span className="text-primary font-semibold">əczaçıları</span> və{' '}
            <span className="text-primary font-semibold">xəstələri</span> —
            vahid, təhlükəsiz və səmərəli bir rəqəmsal platformada birləşdirir.
          </p>
          <div className="text-center mt-12">
             <ShieldCheck className="w-24 h-24 text-green-500 mx-auto drop-shadow-[0_0_20px_rgba(74,222,128,0.6)]" />
             <p className="mt-4 font-semibold text-lg">Təhlükəsiz, Sürətli və Vahid Sistem</p>
          </div>
        </Slide>

        <Slide id="product">
          <AnimatedTitle>Məhsul / Necə İşləyir? <span className="text-primary">.</span></AnimatedTitle>
          <div className="grid md:grid-cols-5 gap-4 text-center items-center">
            <InfoCard icon={<Users className="w-full h-full"/>} title="Həkim Paneli" description="Xəstəni axtarır, resepti rəqəmsal olaraq yazır və AI məsləhəti alır." />
            <div className="text-4xl font-bold text-primary animate-pulse text-shadow-glow">→</div>
            <InfoCard icon={<Cpu className="w-full h-full"/>} title="Aptek Paneli" description="İki faktorlu təsdiqlə resepti yoxlayır və dərmanı təhvil verir." />
             <div className="text-4xl font-bold text-primary animate-pulse text-shadow-glow">→</div>
            <InfoCard icon={<HeartPulse className="w-full h-full"/>} title="Xəstə" description="Reseptini izləyir və ən yaxın apteki tapır." />
          </div>
        </Slide>

        <Slide id="value-prop">
             <AnimatedTitle>Unikal Dəyər Təklifimiz <span className="text-primary">.</span></AnimatedTitle>
             <div className="grid md:grid-cols-3 gap-8 text-center">
                <InfoCard icon={<Bot className="w-full h-full"/>} title="AI-Dəstəkli Qərar" description="Həkimlər üçün diaqnoz və dərman qarşılıqlı təsirləri barədə AI məsləhətləri." />
                <InfoCard icon={<ShieldCheck className="w-full h-full"/>} title="İki Faktorlu Təhlükəsizlik" description="Həm FİN kod, həm də xəstənin telefonuna göndərilən birdəfəlik kod ilə resept yoxlaması." />
                <InfoCard icon={<Map className="w-full h-full"/>} title="Ağıllı Aptek Axtarışı" description="Reseptdəki bütün dərmanların olduğu ən yaxın apteki xəritədə göstərən sistem." />
            </div>
        </Slide>

        <Slide id="market-size">
             <AnimatedTitle>Bazar Həcmi (Azərbaycan) <span className="text-primary">.</span></AnimatedTitle>
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10 hover-glow-border">
                    <h3 className="text-2xl font-bold text-primary text-shadow-glow">TAM</h3>
                    <p className="text-4xl font-bold mt-2">150M+ ₼</p>
                    <p className="mt-2 text-gray-300">Ümumi Səhiyyə Xidmətləri Bazarı</p>
                </div>
                 <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10 hover-glow-border">
                    <h3 className="text-2xl font-bold text-primary text-shadow-glow">SAM</h3>
                    <p className="text-4xl font-bold mt-2">50M+ ₼</p>
                    <p className="mt-2 text-gray-300">Elektron Səhiyyə və Resept Bazarı</p>
                </div>
                 <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10 hover-glow-border">
                    <h3 className="text-2xl font-bold text-primary text-shadow-glow">SOM</h3>
                    <p className="text-4xl font-bold mt-2">5M+ ₼</p>
                    <p className="mt-2 text-gray-300">İlk 3 İldə Hədəflənən Bazar Payı</p>
                </div>
            </div>
        </Slide>
        
        <Slide id="business-model">
             <AnimatedTitle>Biznes Modeli <span className="text-primary">.</span></AnimatedTitle>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-gray-800/60 rounded-xl border border-white/10 hover-glow-border">
                    <h3 className="text-2xl font-semibold flex items-center gap-3"><Users className="text-primary"/> Xəstəxanalar (B2B SaaS)</h3>
                    <p className="mt-4 text-xl">Aylıq abunəlik haqqı (hər həkim üçün)</p>
                    <p className="text-3xl font-bold mt-2">20 ₼ <span className="text-lg font-normal text-gray-400">/həkim/ay</span></p>
                </div>
                 <div className="p-8 bg-gray-800/60 rounded-xl border border-white/10 hover-glow-border">
                    <h3 className="text-2xl font-semibold flex items-center gap-3"><CircleDollarSign className="text-primary"/> Apteklər (Tranzaksiya)</h3>
                    <p className="mt-4 text-xl">Hər təhvil verilən reseptdən komissiya</p>
                    <p className="text-3xl font-bold mt-2">3% <span className="text-lg font-normal text-gray-400">/resept</span></p>
                </div>
            </div>
        </Slide>

        <Slide id="traction">
             <AnimatedTitle>İnkişaf Mərhələsi <span className="text-primary">.</span></AnimatedTitle>
            <div className="max-w-3xl mx-auto p-8 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
                <ul className="space-y-6 text-lg">
                    <li className="flex items-center gap-4"><CheckCircleIcon className="text-green-500 shrink-0"/> <strong>MVP Hazırdır:</strong> Tam funksional prototip (Həkim, Əczaçı, Xəstə panelləri).</li>
                    <li className="flex items-center gap-4"><CheckCircleIcon className="text-green-500 shrink-0"/> <strong>Pilot Razılaşma:</strong> Naxçıvan Dövlət Universiteti ilə pilot layihə üçün ilkin razılıq.</li>
                     <li className="flex items-center gap-4"><CheckCircleIcon className="text-green-500 shrink-0"/> <strong>Texnoloji Stack:</strong> Müasir və genişlənə bilən arxitektura (Next.js, Firebase, Google AI).</li>
                </ul>
            </div>
        </Slide>

        <Slide id="competition">
             <AnimatedTitle>Rəqabət <span className="text-primary">.</span></AnimatedTitle>
            <div className="overflow-x-auto bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10 p-2">
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
                        <tr className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"><td className="p-4">AI Dəstəyi</td><td className="p-4 text-green-400 font-bold">Var</td><td className="p-4 text-red-400">Yoxdur</td><td className="p-4 text-red-400">Yoxdur</td></tr>
                        <tr className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"><td className="p-4">Vahid Ekosistem</td><td className="p-4 text-green-400 font-bold">Var</td><td className="p-4 text-red-400">Yoxdur</td><td className="p-4 text-yellow-400">Məhdud</td></tr>
                        <tr className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"><td className="p-4">Aptek Axtarışı</td><td className="p-4 text-green-400 font-bold">Var</td><td className="p-4 text-red-400">Yoxdur</td><td className="p-4 text-red-400">Yoxdur</td></tr>
                        <tr className="hover:bg-gray-700/30 transition-colors"><td className="p-4">İki Faktorlu Təsdiq</td><td className="p-4 text-green-400 font-bold">Var</td><td className="p-4 text-red-400">Yoxdur</td><td className="p-4 text-red-400">Yoxdur</td></tr>
                    </tbody>
                </table>
            </div>
        </Slide>

        <Slide id="technology">
            <AnimatedTitle>Texnologiya və Təhlükəsizlik <span className="text-primary">.</span></AnimatedTitle>
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
                    <h3 className="text-2xl font-semibold mb-4">Arxitektura</h3>
                    <ul className="space-y-2 list-disc pl-5">
                        <li><strong>Frontend:</strong> Next.js & React</li>
                        <li><strong>Backend & DB:</strong> Firebase (Firestore, Auth)</li>
                        <li><strong>AI/ML:</strong> Google Genkit (Gemini)</li>
                        <li><strong>Hosting:</strong> Firebase App Hosting</li>
                    </ul>
                </div>
                 <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
                    <h3 className="text-2xl font-semibold mb-4">Təhlükəsizlik</h3>
                    <ul className="space-y-2 list-disc pl-5">
                         <li>Rol-əsaslı giriş nəzarəti (RBAC)</li>
                        <li>Bütün məlumatların şifrələnməsi (at-rest & in-transit)</li>
                        <li>İki faktorlu resept yoxlama (FIN + OTP)</li>
                    </ul>
                </div>
            </div>
        </Slide>

        <Slide id="team">
             <AnimatedTitle>Komanda <span className="text-primary">.</span></AnimatedTitle>
            <p className="text-center text-xl text-gray-400">Bu bölməyə komanda üzvləri haqqında məlumat yerləşdiriləcək.</p>
        </Slide>
        
        <Slide id="roadmap">
             <AnimatedTitle>Yol Xəritəsi <span className="text-primary">.</span></AnimatedTitle>
            <div className="grid md:grid-cols-3 gap-8">
                <InfoCard icon={<Goal className="w-full h-full"/>} title="İlk 6 Ay" description="Pilot layihənin NDU-da başlaması, Mobil tətbiq (Pasiyent üçün) MVP, İlk 5 apteklə partnyorluq" />
                <InfoCard icon={<BarChart3 className="w-full h-full"/>} title="12 Ay" description="Genişləndirilmiş analitika paneli, Sığorta şirkətləri ilə inteqrasiya, Bakı bazarına giriş" />
                <InfoCard icon={<Target className="w-full h-full"/>} title="Uzunmüddətli" description="Telemedisina funksiyaları, Dərmanların evə çatdırılması inteqrasiyası, Beynəlxalq bazarlara çıxış" />
            </div>
        </Slide>

        <Slide id="ask" className="text-center">
             <AnimatedTitle>Tələbimiz <span className="text-primary">.</span></AnimatedTitle>
            <p className="text-6xl font-bold text-primary text-shadow-glow">50,000 ₼</p>
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
