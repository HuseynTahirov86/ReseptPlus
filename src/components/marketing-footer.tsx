import Link from "next/link";
import { Logo } from "./logo";

export default function MarketingFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur-lg">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
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
              <li><Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">Necə İşləyir</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Şirkət</h4>
            <ul className="space-y-2">
              <li><Link href="/haqqimizda" className="text-sm text-muted-foreground hover:text-foreground">Haqqımızda</Link></li>
              <li><Link href="/partnyorlar" className="text-sm text-muted-foreground hover:text-foreground">Partnyorlar</Link></li>
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link href="/elaqe" className="text-sm text-muted-foreground hover:text-foreground">Əlaqə</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Hüquqi</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Məxfilik Siyasəti</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Xidmət Şərtləri</Link></li>
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
