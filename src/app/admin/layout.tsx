'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { Loader2, Home, Handshake, FileText, DollarSign, Package, Upload, Library, Users, ChevronLeft, LogOut } from 'lucide-react';
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { href: "/admin/dashboard", label: "İdarə Paneli", icon: Home },
  { href: "/admin/partners", label: "Partnyorlar", icon: Handshake },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/pricing", label: "Qiymətlər", icon: DollarSign },
  { href: "/admin/product", label: "Məhsul", icon: Package },
  { href: "/admin/team", label: "Komanda", icon: Users },
  { href: "/admin/upload", label: "Fayl Yüklə", icon: Upload },
  { href: "/admin/media", label: "Media Kitabxanası", icon: Library },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && (!user || user.profile?.role !== 'admin')) {
      router.push('/login'); 
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = () => {
    if(auth) {
      auth.signOut();
    }
  };

  if (isUserLoading || !user || user.profile?.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              variant={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin/dashboard') ? "secondary" : "ghost"}
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
            <Button asChild variant="destructive" className="w-full justify-start" onClick={handleSignOut}>
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
