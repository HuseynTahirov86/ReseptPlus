"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  BrainCircuit,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  User,
  Users,
  ChevronDown,
  Hospital,
  Building,
  ShieldCheck,
  MapPin,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { Badge } from "@/components/ui/badge";

const doctorMenuItems = [
  {
    href: "/dashboard",
    label: "İdarə Paneli",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/patients",
    label: "Xəstələr",
    icon: Users,
  },
  {
    href: "/dashboard/prescriptions",
    label: "Reseptlər",
    icon: ClipboardList,
  },
   {
    href: "/dashboard/hospital",
    label: "Xəstəxana İdarəçiliyi",
    icon: Hospital,
    role: "head_doctor",
  },
  {
    href: "/dashboard/suggestions",
    label: "AI Təklifləri",
    icon: BrainCircuit,
  },
];

const pharmacistMenuItems = [
    {
        href: "/dashboard",
        label: "İdarə Paneli",
        icon: LayoutDashboard,
    },
    {
        href: "/dashboard/pharmacy/verify",
        label: "Resept Yoxla",
        icon: ShieldCheck,
    },
    {
        href: "/dashboard/pharmacy/inventory",
        label: "Aptek İdarəçiliyi",
        icon: Building,
        role: "head_pharmacist",
    }
];

const patientMenuItems = [
    { href: "/dashboard", label: "İdarə Paneli", icon: LayoutDashboard },
    { href: "/dashboard/prescriptions", label: "Reseptlərim", icon: ClipboardList },
    { href: "/dashboard/find-pharmacy", label: "Aptek Tap", icon: MapPin }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  const handleSignOut = () => {
    if(auth) {
        signOut(auth);
    }
  };
  
  const userInitials = user?.email?.charAt(0).toUpperCase() || 'S';
  const userRole = user?.profile?.role;

  let roleDisplay = "İstifadəçi";
  let menuItems = [];

  if (userRole === 'doctor' || userRole === 'head_doctor') {
    menuItems = doctorMenuItems.filter(item => !item.role || item.role === userRole);
    roleDisplay = userRole === 'head_doctor' ? 'Baş Həkim' : 'Həkim';
  } else if (userRole === 'employee' || userRole === 'head_pharmacist') {
    menuItems = pharmacistMenuItems.filter(item => !item.role || item.role === userRole);
    roleDisplay = userRole === 'head_pharmacist' ? 'Baş Əczaçı' : 'Əczaçı';
  } else if (userRole === 'patient') {
    menuItems = patientMenuItems;
    roleDisplay = 'Xəstə';
  }
  

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')
                  }
                  tooltip={{
                    children: item.label,
                    className: "bg-primary text-primary-foreground"
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{children: "Profil", className: "bg-primary text-primary-foreground"}}>
                <User />
                <span>Profil</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{children: "Çıxış", className: "bg-primary text-primary-foreground"}} onClick={handleSignOut}>
                <Link href="/">
                    <LogOut />
                    <span>Çıxış</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex flex-1 items-center justify-end">
            {isUserLoading ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <div className="font-medium text-sm">{user.displayName || user.email}</div>
                      {userRole && <Badge variant="secondary">{roleDisplay}</Badge>}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Çıxış</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">Daxil Ol</Link>
              </Button>
            )}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    