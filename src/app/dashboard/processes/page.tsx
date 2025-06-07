
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
import { FolderGit2, Edit, Search } from "lucide-react";
import type { Client, Role } from "@/types";
import { ProcessChecklistDialog } from "@/components/process-checklist-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useClientData } from "@/context/ClientDataContext";
import { cn } from "@/lib/utils";

export default function ProcessesPage() {
  const { clients: allClients, updateClient } = useClientData();
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentUserRole, setCurrentUserRole] = React.useState<Role | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem("userRole") as Role | null;
      setCurrentUserRole(storedRole);
    }
  }, []);

  const handleOpenChecklistDialog = (client: Client) => {
    setSelectedClient(client);
    setIsChecklistDialogOpen(true);
  };

  const handleUpdateClientInDialog = (updatedClientFromDialog: Client) => {
    updateClient(updatedClientFromDialog); // Update in global context
    // Toasts are now handled within ProcessChecklistDialog
    setSelectedClient(null); 
    setIsChecklistDialogOpen(false);
  };
  
  const getProcessProgress = (client: Client) => {
    const totalItems = client.processChecklist.length;
    if (totalItems === 0) return 0;
    const checkedItems = client.processChecklist.filter(item => item.checked).length;
    return Math.round((checkedItems / totalItems) * 100);
  };

  const clientsInProcess = allClients.filter(client => 
    client.fileStatus.status === "Dalam Proses" || client.fileStatus.status === "Belum Diproses"
  );

  const filteredClients = clientsInProcess.filter(client => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatch = client.names.some(name => name.toLowerCase().includes(searchTermLower));
    const serviceMatch = client.service.name.toLowerCase().includes(searchTermLower) ||
                         (client.service.customName && client.service.customName.toLowerCase().includes(searchTermLower));
    const paymentStatusMatch = currentUserRole !== "Staf" && client.paymentDetails.status.toLowerCase().includes(searchTermLower);
    const notesMatch = client.notes && client.notes.toLowerCase().includes(searchTermLower);
    
    return nameMatch || serviceMatch || paymentStatusMatch || notesMatch;
  });

  const isNotaris = currentUserRole === "Notaris/PPAT";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center">
            <FolderGit2 className="mr-2 h-5 w-5" /> Pelacakan Proses Berkas
          </h1>
          <p className="text-xs text-muted-foreground">Monitor dan perbarui progres berkas klien.</p>
        </div>
      </div>

       <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search"
          placeholder={isNotaris ? "Cari klien, layanan, status bayar, atau catatan..." : "Cari klien, layanan, atau catatan..."}
          className="pl-8 w-full sm:w-1/3 text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] text-xs font-semibold">Nama Klien</TableHead>
              <TableHead className="text-xs font-semibold">Layanan</TableHead>
              <TableHead className="text-xs font-semibold w-[350px]">Progres</TableHead>
              {isNotaris && <TableHead className="text-xs font-semibold">Status Bayar</TableHead>}
              <TableHead className="text-xs font-semibold text-right w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? filteredClients.map((client) => {
              const progressPercentage = getProcessProgress(client);
              const completedChecklistItems = client.processChecklist.filter(item => item.checked);

              return (
                <TableRow key={client.id}>
                  <TableCell className="font-semibold text-xs">{client.names.join(", ") || "N/A"}</TableCell>
                  <TableCell className="text-xs">
                    {client.service.type} - {client.service.name}
                    {client.service.customName && client.service.name !== client.service.customName ? ` (${client.service.customName})` : ""}
                  </TableCell>
                  <TableCell className="text-xs">
                      <div className="flex items-center gap-2 mb-1">
                          <div className="w-full bg-secondary rounded-full h-1.5">
                              <div 
                                  className="bg-emerald-500 h-1.5 rounded-full" 
                                  style={{ width: `${progressPercentage}%`}}
                              ></div>
                          </div>
                          <span className="text-muted-foreground text-xs">{progressPercentage}%</span>
                      </div>
                      {completedChecklistItems.length > 0 && (
                        <div className="mt-1 text-xs">
                          <span className="font-medium text-emerald-500">Tahapan Selesai :</span>
                          <ul className="list-disc list-inside pl-1">
                            {completedChecklistItems.map(item => (
                              <li key={item.id} className="text-emerald-500">{item.label}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {client.notes && (
                        <div className="mt-2 text-xs">
                          <p className="font-medium text-destructive">Catatan:</p>
                          <p className="text-destructive whitespace-pre-wrap">{client.notes}</p>
                        </div>
                      )}
                  </TableCell>
                  {isNotaris && (
                    <TableCell className="text-xs">
                      <Badge 
                        variant={
                          client.paymentDetails.status === "Lunas" ? "default" :
                          client.paymentDetails.status === "DP" ? "secondary" : "outline"
                        } 
                        className={cn(
                          "text-xs capitalize bg-opacity-70 border",
                          client.paymentDetails.status === "Lunas" && "bg-emerald-500 hover:bg-emerald-500/90 text-white"
                        )}
                      >
                        {client.paymentDetails.status}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleOpenChecklistDialog(client)}>
                      <Edit className="mr-1 h-3 w-3" /> Kelola
                    </Button>
                  </TableCell>
                </TableRow>
              );
            }) : (
               <TableRow>
                <TableCell colSpan={isNotaris ? 5 : 4} className="text-center text-xs text-muted-foreground h-24">
                  Tidak ada berkas dalam proses atau belum diproses yang cocok dengan pencarian Anda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {selectedClient && isChecklistDialogOpen && (
        <ProcessChecklistDialog
          client={selectedClient}
          isOpen={isChecklistDialogOpen}
          onOpenChange={(open) => {
            setIsChecklistDialogOpen(open);
            if (!open) setSelectedClient(null); 
          }}
          onUpdateClient={handleUpdateClientInDialog}
        />
      )}
    </div>
  );
}
