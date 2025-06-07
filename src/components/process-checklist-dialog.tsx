
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Client, ProcessChecklistItem, PaymentDetails, Role } from "@/types";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "./ui/input"; 
import { Textarea } from "./ui/textarea"; 
import { useToast } from "@/hooks/use-toast"; 
import { cn } from "@/lib/utils";

interface ProcessChecklistDialogProps {
  client: Client | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateClient: (updatedClient: Client) => void;
}

const NOTIFICATION_PREFS_KEY = 'notarisAppNotificationPrefs';
const defaultNotificationPrefs = { 
  notifAktivitasAkun: true, 
  notifPembaruanProses: true, 
  notifCatatanBaru: true 
};

const getNotificationPrefs = () => {
  if (typeof window === 'undefined') return defaultNotificationPrefs;
  const storedPrefsString = localStorage.getItem(NOTIFICATION_PREFS_KEY);
  if (storedPrefsString) {
    try {
      return JSON.parse(storedPrefsString);
    } catch (e) {
      return defaultNotificationPrefs;
    }
  }
  return defaultNotificationPrefs;
};


export function ProcessChecklistDialog({ client, isOpen, onOpenChange, onUpdateClient }: ProcessChecklistDialogProps) {
  const [currentClientData, setCurrentClientData] = React.useState<Client | null>(null);
  const [currentNotes, setCurrentNotes] = React.useState<string>("");
  const [currentUserRole, setCurrentUserRole] = React.useState<Role | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem("userRole") as Role | null;
      setCurrentUserRole(storedRole);
    }

    if (isOpen && client) {
      const clientDeepCopy = JSON.parse(JSON.stringify(client));
      setCurrentClientData(clientDeepCopy);
      setCurrentNotes(clientDeepCopy.notes || "");
    } else if (!isOpen) {
      setCurrentClientData(null);
      setCurrentNotes("");
    }
  }, [client, isOpen]); 

  if (!currentClientData) return null;

  const clientName = currentClientData.names.join(", ") || "N/A";
  const serviceDisplayName = `${currentClientData.service.type} - ${currentClientData.service.name}${currentClientData.service.customName && currentClientData.service.name !== currentClientData.service.customName ? ` (${currentClientData.service.customName})` : ""}`;

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    let itemLabel = "";
    setCurrentClientData(prev => {
      if (!prev) return null;
      const updatedChecklist = prev.processChecklist.map(item => {
        if (item.id === itemId) {
          itemLabel = item.label; // Capture label for toast
          return { ...item, checked };
        }
        return item;
      });
      return { ...prev, processChecklist: updatedChecklist };
    });

    const prefs = getNotificationPrefs();
    if (prefs.notifPembaruanProses && itemLabel) {
      toast({
        title: "Update Proses",
        description: `Tahapan '${itemLabel}' untuk ${clientName} ${checked ? 'ditandai selesai.' : 'ditandai belum selesai.'}`
      });
    }
  };

  const handlePaymentStatusChange = (status: PaymentDetails["status"]) => {
    setCurrentClientData(prev => {
      if (!prev) return null;
      const newPaymentDetails = { ...prev.paymentDetails, status };
      if (status !== "DP") {
        delete newPaymentDetails.dpAmount; 
      }
      return { ...prev, paymentDetails: newPaymentDetails };
    });
  };
  
  const handleDpAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentClientData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        paymentDetails: { ...prev.paymentDetails, dpAmount: value === "" ? undefined : value },
      };
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentNotes(e.target.value);
  };

  const handleSave = () => {
    if (currentClientData) {
      const prefs = getNotificationPrefs();
      let processUpdated = false;
      let notesChanged = false;

      // Check if checklist or payment details changed
      if (JSON.stringify(client?.processChecklist) !== JSON.stringify(currentClientData.processChecklist) ||
          JSON.stringify(client?.paymentDetails) !== JSON.stringify(currentClientData.paymentDetails)) {
        processUpdated = true;
      }
      // Check if notes changed
      if ((client?.notes || "") !== currentNotes) {
        notesChanged = true;
      }
      
      const allChecked = currentClientData.processChecklist.length > 0 && currentClientData.processChecklist.every(item => item.checked);
      let newFileStatus = currentClientData.fileStatus;
      let fileStatusChanged = false;

      const originalFileStatus = client?.fileStatus.status;

      if (allChecked && currentClientData.fileStatus.status !== "Selesai - Sudah Diambil" && currentClientData.fileStatus.status !== "Selesai - Belum Diambil") {
        newFileStatus = { ...currentClientData.fileStatus, status: "Selesai - Belum Diambil" };
        fileStatusChanged = true;
      } else if (!allChecked && (currentClientData.fileStatus.status === "Selesai - Belum Diambil" || currentClientData.fileStatus.status === "Selesai - Sudah Diambil")) {
        newFileStatus = { ...currentClientData.fileStatus, status: "Dalam Proses" };
        fileStatusChanged = true;
      } else if (currentClientData.fileStatus.status === "Belum Diproses" && currentClientData.processChecklist.some(item => item.checked)) {
         newFileStatus = { ...currentClientData.fileStatus, status: allChecked ? "Selesai - Belum Diambil" : "Dalam Proses"};
         fileStatusChanged = true;
      }
      
      const clientDataToUpdate = { ...currentClientData, notes: currentNotes, fileStatus: newFileStatus };
      onUpdateClient(clientDataToUpdate);

      // Notify about file status change if it happened and was significant
      if (fileStatusChanged && newFileStatus.status === "Selesai - Belum Diambil" && originalFileStatus !== "Selesai - Belum Diambil" && originalFileStatus !== "Selesai - Sudah Diambil") {
        if (prefs.notifPembaruanProses) {
            toast({ title: "Proses Selesai", description: `Berkas untuk ${clientName} telah selesai dan dipindahkan ke Berkas Selesai.`});
        }
      } else if (processUpdated && !fileStatusChanged) { // Notify general process update if file status didn't cause a major "completed" toast
        if (prefs.notifPembaruanProses) {
          // This specific toast is now handled by handleChecklistChange, so we avoid double toasting.
          // Only show if it's a payment status change or similar non-checklist item change.
           if (JSON.stringify(client?.paymentDetails) !== JSON.stringify(currentClientData.paymentDetails)) {
             toast({ title: "Update Proses", description: `Detail pembayaran untuk klien ${clientName} berhasil diperbarui.`});
           }
        }
      }
      
      if (notesChanged && prefs.notifCatatanBaru) {
        toast({ title: "Catatan Disimpan", description: `Catatan untuk klien ${clientName} berhasil disimpan.`});
      }
    }
    onOpenChange(false);
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg text-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">Proses Berkas: <span className="font-semibold">{clientName}</span></DialogTitle>
          <DialogDescription className="text-xs">
            Layanan : <span className="font-semibold">{serviceDisplayName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[65vh] py-4 pr-6">
          <div className="space-y-6">
            {currentUserRole === "Notaris/PPAT" && (
              <div>
                <Label className="text-xs font-semibold mb-2 block">Status Pembayaran</Label>
                <RadioGroup
                  value={currentClientData.paymentDetails.status}
                  onValueChange={handlePaymentStatusChange}
                  className="flex space-x-4"
                >
                  {(["Belum Bayar", "DP", "Lunas"] as const).map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <RadioGroupItem value={status} id={`payment-${currentClientData?.id}-${status}`} />
                      <Label htmlFor={`payment-${currentClientData?.id}-${status}`} className="text-xs font-normal">{status}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {currentClientData.paymentDetails.status === "DP" && (
                  <div className="mt-3">
                    <Label htmlFor={`dpAmount-${currentClientData?.id}`} className="text-xs">Keterangan DP</Label>
                    <Input 
                      type="text" 
                      id={`dpAmount-${currentClientData?.id}`}
                      value={currentClientData.paymentDetails.dpAmount === undefined ? "" : currentClientData.paymentDetails.dpAmount} 
                      onChange={handleDpAmountChange}
                      placeholder="Mis: Rp 500.000,- atau keterangan lain" 
                      className="text-xs mt-1"
                    />
                  </div>
                )}
              </div>
            )}
            {currentUserRole === "Notaris/PPAT" && <Separator />}
            
            <div>
              <Label className="text-xs font-semibold mb-3 block">Checklist Proses</Label>
              {currentClientData.processChecklist.length > 0 ? (
                  <div className="space-y-3">
                    {currentClientData.processChecklist.map((item: ProcessChecklistItem) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${currentClientData?.id}-${item.id}`}
                          checked={item.checked}
                          onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)}
                          className={cn(
                            "border-muted-foreground data-[state=checked]:bg-emerald-500 data-[state=checked]:text-primary-foreground data-[state=checked]:border-emerald-600 focus:ring-emerald-500"
                          )}
                        />
                        <Label 
                          htmlFor={`${currentClientData?.id}-${item.id}`} 
                          className={cn(
                            "text-xs font-normal cursor-pointer",
                            item.checked && "line-through text-emerald-500"
                          )}
                        >
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
              ) : (
                <p className="text-xs text-muted-foreground">Tidak ada checklist untuk layanan ini.</p>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor={`notes-${currentClientData?.id}`} className="text-xs font-semibold mb-2 block">Catatan Klien</Label>
              <Textarea
                id={`notes-${currentClientData?.id}`}
                value={currentNotes}
                onChange={handleNotesChange}
                placeholder="Tambahkan catatan untuk klien ini..."
                className="text-xs min-h-[80px]"
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button type="button" size="sm" onClick={handleSave}>Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
