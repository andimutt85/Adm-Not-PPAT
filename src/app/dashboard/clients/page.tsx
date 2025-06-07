
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
import { PlusCircle, Edit, Trash2, Users, Search, Eye } from "lucide-react"; 
import { ClientFormDialog } from "@/components/client-form-dialog";
import type { Client } from "@/types";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useClientData } from "@/context/ClientDataContext";
import { SERVICE_TYPES, getChecklistForService } from "@/constants/navigation";
import { ClientDetailDialog } from "@/components/client-detail-dialog"; 

// Helper function to determine the original serviceValueKey of a client
// This is important for deciding if the checklist needs to be reset upon editing a service.
const getClientServiceValueKey = (client: Client): string => {
    if (!client.service?.type) return "";
    const serviceTypeObj = SERVICE_TYPES.find(st => st.value === client.service.type);
    if (!serviceTypeObj) return "";

    // Check if service name matches a non-editable service's label directly
    let serviceDef = serviceTypeObj.services.find(s => s.label === client.service.name && !s.isEditable);
    if (serviceDef) return serviceDef.value;
    
    // Check if it's an editable service (e.g., "Lain-lain")
    // For editable services, client.service.name would be the customName
    const editableService = serviceTypeObj.services.find(s => s.isEditable);
    if (editableService) {
        // If client.service.customName is set and matches service.name, it's definitely this editable service
        if (client.service.customName && client.service.customName === client.service.name) {
            return editableService.value;
        }
        // If no customName, but the service.name matches the editableService.label (e.g. "Lain-lain PPAT")
        if (client.service.name === editableService.label) {
             return editableService.value;
        }
    }
    
    // Fallback: If it's not a standard non-editable and not clearly an editable service
    // this could happen if data is inconsistent or label was manually changed.
    // For safety, if no match, try to find by label again.
    serviceDef = serviceTypeObj.services.find(s => s.label === client.service.name);
    if (serviceDef) return serviceDef.value;

    return ""; // Should ideally not be reached if data is consistent
};


export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient, getClientById } = useClientData();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [selectedClientForDetail, setSelectedClientForDetail] = React.useState<Client | null>(null);
  const { toast } = useToast();

  const handleSaveClient = React.useCallback((
    formData: Omit<Client, "createdAt" | "processChecklist" | "paymentDetails" | "fileStatus"> & { id?: string; serviceValueKey: string }
  ) => {
    if (formData.id) { // Editing existing client
      const existingClient = getClientById(formData.id);
      if (!existingClient) {
        toast({ title: "Error", description: "Klien tidak ditemukan untuk diedit.", variant: "destructive" });
        return;
      }

      const originalServiceValueKey = getClientServiceValueKey(existingClient);
      
      const newProcessChecklist = formData.serviceValueKey !== originalServiceValueKey
        ? getChecklistForService(formData.service.type, formData.serviceValueKey).map(item => ({ ...item, checked: false }))
        : existingClient.processChecklist;

      const updatedClientData: Client = {
        ...existingClient, 
        names: formData.names, 
        phones: formData.phones,
        addresses: formData.addresses, 
        service: formData.service,
        processChecklist: newProcessChecklist, 
      };
      updateClient(updatedClientData);
      toast({ title: "Sukses", description: "Data klien berhasil diperbarui." });
    } else { // Adding new client
      const { id, ...clientDataForAdd } = formData; 
      addClient(clientDataForAdd);
      toast({ title: "Sukses", description: "Klien baru berhasil ditambahkan." });
    }
  }, [getClientById, addClient, updateClient, toast]);

  const handleDeleteAction = (clientId: string) => {
    deleteClient(clientId);
    toast({ title: "Sukses", description: "Data klien berhasil dihapus." });
  };

  const handleOpenDetailDialog = (client: Client) => {
    setSelectedClientForDetail(client);
    setIsDetailDialogOpen(true);
  };
  
  const filteredClients = clients.filter(client => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatch = client.names.some(name => name.toLowerCase().includes(searchTermLower));
    const phoneMatch = client.phones && client.phones.some(phone => phone.toLowerCase().includes(searchTermLower));
    const addressMatch = client.addresses && client.addresses.some(address => address.toLowerCase().includes(searchTermLower));
    const serviceMatch = client.service.name.toLowerCase().includes(searchTermLower) || 
                         (client.service.customName && client.service.customName.toLowerCase().includes(searchTermLower));
    return nameMatch || phoneMatch || addressMatch || serviceMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center">
            <Users className="mr-2 h-5 w-5" /> Manajemen Klien
          </h1>
          <p className="text-xs text-muted-foreground">Tambah, edit, atau hapus data klien.</p>
        </div>
        <ClientFormDialog onSave={handleSaveClient} />
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search"
          placeholder="Cari klien (nama, telepon, alamat, layanan)..."
          className="pl-8 w-full sm:w-1/3 text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Card className="shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] text-xs font-semibold">Nama Klien</TableHead><TableHead className="text-xs font-semibold">No. Telepon</TableHead><TableHead className="text-xs font-semibold">Alamat</TableHead><TableHead className="text-xs font-semibold">Layanan</TableHead><TableHead className="text-xs font-semibold text-right w-[160px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-semibold text-xs">{client.names.join(", ") || "N/A"}</TableCell>
                <TableCell className="text-xs">{(client.phones && client.phones.join(", ")) || "-"}</TableCell>
                <TableCell className="text-xs max-w-xs truncate">{(client.addresses && client.addresses.length > 0 ? client.addresses[0] : "-")}</TableCell>
                <TableCell className="text-xs">
                  {client.service.type} - {client.service.name}
                  {client.service.customName && client.service.name !== client.service.customName ? ` (${client.service.customName})` : ""}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end"> {/* Reduced gap */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleOpenDetailDialog(client)}
                      title="Lihat Detail"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="sr-only">Lihat Detail</span>
                    </Button>
                    <ClientFormDialog 
                      client={client} 
                      onSave={handleSaveClient}
                      triggerButton={
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit">
                          <Edit className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Hapus">
                          <Trash2 className="h-3.5 w-3.5" />
                           <span className="sr-only">Hapus</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base">Konfirmasi Penghapusan</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs">
                            Apakah Anda yakin ingin menghapus klien <span className="font-semibold">"{client.names.join(", ") || 'Tanpa Nama'}"</span>? Tindakan ini tidak dapat diurungkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAction(client.id)} className="text-xs bg-destructive hover:bg-destructive/90">
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs text-muted-foreground h-24">
                  Tidak ada data klien. Tambahkan klien baru menggunakan tombol "+ Tambah Klien Baru".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      {selectedClientForDetail && (
        <ClientDetailDialog
          client={selectedClientForDetail}
          isOpen={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      )}
    </div>
  );
}
    
