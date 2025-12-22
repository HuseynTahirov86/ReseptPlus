'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { Loader2, Home, Handshake, FileText, DollarSign, Package, Upload, Library, Users, LogOut, Hospital, Microscope, Pill, ShieldCheck, Building } from 'lucide-react';
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const siteAdminNavItems = [
  { href: "/admin/dashboard", label: "İdarə Paneli", icon: Home },
  { href: "/admin/partners", label: "Partnyorlar", icon: Handshake },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/pricing", label: "Qiymətlər", icon: DollarSign },
  { href: "/admin/product", label: "Məhsul", icon: Package },
  { href: "/admin/team", label: "Komanda", icon: Users },
  { href: "/admin/media", label: "Media Kitabxanası", icon: Library },
  { href: "/admin/upload", label: "Fayl Yüklə", icon: Upload },
];

const systemAdminNavItems = [
  { href: "/admin/dashboard", label: "İdarə Paneli", icon: Home },
  { href: "/admin/hospitals", label: "Xəstəxanalar", icon: Hospital },
  { href: "/admin/doctors", label: "Həkimlər", icon: Microscope },
  { href: "/admin/pharmacies", label: "Apteklər", icon: Building },
  { href: "/admin/pharmacists", label: "Əczaçılar", icon: Pill },
  { href: "/admin/users", label: "İstifadəçilər", icon: Users },
  { href: "/admin/security", label: "Təhlükəsizlik", icon: ShieldCheck },
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

  const userRole = user?.profile?.role;
  const navItems = userRole === 'system_admin' ? systemAdminNavItems : siteAdminNavItems;

  useEffect(() => {
    if (!isUserLoading) {
        if (userRole !== 'admin' && userRole !== 'system_admin') {
            router.push('/login'); 
        }
    }
  }, [user, isUserLoading, router, userRole]);

  const handleSignOut = () => {
    if(auth) {
      auth.signOut();
    }
  };

  if (isUserLoading || (userRole !== 'admin' && userRole !== 'system_admin')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getRoleDisplayName = () => {
    if (userRole === 'system_admin') return 'Sistem Admini';
    if (userRole === 'admin') return 'Sayt Admini';
    return 'Admin';
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-col border-r bg-background hidden md:flex">
        <div className="flex h-16 items-center border-b px-6">
           <Logo />
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
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
         <div className="mt-auto flex flex-col gap-2 p-4 border-t">
            <div className='text-center text-sm mb-2'>
                <p className='font-semibold'>{user?.email}</p>
                <p className='text-muted-foreground'>{getRoleDisplayName()}</p>
            </div>
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
            <h1 className="text-xl font-semibold">{getRoleDisplayName()} Paneli</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
