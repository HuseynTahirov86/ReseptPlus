'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Handshake,
  LogOut,
  ChevronLeft,
  FileText,
  DollarSign,
  Package
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { href: "/admin/dashboard", label: "İdarə Paneli", icon: Home },
  { href: "/admin/partners", label: "Partnyorlar", icon: Handshake },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/pricing", label: "Qiymətlər", icon: DollarSign },
  { href: "/admin/product", label: "Məhsul", icon: Package },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-col border-r bg-background hidden md:flex">
        <div className="flex h-16 items-center border-b px-6">
           <Logo />
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {adminNavItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
         <div className="mt-auto flex flex-col gap-2 p-4">
            <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Həkim Panelinə qayıt
                </Link>
            </Button>
            <Button asChild variant="destructive" className="w-full justify-start">
                 <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıxış
                 </Link>
            </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b bg-background px-6">
            <h1 className="text-xl font-semibold">Admin Paneli</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
