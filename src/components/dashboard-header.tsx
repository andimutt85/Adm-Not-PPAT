
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Building, LogOut, Moon, Sun, UserCircle, PanelLeft, Scale } from "lucide-react"; // Added Scale
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import type { Role } from "@/types";

export function DashboardHeader() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toggleSidebar, isMobile } = useSidebar(); 
  const [userRole, setUserRole] = React.useState<Role | null>(null);
  const [userName, setUserName] = React.useState<string>("Pengguna");


  React.useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as Role | null;
    if (storedRole) {
      setUserRole(storedRole);
      setUserName(storedRole === "Notaris/PPAT" ? "Notaris/PPAT" : "Staf");
    } else {
      router.push("/"); 
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        )}
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base group">
          <Scale className="h-6 w-6 text-primary group-hover:text-primary/90 transition-colors" /> {/* Changed Icon */}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs text-foreground group-hover:text-foreground/80 transition-colors">Kantor Notaris-PPAT</span>
            <span className="font-semibold text-sm text-foreground group-hover:text-foreground/80 transition-colors">ANDI MUTTAQIN, S.H., M.Kn.</span>
          </div>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-8 w-8"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-sm">{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="text-sm cursor-pointer">
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-sm cursor-pointer">
              Keluar
              <LogOut className="ml-auto h-3.5 w-3.5" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
