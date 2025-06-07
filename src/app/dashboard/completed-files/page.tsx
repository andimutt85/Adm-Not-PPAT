
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileCheck2, Search, UserCheck, Undo2 } from "lucide-react";
import type { Client, NotificationPrefs } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card"; 
import { format } from "date-fns"; 
import { useClientData } from "@/context/ClientDataContext";
import { cn } from "@/lib/utils";

const NOTIFICATION_PREFS_KEY = 'notarisAppNotificationPrefs';
const initialNotificationPrefsState: NotificationPrefs = {
  notifAktivitasAkun: true,
  notifPembaruanProses: true,
  notifCatatanBaru: true,
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


interface MarkAsTakenDialogProps {
  client: Client;
  onMarkAsTaken: (clientId: string, retrievedBy: string) => void;
  onMarkAsNotTaken: (clientId: string) => void;
}

function MarkAsTakenDialog({ client, onMarkAsTaken, onMarkAsNotTaken }: MarkAsTakenDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [retrievedBy, setRetrievedBy] = React.useState(client.fileStatus.retrievedBy || "");
  const { toast } = useToast();
  const clientDisplayName = client.names.join(", ") || "N/A";

  const handleSubmit = () => {
    const prefs = getNotificationPrefs();
    if (client.fileStatus.status === "Selesai - Sudah Diambil") {
        onMarkAsNotTaken(client.id);
        if (prefs.notifPembaruanProses) {
            toast({ title: "Info Update Proses", description: `Status berkas ${clientDisplayName} diubah menjadi 'Belum Diambil'.`});
        }
    } else {
        if (retrievedBy.trim() === "") {
          toast({ title: "Gagal", description: "Nama pengambil wajib diisi.", variant: "destructive" });
          return;
        }
        onMarkAsTaken(client.id, retrievedBy);
    }
    setIsOpen(false);
    if (client.fileStatus.status !== "Selesai - Sudah Diambil") {
        setRetrievedBy("");
    }
  };

  const isAlreadyTaken = client.fileStatus.status === "Selesai - Sudah Diambil";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (open) { 
            setRetrievedBy(client.fileStatus.retrievedBy || "");
        }
    }}>
      <DialogTrigger asChild>
        <Button 
            variant={isAlreadyTaken ? "secondary" : "outline"} 
            size="icon" 
            className="h-7 w-7"
            title={isAlreadyTaken ? "Edit Pengambilan" : "Tandai Diambil"}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span className="sr-only">{isAlreadyTaken ? "Edit Info Pengambilan" : "Tandai Berkas Diambil"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">{isAlreadyTaken ? "Edit Info Pengambilan" : "Tandai Berkas Diambil"}</DialogTitle>
          <DialogDescription className="text-xs">
            Klien: <span className="font-semibold">{clientDisplayName}</span> <br />
            Layanan: {client.service.type} - {client.service.name}
             {client.service.customName && client.service.name !== client.service.customName ? ` (${client.service.customName})` : ""}
          </DialogDescription>
        </DialogHeader>
        {!isAlreadyTaken && (
            <div className="py-4 space-y-2">
            <Label htmlFor={`retrievedBy-${client.id}`} className="text-xs">Nama Pengambil*</Label>
            <Input 
                id={`retrievedBy-${client.id}`}
                value={retrievedBy} 
                onChange={(e) => setRetrievedBy(e.target.value)} 
                className="text-sm"
                placeholder="Misal: Klien ybs, Anak, Kuasa, dll."
            />
            </div>
        )}
        {isAlreadyTaken && (
            <div className="py-4 space-y-2">
                <p className="text-xs">Berkas ini telah diambil oleh: <strong>{client.fileStatus.retrievedBy}</strong> pada {client.fileStatus.retrievalDate ? format(new Date(client.fileStatus.retrievalDate), "dd MMM yyyy, HH:mm") : '-'}.</p>
                <p className="text-xs mt-2">Apakah Anda ingin menandai berkas ini sebagai 'Belum Diambil' kembali?</p>
            </div>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>Batal</Button>
          <Button size="sm" onClick={handleSubmit} variant={isAlreadyTaken ? "destructive" : "default"}>
            {isAlreadyTaken ? "Tandai Belum Diambil" : "Simpan & Tandai Diambil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function CompletedFilesPage() {
  const { clients: allClientsFromContext, updateClient, getClientById } = useClientData();
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();

  const handleMarkAsTaken = (clientId: string, retrievedByName: string) => {
    const clientToUpdate = getClientById(clientId);
    if (clientToUpdate) {
      updateClient({ 
        ...clientToUpdate, 
        fileStatus: { 
          status: "Selesai - Sudah Diambil", 
          retrievedBy: retrievedByName, 
          retrievalDate: new Date().toISOString() 
        } 
      });
      const prefs = getNotificationPrefs();
      if (prefs.notifPembaruanProses) {
        toast({ title: "Sukses Update Proses", description: `Status berkas ${clientToUpdate.names.join(", ")} berhasil diperbarui menjadi 'Sudah Diambil'.`});
      }
    }
  };
  
  const handleMarkAsNotTaken = (clientId: string) => {
    const clientToUpdate = getClientById(clientId);
    if (clientToUpdate) {
      updateClient({ 
        ...clientToUpdate, 
        fileStatus: { 
          status: "Selesai - Belum Diambil", 
          retrievedBy: undefined, 
          retrievalDate: undefined 
        } 
      });
       // Toast handled in MarkAsTakenDialog to ensure it respects prefs at the point of action
    }
  };

  const handleUndoCompletion = (clientId: string) => {
    const clientToUpdate = getClientById(clientId);
    if (clientToUpdate) {
      const updatedChecklist = clientToUpdate.processChecklist.map(item => {
        const isCompletionStep = item.label.toLowerCase().startsWith("selesai");
        return {
          ...item,
          checked: !isCompletionStep,
        };
      });
      updateClient({
        ...clientToUpdate,
        processChecklist: updatedChecklist,
        fileStatus: {
          status: "Dalam Proses", 
          retrievedBy: undefined,
          retrievalDate: undefined,
        },
      });
      const prefs = getNotificationPrefs();
      if (prefs.notifPembaruanProses) {
          toast({
            title: "Status Dibatalkan",
            description: `Status berkas untuk ${clientToUpdate.names.join(", ")} telah dikembalikan ke 'Dalam Proses' dan checklist disesuaikan.`,
          });
      }
    }
  };

  const completedClients = allClientsFromContext.filter(client => 
    client.fileStatus.status === "Selesai - Belum Diambil" || client.fileStatus.status === "Selesai - Sudah Diambil"
  );
  
  const filteredClients = completedClients.filter(client => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatch = client.names.some(name => name.toLowerCase().includes(searchTermLower));
    const serviceMatch = client.service.name.toLowerCase().includes(searchTermLower) ||
                         (client.service.customName && client.service.customName.toLowerCase().includes(searchTermLower));
    const retrievedByMatch = client.fileStatus.retrievedBy && client.fileStatus.retrievedBy.toLowerCase().includes(searchTermLower);
    const statusMatch = client.fileStatus.status.toLowerCase().includes(searchTermLower);

    return nameMatch || serviceMatch || retrievedByMatch || statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-xl font-semibold flex items-center">
                <FileCheck2 className="mr-2 h-5 w-5" /> Berkas Selesai
            </h1>
            <p className="text-xs text-muted-foreground">Kelola status pengambilan berkas yang sudah selesai.</p>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search"
          placeholder="Cari klien, layanan, status, atau nama pengambil..."
          className="pl-8 w-full sm:w-1/3 text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] text-xs"><span className="font-semibold">Nama Klien</span></TableHead>
              <TableHead className="text-xs">Layanan</TableHead>
              <TableHead className="text-xs">Status Pengambilan</TableHead>
              <TableHead className="text-xs">Diambil Oleh</TableHead>
              <TableHead className="text-xs">Tgl. Diambil</TableHead>
              <TableHead className="text-xs text-right w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-semibold text-xs">{client.names.join(", ") || "N/A"}</TableCell>
                <TableCell className="text-xs">
                  {client.service.type} - {client.service.name}
                  {client.service.customName && client.service.name !== client.service.customName ? ` (${client.service.customName})` : ""}
                </TableCell>
                <TableCell className="text-xs">
                    <Badge 
                        variant={client.fileStatus.status === "Selesai - Sudah Diambil" ? "default" : "secondary"}
                        className={cn(
                            "text-xs capitalize border",
                            client.fileStatus.status === "Selesai - Sudah Diambil" 
                                ? "bg-emerald-500 hover:bg-emerald-500/90 text-white" 
                                : "bg-opacity-70"
                        )}
                    >
                        {client.fileStatus.status === "Selesai - Sudah Diambil" ? "Sudah Diambil" : "Belum Diambil"}
                    </Badge>
                </TableCell>
                <TableCell className="text-xs">{client.fileStatus.retrievedBy || "-"}</TableCell>
                <TableCell className="text-xs">
                  {client.fileStatus.retrievalDate ? format(new Date(client.fileStatus.retrievalDate), "dd MMM yyyy") : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <MarkAsTakenDialog client={client} onMarkAsTaken={handleMarkAsTaken} onMarkAsNotTaken={handleMarkAsNotTaken} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-7 w-7" title="Batalkan Penyelesaian">
                          <Undo2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Batalkan Penyelesaian</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base">Konfirmasi Pembatalan Penyelesaian</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs">
                            Apakah Anda yakin ingin mengembalikan status berkas untuk klien <span className="font-semibold">"{client.names.join(", ") || 'Tanpa Nama'}"</span> ke "Dalam Proses"? Checklist proses akan disesuaikan (semua tercentang kecuali tahap akhir).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-xs">Tidak</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleUndoCompletion(client.id)} className="text-xs">
                            Ya, Batalkan Penyelesaian
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-xs text-muted-foreground h-24">
                    Tidak ada berkas selesai yang cocok dengan pencarian Anda atau belum ada berkas yang selesai.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
    
