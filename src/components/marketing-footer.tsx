import Link from "next/link";
import { Logo } from "./logo";

export default function MarketingFooter() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Səhiyyəni daha ağıllı, sürətli və hamı üçün əlçatan edirik.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Məhsul</h4>
            <ul className="space-y-2">
              <li><Link href="/mehsulumuz" className="text-sm text-muted-foreground hover:text-foreground">Xüsusiyyətlər</Link></li>
              <li><Link href="/qiymetler" className="text-sm text-muted-foreground hover:text-foreground">Qiymətlər</Link></li>
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Yeniliklər</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Şirkət</h4>
            <ul className="space-y-2">
              <li><Link href="/haqqimizda" className="text-sm text-muted-foreground hover:text-foreground">Haqqımızda</Link></li>
              <li><Link href="/partnyorlar" className="text-sm text-muted-foreground hover:text-foreground">Partnyorlar</Link></li>
               <li><Link href="/pitch-deck" className="text-sm text-muted-foreground hover:text-foreground">Pitch Deck</Link></li>
              <li><Link href="/elaqe" className="text-sm text-muted-foreground hover:text-foreground">Əlaqə</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Hüquqi</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">Məxfilik Siyasəti</Link></li>
              <li><Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground">Xidmət Şərtləri</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ReseptPlus. Bütün hüquqlar qorunur.
        </div>
      </div>
    </footer>
  );
}
