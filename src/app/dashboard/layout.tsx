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

const menuItems = [
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
    href: "/dashboard/suggestions",
    label: "AI Təklifləri",
    icon: BrainCircuit,
  },
];

const users = [
  {
    name: "Dr. Arzu Qasımova",
    role: "Baş həkim",
    avatar: "https://picsum.photos/seed/head-doctor-avatar/100/100",
    initials: "AQ"
  },
  {
    name: "Dr. Aydın Əliyev",
    role: "Həkim",
    avatar: "https://picsum.photos/seed/doctor-avatar/100/100",
    initials: "AƏ"
  },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = React.useState(users[1]);

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { user: currentUser });
    }
    return child;
  });

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
                    item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href)
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
              <SidebarMenuButton asChild tooltip={{children: "Çıxış", className: "bg-primary text-primary-foreground"}}>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>{currentUser.initials}</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <div className="font-medium text-sm">{currentUser.name}</div>
                    <div className="text-xs text-muted-foreground">{currentUser.role}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Hesabı dəyiş</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {users.map((user) => (
                    <DropdownMenuItem key={user.name} onSelect={() => setCurrentUser(user)}>
                        <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.initials}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.role}</div>
                        </div>
                    </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6">{childrenWithProps}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
