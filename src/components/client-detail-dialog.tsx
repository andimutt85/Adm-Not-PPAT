
"use client";

import * as React from "react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Client, ProcessChecklistItem } from "@/types";
import { Check, X, Circle } from "lucide-react"; // Added Circle for unchecked
import { cn } from "@/lib/utils";

interface ClientDetailDialogProps {
  client: Client | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
  <div className={cn("grid gap-1", fullWidth ? "col-span-2" : "col-span-2 sm:col-span-1")}>
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="text-sm font-medium break-words">
      {typeof value === 'string' && (!value || value.trim() === "") ? "-" : value}
    </div>
  </div>
);

const ChecklistItemDisplay: React.FC<{ item: ProcessChecklistItem }> = ({ item }) => (
  <li className="flex items-center gap-2 text-sm">
    {item.checked ? (
      <Check className="h-4 w-4 text-emerald-500" />
    ) : (
      <Circle className="h-3 w-3 text-muted-foreground" /> // Using Circle for unchecked
    )}
    <span className={cn(item.checked && "text-emerald-500")}>{item.label}</span>
  </li>
);


export function ClientDetailDialog({ client, isOpen, onOpenChange }: ClientDetailDialogProps) {
  if (!client) return null;

  const clientName = client.names.join(", ") || "N/A";
  const serviceDisplayName = `${client.service.type} - ${client.service.name}${client.service.customName && client.service.name !== client.service.customName ? ` (${client.service.customName})` : ""}`;
  const createdAtDate = client.createdAt ? format(new Date(client.createdAt), "dd MMMM yyyy, HH:mm", { locale: localeID }) : "-";
  

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg">Detail Klien: <span className="font-semibold">{clientName}</span></DialogTitle>
          <DialogDescription className="text-xs">
            Informasi lengkap mengenai klien dan layanan yang diterima.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] h-auto">
          <div className="p-6 space-y-6 text-sm">
            
            <section className="space-y-3 p-4 border rounded-lg shadow-sm bg-card">
              <h3 className="text-base font-semibold text-card-foreground mb-3">Informasi Umum</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DetailItem label="Nama Klien" value={client.names.join(", ") || "-"} fullWidth />
                <DetailItem label="No. Telepon" value={client.phones?.join(", ") || "-"} />
                <DetailItem label="Tanggal Dibuat" value={createdAtDate} />
                <div className="col-span-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Alamat</p>
                    {client.addresses && client.addresses.length > 0 ? (
                        client.addresses.map((addr, index) => (
                        <p key={index} className="text-sm font-medium p-2 border rounded-md bg-background break-words">
                            {addr || "-"}
                        </p>
                        ))
                    ) : (
                        <p className="text-sm font-medium">-</p>
                    )}
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-3 p-4 border rounded-lg shadow-sm bg-card">
              <h3 className="text-base font-semibold text-card-foreground mb-3">Detail Layanan & Proses</h3>
               <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DetailItem label="Layanan yang Dipilih" value={serviceDisplayName} fullWidth />
                
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Checklist Proses</p>
                  {client.processChecklist.length > 0 ? (
                    <ul className="space-y-1.5 list-inside pl-1">
                      {client.processChecklist.map((item) => (
                        <ChecklistItemDisplay key={item.id} item={item} />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-medium">- (Tidak ada checklist)</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t mt-0 bg-background">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
