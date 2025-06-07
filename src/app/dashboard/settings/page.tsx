
"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, User, Users, Building2, DatabaseZap, Palette, Trash2, Save, LogOut, Upload, Download, Image as ImageIcon, Bell } from "lucide-react";
import type { Role, Staff, OfficeInfo, NotificationPrefs } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { Switch } from "@/components/ui/switch";
import { useClientData } from "@/context/ClientDataContext";

const initialOfficeInfoState: OfficeInfo = {
  notarisName: "ANDI MUTTAQIN, S.H, M.Kn.",
  notarisEmail: "andi.muttaqin@notaris.com",
  notarisUsername: "andimutt", 
  notarisPassword: "Not123", 
  notarisPersonalPhone: "0811-1234-5678", // Example personal phone
  phone: "0812-3456-7890", // Office phone
  email: "info@notarisandi.com",
  address: "Jl. Notaris No. 123, Kota Notaris, Indonesia",
};

const initialNotificationPrefsState: NotificationPrefs = {
  notifAktivitasAkun: true,
  notifPembaruanProses: true,
  notifCatatanBaru: true,
};

const OFFICE_INFO_KEY = 'notarisAppOfficeInfo';
const STAFF_LIST_KEY = 'notarisAppStaffList';
const NOTIFICATION_PREFS_KEY = 'notarisAppNotificationPrefs';

const getStoredData = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const storedString = localStorage.getItem(key);
  if (storedString) {
    try {
      return JSON.parse(storedString);
    } catch (e) {
      console.error(`Failed to parse ${key} from localStorage`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};

const getNotificationPrefs = (): NotificationPrefs => {
  if (typeof window === 'undefined') return initialNotificationPrefsState;
  const storedPrefsString = localStorage.getItem(NOTIFICATION_PREFS_KEY);
  if (storedPrefsString) {
    try {
      return JSON.parse(storedPrefsString);
    } catch (e) {
      return initialNotificationPrefsState;
    }
  }
  return initialNotificationPrefsState;
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const { setClients: setGlobalClients } = useClientData(); 
  const [userRole, setUserRole] = React.useState<Role | null>(null);
  
  const [officeInfo, setOfficeInfo] = React.useState<OfficeInfo>(() => getStoredData(OFFICE_INFO_KEY, initialOfficeInfoState));
  const [staffList, setStaffList] = React.useState<Staff[]>(() => getStoredData(STAFF_LIST_KEY, []));
  const [notificationPrefs, setNotificationPrefs] = React.useState<NotificationPrefs>(() => getStoredData(NOTIFICATION_PREFS_KEY, initialNotificationPrefsState));
  
  const { notifAktivitasAkun, notifPembaruanProses, notifCatatanBaru } = notificationPrefs;

  const handleNotificationChange = (key: keyof NotificationPrefs, value: boolean) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: value }));
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OFFICE_INFO_KEY, JSON.stringify(officeInfo));
    }
  }, [officeInfo]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STAFF_LIST_KEY, JSON.stringify(staffList));
    }
  }, [staffList]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notificationPrefs));
    }
  }, [notificationPrefs]);
  
  const [newStaffName, setNewStaffName] = React.useState("");
  const [newStaffUsername, setNewStaffUsername] = React.useState("");
  const [newStaffPassword, setNewStaffPassword] = React.useState("");
  const [confirmNewStaffPassword, setConfirmNewStaffPassword] = React.useState("");

  const [notarisProfileEmail, setNotarisProfileEmail] = React.useState(officeInfo.notarisEmail);
  const [notarisProfilePersonalPhone, setNotarisProfilePersonalPhone] = React.useState(officeInfo.notarisPersonalPhone || "");
  const [notarisProfileUsername, setNotarisProfileUsername] = React.useState(officeInfo.notarisUsername);
  
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");

  const [fontSize, setFontSize] = React.useState("sedang");

  React.useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as Role | null;
    setUserRole(storedRole);
    if (!storedRole) {
       router.push("/"); 
    }
    
    const currentOfficeInfo = getStoredData(OFFICE_INFO_KEY, initialOfficeInfoState);
    setOfficeInfo(currentOfficeInfo); // This also sets officeInfo.notarisPersonalPhone
    setNotarisProfileEmail(currentOfficeInfo.notarisEmail);
    setNotarisProfilePersonalPhone(currentOfficeInfo.notarisPersonalPhone || ""); // Initialize profile personal phone
    setNotarisProfileUsername(currentOfficeInfo.notarisUsername);

  }, [router]);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newStaffName.trim() || !newStaffUsername.trim() || !newStaffPassword.trim()) {
        toast({ title: "Gagal", description: "Nama, username, dan password staf baru wajib diisi.", variant: "destructive" });
        return;
    }
    if (staffList.find(staff => staff.username === newStaffUsername.trim())) {
        toast({ title: "Gagal", description: "Username staf sudah digunakan.", variant: "destructive" });
        return;
    }
    if (newStaffPassword !== confirmNewStaffPassword) {
      toast({ title: "Gagal", description: "Password baru dan konfirmasi password staf tidak cocok.", variant: "destructive" });
      return;
    }

    const newStaffMember: Staff = { 
        id: `staff-${Date.now().toString()}`, 
        name: newStaffName.trim(), 
        username: newStaffUsername.trim(),
        password: newStaffPassword, 
    };
    setStaffList(prevStaffList => [...prevStaffList, newStaffMember]);
    setNewStaffName("");
    setNewStaffUsername("");
    setNewStaffPassword("");
    setConfirmNewStaffPassword("");
    
    const prefs = getNotificationPrefs();
    if (prefs.notifAktivitasAkun) {
        toast({ title: "Aktivitas Akun", description: `Staf baru ${newStaffMember.name} ditambahkan.` });
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    const staffToDelete = staffList.find(s => s.id === staffId);
    setStaffList(prevStaffList => prevStaffList.filter(staff => staff.id !== staffId));
    
    const prefs = getNotificationPrefs();
    if (prefs.notifAktivitasAkun) {
        toast({ title: "Aktivitas Akun", description: `Staf ${staffToDelete?.name || ''} dihapus.` });
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/");
    toast({title: "Keluar", description: "Anda telah berhasil keluar."})
  };

  const handleBackup = () => {
    const currentClients = getStoredData('notarisAppClients', []); 
    const backupData = {
      clients: currentClients, 
      staff: staffList, 
      officeInfo: officeInfo, 
      notificationPrefs: notificationPrefs,
      timestamp: new Date().toISOString(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2) 
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `backup_kantor_notaris_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.json`;
    link.click();
    toast({ title: "Backup Dimulai", description: "Data aplikasi Anda sedang diunduh." });
  };

  const handleOfficeInfoChange = (field: keyof OfficeInfo, value: string) => {
    // This function is for changes in the "Info Kantor" tab
    setOfficeInfo(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNotarisProfileInfoChange = (field: 'notarisEmail' | 'notarisPersonalPhone' | 'notarisUsername', value: string) => {
    if (field === 'notarisEmail') setNotarisProfileEmail(value);
    else if (field === 'notarisPersonalPhone') setNotarisProfilePersonalPhone(value);
    else if (field === 'notarisUsername') setNotarisProfileUsername(value);
  };

  const handleSaveOfficeInfo = () => {
    // officeInfo is already updated by handleOfficeInfoChange via setOfficeInfo
    localStorage.setItem(OFFICE_INFO_KEY, JSON.stringify(officeInfo)); // Explicitly save here
    toast({title: "Sukses", description: "Informasi kantor berhasil diperbarui."});
    const prefs = getNotificationPrefs();
    if (prefs.notifAktivitasAkun) {
        toast({ title: "Aktivitas Akun", description: "Informasi kantor diperbarui." });
    }
  };

  const handleSaveNotarisProfileAndNotifications = () => {
    let passwordChanged = false;
    let profileInfoChanged = false;

    let updatedOfficeInfo = { ...officeInfo }; 

    if (updatedOfficeInfo.notarisEmail !== notarisProfileEmail ||
        updatedOfficeInfo.notarisUsername !== notarisProfileUsername ||
        updatedOfficeInfo.notarisPersonalPhone !== notarisProfilePersonalPhone) {
        profileInfoChanged = true;
    }

    updatedOfficeInfo.notarisEmail = notarisProfileEmail;
    updatedOfficeInfo.notarisUsername = notarisProfileUsername;
    updatedOfficeInfo.notarisPersonalPhone = notarisProfilePersonalPhone;

    if (newPassword) { 
      if (newPassword !== confirmNewPassword) {
        toast({ title: "Gagal", description: "Password baru dan konfirmasi password Notaris/PPAT tidak cocok.", variant: "destructive" });
        return;
      }
      updatedOfficeInfo.notarisPassword = newPassword;
      passwordChanged = true;
    }
    
    setOfficeInfo(updatedOfficeInfo); 
    localStorage.setItem(OFFICE_INFO_KEY, JSON.stringify(updatedOfficeInfo)); // Save updated officeInfo
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notificationPrefs)); // Save notification prefs

    let successMessages: string[] = [];
    if (profileInfoChanged) successMessages.push("Profil Notaris/PPAT");
    if (passwordChanged) successMessages.push("Kata Sandi Notaris/PPAT");
    successMessages.push("Preferensi Notifikasi"); 
    
    let finalMessage = `${successMessages.join(", ")} berhasil diperbarui.`;
    
    toast({ title: "Sukses", description: finalMessage});

    const currentPrefs = getNotificationPrefs(); 
    if (currentPrefs.notifAktivitasAkun) {
        if (profileInfoChanged || passwordChanged) {
            const activityParts = [];
            if (profileInfoChanged) activityParts.push("Profil");
            if (passwordChanged) activityParts.push("Kata Sandi");
            toast({ title: "Aktivitas Akun", description: `${activityParts.join(" dan ")} Notaris/PPAT diperbarui.` });
        }
    }

    setNewPassword("");
    setConfirmNewPassword("");
  };
  
  const handleSaveDisplaySettings = () => {
    toast({ title: "Sukses", description: "Pengaturan tampilan berhasil disimpan (simulasi)." });
  };

  const handleImportData = (event: React.MouseEvent<HTMLButtonElement>) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          try {
            const importedData = JSON.parse(loadEvent.target?.result as string);
            let dataImported = false;
            if (importedData.clients && Array.isArray(importedData.clients) && typeof setGlobalClients === 'function') {
              setGlobalClients(importedData.clients); 
              localStorage.setItem('notarisAppClients', JSON.stringify(importedData.clients)); 
              dataImported = true;
            }
            if (importedData.officeInfo) {
              setOfficeInfo(importedData.officeInfo); 
              setNotarisProfileEmail(importedData.officeInfo.notarisEmail);
              setNotarisProfilePersonalPhone(importedData.officeInfo.notarisPersonalPhone || "");
              setNotarisProfileUsername(importedData.officeInfo.notarisUsername);
              dataImported = true;
            }
            if (importedData.staff && Array.isArray(importedData.staff)) {
              setStaffList(importedData.staff); 
              dataImported = true;
            }
            if (importedData.notificationPrefs) {
              setNotificationPrefs(importedData.notificationPrefs); 
              dataImported = true;
            }

            const prefs = getNotificationPrefs();
            if (dataImported) {
                if (prefs.notifAktivitasAkun) {
                    toast({ title: "Aktivitas Akun", description: "Data aplikasi diimpor dari backup." });
                } else {
                     toast({ title: "Sukses", description: "Data berhasil diimpor. Harap segarkan halaman jika perubahan data klien tidak langsung terlihat di semua bagian." });
                }
            } else {
                toast({ title: "Info", description: "Tidak ada data yang relevan ditemukan dalam file backup atau format tidak valid.", variant: "default" });
            }
          } catch (error) {
            toast({ title: "Gagal", description: "Gagal membaca atau memproses file backup.", variant: "destructive" });
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  };
  
  const handleHapusSemuaDataKlien = () => {
    if (typeof setGlobalClients === 'function') {
        setGlobalClients([]); 
    }
    localStorage.removeItem('notarisAppClients'); 
    const prefs = getNotificationPrefs();
    if (prefs.notifAktivitasAkun) {
        toast({ title: "Aktivitas Akun", description: "Semua data klien dihapus." });
    } else {
        toast({ title: "Sukses", description: "Semua data klien telah dihapus." });
    }
  };


  if (!userRole) {
    return <div className="flex h-full items-center justify-center"><p className="text-base">Memuat pengaturan...</p></div>;
  }

  const isNotaris = userRole === "Notaris/PPAT";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center">
            <Settings className="mr-3 h-6 w-6" /> Pengaturan Sistem
        </h1>
        <p className="text-sm text-muted-foreground">Kelola preferensi dan konfigurasi aplikasi Anda.</p>
      </div>

      <Tabs defaultValue="profilAkun" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
          <TabsTrigger value="profilAkun" className="text-xs sm:text-sm"><User className="mr-1 h-4 w-4"/>Profil Akun</TabsTrigger>
          {isNotaris && <TabsTrigger value="akunStaf" className="text-xs sm:text-sm"><Users className="mr-1 h-4 w-4"/>Akun Staf</TabsTrigger>}
          {isNotaris && <TabsTrigger value="infoKantor" className="text-xs sm:text-sm"><Building2 className="mr-1 h-4 w-4"/>Info Kantor</TabsTrigger>}
          {isNotaris && <TabsTrigger value="backupPulihkan" className="text-xs sm:text-sm"><DatabaseZap className="mr-1 h-4 w-4"/>Backup &amp; Pulihkan</TabsTrigger>}
          <TabsTrigger value="tampilan" className="text-xs sm:text-sm"><Palette className="mr-1 h-4 w-4"/>Tampilan</TabsTrigger>
        </TabsList>

        <TabsContent value="profilAkun">
          {isNotaris ? (
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Profil Notaris/PPAT</CardTitle>
                <CardDescription>Perbarui informasi profil utama dan preferensi akun Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                    <Image src="https://placehold.co/80x80.png" alt="Foto Profil" width={80} height={80} className="rounded-md" data-ai-hint="placeholder avatar"/>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast({title: "Info", description:"Fitur ubah foto profil belum tersedia."})}><ImageIcon className="mr-2 h-4 w-4" /> Ubah Foto Profil</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="notarisName">Nama Lengkap Notaris/PPAT</Label>
                    <Input id="notarisName" value={officeInfo.notarisName} disabled className="mt-1 bg-muted/50" />
                  </div>
                  <div>
                    <Label htmlFor="notarisProfileEmail">Alamat Email Notaris/PPAT</Label>
                    <Input id="notarisProfileEmail" type="email" value={notarisProfileEmail} onChange={e => handleNotarisProfileInfoChange('notarisEmail', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="notarisProfilePersonalPhone">Nomor Telepon Notaris/PPAT</Label>
                    <Input id="notarisProfilePersonalPhone" value={notarisProfilePersonalPhone} onChange={e => handleNotarisProfileInfoChange('notarisPersonalPhone', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="notarisProfileUsername">Username Notaris/PPAT (untuk login)</Label>
                    <Input id="notarisProfileUsername" value={notarisProfileUsername} onChange={e => handleNotarisProfileInfoChange('notarisUsername', e.target.value)} className="mt-1" />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-medium">Ganti Password Notaris/PPAT</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="newPassword">Password Baru</Label>
                        <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Masukkan password baru" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="confirmNewPassword">Konfirmasi Password Baru</Label>
                        <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Konfirmasi password baru" className="mt-1" />
                      </div>
                  </div>
                </div>
                
                <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-medium flex items-center"><Bell className="mr-2 h-5 w-5"/>Notifikasi Dalam Aplikasi</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors shadow-sm">
                            <div>
                                <Label htmlFor="notifAktivitasAkun" className="font-medium text-sm">Aktivitas Akun</Label>
                                <p className="text-xs text-muted-foreground">Dapatkan notifikasi tentang aktivitas penting di akun Anda.</p>
                            </div>
                            <Switch id="notifAktivitasAkun" checked={notifAktivitasAkun} onCheckedChange={(checked) => handleNotificationChange('notifAktivitasAkun', checked)} />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors shadow-sm">
                            <div>
                                <Label htmlFor="notifPembaruanProses" className="font-medium text-sm">Pembaruan Proses Layanan</Label>
                                <p className="text-xs text-muted-foreground">Dapatkan notifikasi jika ada pembaruan pada status ceklis/tahapan layanan di halaman Proses.</p>
                            </div>
                            <Switch id="notifPembaruanProses" checked={notifPembaruanProses} onCheckedChange={(checked) => handleNotificationChange('notifPembaruanProses', checked)} />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors shadow-sm">
                            <div>
                                <Label htmlFor="notifCatatanBaru" className="font-medium text-sm">Catatan Baru Ditambahkan</Label>
                                <p className="text-xs text-muted-foreground">Dapatkan notifikasi jika ada catatan baru yang ditulis atau ditambahkan terkait klien atau berkas.</p>
                            </div>
                            <Switch id="notifCatatanBaru" checked={notifCatatanBaru} onCheckedChange={(checked) => handleNotificationChange('notifCatatanBaru', checked)} />
                        </div>
                    </div>
                </div>

              </CardContent>
              <CardFooter className="justify-end border-t pt-6">
                <Button size="sm" onClick={handleSaveNotarisProfileAndNotifications}><Save className="mr-2 h-4 w-4"/> Simpan Perubahan Profil &amp; Notifikasi</Button>
              </CardFooter>
            </Card>
          ) : ( 
            <Card>
              <CardHeader>
                <CardTitle>Profil Akun</CardTitle>
                <CardDescription>Informasi akun Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Peran Anda</Label>
                  <p className="font-semibold text-sm">{userRole}</p>
                </div>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <LogOut className="mr-2 h-4 w-4" /> Keluar dari Sistem
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin keluar dari sistem? Sesi Anda akan berakhir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">Keluar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isNotaris && (
          <TabsContent value="akunStaf">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tambah Akun Staf Baru</CardTitle>
                  <CardDescription className="text-xs">Buat akun untuk staf agar dapat mengakses sistem.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-destructive"><span className="font-bold">PENTING:</span> Password staf disimpan apa adanya (tidak aman) hanya untuk demo.</p>
                  <form onSubmit={handleAddStaff} className="space-y-3">
                    <div>
                      <Label htmlFor="newStaffName" className="text-sm">Nama Lengkap Staf</Label>
                      <Input id="newStaffName" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} placeholder="Masukkan nama lengkap" className="mt-1 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="newStaffUsername" className="text-sm">Username Staf</Label>
                      <Input id="newStaffUsername" value={newStaffUsername} onChange={e => setNewStaffUsername(e.target.value)} placeholder="Masukkan username (untuk login)" className="mt-1 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="newStaffPassword" className="text-sm">Password Staf</Label>
                      <Input id="newStaffPassword" type="password" value={newStaffPassword} onChange={e => setNewStaffPassword(e.target.value)} placeholder="Password (untuk login)" className="mt-1 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="confirmNewStaffPassword" className="text-sm">Konfirmasi Password Staf</Label>
                      <Input id="confirmNewStaffPassword" type="password" value={confirmNewStaffPassword} onChange={e => setConfirmNewStaffPassword(e.target.value)} placeholder="Ulangi password" className="mt-1 text-sm" />
                    </div>
                    <Button type="submit" size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <Users className="mr-2 h-4 w-4"/> Tambah Staf Baru
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daftar Akun Staf</CardTitle>
                  <CardDescription className="text-xs">Kelola akun staf yang sudah terdaftar.</CardDescription>
                </CardHeader>
                <CardContent>
                  {staffList.length > 0 ? (
                    <ul className="space-y-3">
                      {staffList.map(staff => (
                        <li key={staff.id} className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors shadow-sm">
                          <div>
                              <p className="font-medium text-sm">{staff.name}</p>
                              <p className="text-muted-foreground text-xs">@{staff.username}</p>
                          </div>
                          <div className="flex items-center gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                      <Trash2 className="h-4 w-4"/>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-base">Konfirmasi Hapus Staf</AlertDialogTitle>
                                    <AlertDialogDescription className="text-xs">
                                      Apakah Anda yakin ingin menghapus staf {staff.name} (@{staff.username})? Tindakan ini tidak dapat diurungkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteStaff(staff.id)} className="bg-destructive hover:bg-destructive/90 text-xs">Hapus Staf</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum ada akun staf yang ditambahkan.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {isNotaris && (
          <TabsContent value="infoKantor">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kantor</CardTitle>
                <CardDescription>Kelola detail kontak dan alamat kantor Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-md border bg-muted/30">
                  <Label htmlFor="officeName" className="font-medium">Nama Kantor</Label>
                  <p id="officeName" className="text-sm mt-1">Kantor Notaris-PPAT ANDI MUTTAQIN, S.H., M.Kn.</p>
                </div>
                <div>
                  <Label htmlFor="officePhone">Nomor Telepon Kantor</Label>
                  <Input id="officePhone" value={officeInfo.phone} onChange={e => handleOfficeInfoChange('phone', e.target.value)} className="mt-1"/>
                </div>
                <div>
                  <Label htmlFor="officeEmail">Alamat Email Kantor</Label>
                  <Input id="officeEmail" type="email" value={officeInfo.email} onChange={e => handleOfficeInfoChange('email', e.target.value)} className="mt-1" placeholder="cth: info@kantor.com"/>
                </div>
                <div>
                  <Label htmlFor="officeAddress">Alamat Fisik Kantor</Label>
                  <Textarea id="officeAddress" value={officeInfo.address} onChange={e => handleOfficeInfoChange('address', e.target.value)} className="mt-1" rows={3} placeholder="Jl. Contoh No. 123, Kota, Provinsi"/>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" onClick={handleSaveOfficeInfo}><Save className="mr-2 h-4 w-4"/> Simpan Informasi Kantor</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}

        {isNotaris && (
           <TabsContent value="backupPulihkan">
            <Card>
              <CardHeader>
                <CardTitle>Backup &amp; Pulihkan Data Aplikasi</CardTitle>
                <CardDescription>Backup semua data aplikasi Anda (Klien, Berkas, Pengaturan, Akun Staf, Username/Password Notaris) ke berkas JSON, atau pulihkan dari backup.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Backup Data</h3>
                  <div className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors shadow-sm">
                    <div>
                      <Label htmlFor="backupOtomatis" className="font-medium text-sm">Backup Otomatis (Info)</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Fitur backup otomatis ke drive spesifik tidak tersedia dalam prototipe ini.</p>
                    </div>
                    <Switch id="backupOtomatis" disabled />
                  </div>
                  <div>
                    <Button size="sm" onClick={handleBackup} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Download className="mr-2 h-4 w-4" /> Backup Manual ke Berkas
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Mengklik tombol di atas akan mengunduh berkas ".json" berisi semua data aplikasi Anda. Simpan berkas ini di tempat yang aman.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pulihkan Data dari Berkas</h3>
                  <p className="text-sm text-muted-foreground">Pilih berkas backup ".json" yang sebelumnya Anda simpan. Memulihkan data akan menimpa semua data yang ada saat ini.</p>
                  <div>
                    <Button size="sm" variant="outline" onClick={handleImportData}>
                      <Upload className="mr-2 h-4 w-4" /> Pilih Berkas &amp; Pulihkan
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1.5">PERHATIAN: Setelah memulihkan, disarankan untuk menyegarkan (refresh) halaman atau navigasi ulang agar perubahan diterapkan sepenuhnya di semua bagian aplikasi.</p>
                  </div>
                </div>
                
                <div className="space-y-4 border-t border-destructive/30 pt-6">
                  <h3 className="text-lg font-medium text-destructive">Hapus Semua Data Klien</h3>
                  <p className="text-sm text-muted-foreground">Tindakan ini akan menghapus semua data klien yang tersimpan secara permanen. Pengaturan lain (Info Kantor, Akun Staf, Username/Password Notaris/PPAT, dll) tidak akan terhapus. Pastikan Anda sudah melakukan backup data klien jika diperlukan.</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus Data Klien
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus Data Klien</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda benar-benar yakin ingin menghapus semua data klien? Tindakan ini tidak dapat diurungkan. Pengaturan lain akan tetap tersimpan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleHapusSemuaDataKlien} className="bg-destructive hover:bg-destructive/90">Ya, Hapus Data Klien</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="tampilan">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan</CardTitle>
              <CardDescription>Sesuaikan tampilan aplikasi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="block mb-2">Tema Aplikasi</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>Mode Terang</Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>Mode Gelap</Button>
                  <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")}>Sistem</Button>
                </div>
              </div>
              <div>
                <Label htmlFor="fontSizeSelect">Ukuran Font</Label>
                <Select value={fontSize} onValueChange={setFontSize} disabled>
                  <SelectTrigger id="fontSizeSelect" className="mt-1">
                    <SelectValue placeholder="Pilih ukuran font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kecil">Kecil</SelectItem>
                    <SelectItem value="sedang">Sedang</SelectItem>
                    <SelectItem value="besar">Besar</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Pengaturan ukuran font via UI belum aktif.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" onClick={handleSaveDisplaySettings}><Save className="mr-2 h-4 w-4"/> Simpan Pengaturan Tampilan</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

