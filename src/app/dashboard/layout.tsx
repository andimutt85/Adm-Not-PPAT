
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Scale } from "lucide-react"; 
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"; 
import { DashboardHeader } from "@/components/dashboard-header";
import { NAV_ITEMS } from "@/constants/navigation";
import type { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { ClientDataProvider } from "@/context/ClientDataContext";


function DashboardSidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [userRole, setUserRole] = React.useState<Role | null>(null);

  React.useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as Role | null;
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []); 
  
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/");
  };

  const filteredNavItems = NAV_ITEMS.filter(item => userRole && item.allowedRoles.includes(userRole));

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 group" onClick={() => setOpenMobile(false)}>
          <Scale className="h-7 w-7 text-red-500 group-hover:text-red-500/90 transition-colors" />
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-sidebar-primary group-hover:text-sidebar-primary/90 transition-colors">Kantor Notaris-PPAT</span>
            <span className="font-bold text-[13px] leading-tight text-sidebar-primary group-hover:text-sidebar-primary/90 transition-colors">ANDI MUTTAQIN, S.H., M.Kn.</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  onClick={() => setOpenMobile(false)}
                  className="text-sm"
                  tooltip={item.label}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
      </SidebarFooter>
    </>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = React.useState(false); 

  React.useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole) {
      router.replace("/"); 
    } else {
      setIsAuthChecked(true); 
    }
  }, [router]);

  if (!isAuthChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-base">Memuat...</p>
      </div>
    );
  }

  return (
    <ClientDataProvider>
      <SidebarProvider defaultOpen={true} collapsible="icon">
        <Sidebar>
          <DashboardSidebarContent />
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ClientDataProvider>
  );
}
