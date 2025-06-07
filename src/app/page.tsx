
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Scale, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role, Staff, OfficeInfo } from "@/types"; // Import Staff and OfficeInfo

// Default initial office info, to be used if nothing in localStorage
const defaultOfficeInfo: OfficeInfo = {
  notarisName: "ANDI MUTTAQIN, S.H, M.Kn.",
  notarisEmail: "andi.muttaqin@notaris.com",
  notarisUsername: "andimutt",
  notarisPassword: "Not123",
  phone: "0812-3456-7890",
  email: "info@notarisandi.com",
  address: "Jl. Notaris No. 123, Kota Notaris, Indonesia",
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<Role | "">("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    if (!role || !username || !password) {
      setError("Semua field wajib diisi.");
      setIsLoading(false);
      return;
    }

    let isAuthenticated = false;

    if (role === "Notaris/PPAT") {
      const storedOfficeInfoString = localStorage.getItem("notarisAppOfficeInfo");
      const officeInfo: OfficeInfo = storedOfficeInfoString 
        ? JSON.parse(storedOfficeInfoString) 
        : defaultOfficeInfo;
      
      const appNotarisUsername = officeInfo.notarisUsername || defaultOfficeInfo.notarisUsername;
      const appNotarisPassword = officeInfo.notarisPassword || defaultOfficeInfo.notarisPassword;

      if (username === appNotarisUsername && password === appNotarisPassword) {
        isAuthenticated = true;
      }
    } else if (role === "Staf") {
      const storedStaffListString = localStorage.getItem("notarisAppStaffList");
      const staffList: Staff[] = storedStaffListString ? JSON.parse(storedStaffListString) : [];
      const staffMember = staffList.find(staff => staff.username === username);
      if (staffMember && staffMember.password === password) {
        isAuthenticated = true;
      }
    }

    if (isAuthenticated) {
      localStorage.setItem("userRole", role);
      router.push("/dashboard");
    } else {
      setError("Nama pengguna atau kata sandi salah, atau peran tidak valid.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Scale className="h-12 w-12" />
          </div>
          <CardDescription className="text-lg font-semibold text-foreground">Kantor Notaris-PPAT</CardDescription>
          <CardTitle className="text-2xl font-bold">ANDI MUTTAQIN, S.H., M.Kn.</CardTitle>
          <CardDescription className="pt-2 text-sm">Silakan masuk untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs text-center block mb-2">Peran</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={role === "Notaris/PPAT" ? "default" : "outline"}
                  onClick={() => setRole("Notaris/PPAT")}
                  className="w-full text-sm py-3 h-auto"
                >
                  Notaris/PPAT
                </Button>
                <Button
                  type="button"
                  variant={role === "Staf" ? "default" : "outline"}
                  onClick={() => setRole("Staf")}
                  className="w-full text-sm py-3 h-auto"
                >
                  Staf
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs">Nama Pengguna</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan nama pengguna"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full text-sm" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Masuk"}
              {!isLoading && <LogIn className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Andi Muttaqin
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
