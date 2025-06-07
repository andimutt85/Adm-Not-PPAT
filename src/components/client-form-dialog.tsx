
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2, Save, CheckCircle } from "lucide-react";
import type { Client, Service as ClientService, ServiceType as ClientServiceTypeT } from "@/types";
import { SERVICE_TYPES, type ServiceDefinition as AppServiceDefinition } from "@/constants/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ClientFormDialogProps {
  client?: Client | null;
  onSave: (clientData: Omit<Client, "id" | "createdAt" | "processChecklist" | "paymentDetails" | "fileStatus" > & { id?: string; serviceValueKey: string }) => void;
  triggerButton?: React.ReactNode;
}

interface SelectedServiceState {
  type: ClientServiceTypeT;
  valueKey: string; 
  customName?: string;
}

export function ClientFormDialog({ client, onSave, triggerButton }: ClientFormDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [names, setNames] = React.useState<string[]>([""]);
  const [phones, setPhones] = React.useState<string[]>([""]);
  const [addresses, setAddresses] = React.useState<string[]>([""]);
  
  const [selectedServices, setSelectedServices] = React.useState<SelectedServiceState[]>([]);
  const [customServiceInputs, setCustomServiceInputs] = React.useState<Record<string, string>>({});
  const [activeAccordionItems, setActiveAccordionItems] = React.useState<string[]>([]);
  const { toast } = useToast();

  const getOriginalServiceValueKeyForClient = React.useCallback((currentClient: Client | null | undefined): string => {
    if (!currentClient?.service?.type) return "";
    const serviceTypeObj = SERVICE_TYPES.find(st => st.value === currentClient.service.type);
    if (!serviceTypeObj) return "";

    let serviceDef = serviceTypeObj.services.find(s => s.label === currentClient.service.name && !s.isEditable);
    if (serviceDef) return serviceDef.value;
    
    const editableService = serviceTypeObj.services.find(s => s.isEditable);
    if (editableService) {
        if (currentClient.service.customName && currentClient.service.customName === currentClient.service.name) {
            return editableService.value;
        }
        if (currentClient.service.name === editableService.label) {
             return editableService.value;
        }
    }
    serviceDef = serviceTypeObj.services.find(s => s.label === currentClient.service.name);
    if (serviceDef) return serviceDef.value;
    return ""; 
  }, []);

  const resetForm = React.useCallback(() => {
    setNames(client?.names?.length ? [...client.names] : [""]);
    setPhones(client?.phones?.length ? [...client.phones] : [""]);
    setAddresses(client?.addresses?.length ? [...client.addresses] : [""]);
    setSelectedServices([]);
    setCustomServiceInputs({});
    setActiveAccordionItems([]);

    if (client && client.service) {
      const originalServiceValueKey = getOriginalServiceValueKeyForClient(client);
      if (originalServiceValueKey) {
        const serviceTypeObj = SERVICE_TYPES.find(st => st.value === client.service.type);
        const serviceDef = serviceTypeObj?.services.find(s => s.value === originalServiceValueKey);

        if (serviceDef && serviceTypeObj) {
          const initialSelectedService: SelectedServiceState = {
            type: client.service.type,
            valueKey: serviceDef.value,
          };
          if (serviceDef.isEditable) {
            initialSelectedService.customName = client.service.customName || client.service.name || "";
            setCustomServiceInputs(prev => ({ ...prev, [serviceDef.value]: initialSelectedService.customName || ""}));
          }
          setSelectedServices([initialSelectedService]);
          setActiveAccordionItems([serviceTypeObj.value]); 
        }
      }
    }
  }, [client, getOriginalServiceValueKeyForClient]);

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);


  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const addNameField = () => setNames([...names, ""]);
  const removeNameField = (index: number) => {
    if (names.length > 1) setNames(names.filter((_, i) => i !== index));
    else setNames([""]); 
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...phones];
    newPhones[index] = value;
    setPhones(newPhones);
  };

  const addPhoneField = () => setPhones([...phones, ""]);
  const removePhoneField = (index: number) => {
    if (phones.length > 1) setPhones(phones.filter((_, i) => i !== index));
    else setPhones([""]); 
  };
  
  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  };

  const addAddressField = () => setAddresses([...addresses, ""]);
  const removeAddressField = (index: number) => {
    if (addresses.length > 1) setAddresses(addresses.filter((_, i) => i !== index));
    else setAddresses([""]);
  };
  
  const handleServiceSelectionChange = (
    serviceType: ClientServiceTypeT, 
    serviceDef: AppServiceDefinition, 
    checked: boolean
  ) => {
    setSelectedServices(prev => {
      let newSelected = [...prev];
      const existingServiceIndex = newSelected.findIndex(s => s.valueKey === serviceDef.value);

      if (checked) {
        if (existingServiceIndex === -1) { 
          const newService: SelectedServiceState = { type: serviceType, valueKey: serviceDef.value };
          if (serviceDef.isEditable) {
            newService.customName = customServiceInputs[serviceDef.value] || "";
          }
          newSelected.push(newService);
        }
      } else { 
        if (existingServiceIndex !== -1) { 
          newSelected.splice(existingServiceIndex, 1);
        }
        if (serviceDef.isEditable) {
           setCustomServiceInputs(currentInputs => {
            const updated = {...currentInputs};
            delete updated[serviceDef.value];
            return updated;
          });
        }
      }
      return newSelected;
    });
  };

  const handleCustomServiceInputChange = (serviceValueKey: string, value: string) => {
    setCustomServiceInputs(prev => ({ ...prev, [serviceValueKey]: value }));
    setSelectedServices(prevSelected => prevSelected.map(s => 
      s.valueKey === serviceValueKey ? { ...s, customName: value } : s
    ));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNames = names.map(n => n.trim()).filter(n => n !== "");
    if (finalNames.length === 0 || finalNames[0].trim() === "") {
      toast({ title: "Error", description: "Nama Klien (minimal 1) wajib diisi.", variant: "destructive" });
      return;
    }

    if (selectedServices.length === 0) {
      toast({ title: "Error", description: "Pilih setidaknya satu layanan.", variant: "destructive" });
      return;
    }
    
    let primarySelectedService: SelectedServiceState | undefined = undefined;
    
    // Prioritize based on accordion open state or first selected if none open match
    const openServiceTypeValues = activeAccordionItems;
    if (openServiceTypeValues.length > 0) {
        for (const typeValue of openServiceTypeValues) {
            const serviceType = typeValue as ClientServiceTypeT;
            primarySelectedService = selectedServices.find(s => s.type === serviceType);
            if (primarySelectedService) break;
        }
    }

    // If no service from open accordions is selected, or no accordions were active,
    // pick the first selected service overall.
    if (!primarySelectedService && selectedServices.length > 0) {
        primarySelectedService = selectedServices[0]; 
    }


    if (!primarySelectedService) {
        toast({ title: "Error", description: "Gagal menentukan layanan utama. Pastikan satu layanan terpilih.", variant: "destructive" });
        return;
    }

    const serviceTypeObj = SERVICE_TYPES.find(st => st.value === primarySelectedService!.type);
    const serviceDefToSave = serviceTypeObj?.services.find(s => s.value === primarySelectedService!.valueKey);

    if (!serviceDefToSave) {
        toast({ title: "Error", description: "Definisi layanan utama tidak ditemukan.", variant: "destructive" });
        return;
    }
    
    let finalServiceName = serviceDefToSave.label;
    let finalCustomName: string | undefined = undefined;

    if (serviceDefToSave.isEditable) {
      const customInput = customServiceInputs[serviceDefToSave.value] || "";
      if (!customInput.trim()) {
        toast({ title: "Error", description: `Detail untuk layanan "${serviceDefToSave.label}" harus diisi.`, variant: "destructive" });
        return;
      }
      finalServiceName = customInput.trim(); 
      finalCustomName = customInput.trim();
    }

    const serviceToSave: ClientService = {
      type: primarySelectedService!.type,
      name: finalServiceName,
    };
    if (finalCustomName) {
        serviceToSave.customName = finalCustomName;
    }
    
    const finalPhones = phones.map(p => p.trim()).filter(p => p !== "");
    const finalAddresses = addresses.map(a => a.trim()).filter(a => a !== "");

    onSave({
      id: client?.id,
      names: finalNames,
      phones: finalPhones.length > 0 ? finalPhones : undefined,
      addresses: finalAddresses.length > 0 ? finalAddresses : undefined,
      service: serviceToSave,
      serviceValueKey: primarySelectedService!.valueKey, 
    });
    setIsOpen(false);
  };
  
  const handleDialogOnOpenChange = React.useCallback((openStatus: boolean) => {
    setIsOpen(openStatus);
    if (openStatus) {
      resetForm();
    }
  }, [resetForm]);


  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOnOpenChange}>
      <DialogTrigger asChild>
        {triggerButton ? triggerButton : (
          <Button variant="default" size="sm" className="text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Klien Baru
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg">{client ? <>Edit Klien: <span className="font-semibold">{client.names[0]}</span></> : "Tambah Klien Baru"}</DialogTitle>
          <DialogDescription className="text-xs">
            {client ? "Ubah informasi klien dan layanan yang dibutuhkan." : "Isi detail klien baru dan pilih layanan yang dibutuhkan."}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[75vh] h-auto">
            <form onSubmit={handleSubmit} className="space-y-6 p-6 text-sm">
            
            {/* Informasi Klien Section */}
            <div className="p-4 border rounded-lg shadow-sm bg-card">
              <h3 className="text-base font-semibold mb-4 text-card-foreground">Informasi Klien</h3>
              <div className="space-y-4">
                {/* Nama Klien */}
                <div>
                    <Label className="text-xs font-medium mb-1 block text-foreground">Nama Klien <span className="text-destructive">*</span></Label>
                    {names.map((name, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <Input 
                                value={name} 
                                onChange={(e) => handleNameChange(index, e.target.value)} 
                                className="text-xs flex-grow h-9 bg-background text-foreground placeholder-muted-foreground" 
                                placeholder={index === 0 ? "Nama Klien 1" : `Nama Klien ${index + 1}`}
                            />
                            {names.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeNameField(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addNameField} className="text-xs h-8 px-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        <PlusCircle className="mr-1 h-3 w-3" /> Tambah Nama
                    </Button>
                </div>

                {/* Nomor Telepon & Alamat */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                        <Label className="text-xs font-medium mb-1 block text-foreground">Nomor Telepon</Label>
                        {phones.map((phone, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <Input 
                                    type="tel" 
                                    value={phone} 
                                    onChange={(e) => handlePhoneChange(index, e.target.value)} 
                                    className="text-xs flex-grow h-9 bg-background text-foreground placeholder-muted-foreground"
                                    placeholder={index === 0 ? "Telepon 1" : `Telepon ${index + 1}`}
                                />
                                {phones.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removePhoneField(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addPhoneField} className="text-xs h-8 px-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            <PlusCircle className="mr-1 h-3 w-3" /> Tambah Telepon
                        </Button>
                    </div>
                    <div>
                        <Label className="text-xs font-medium mb-1 block text-foreground">Alamat</Label>
                        {addresses.map((address, index) => (
                            <div key={index} className="flex items-start gap-2 mb-2">
                                <Textarea 
                                    value={address} 
                                    onChange={(e) => handleAddressChange(index, e.target.value)} 
                                    className="text-xs flex-grow min-h-[36px] bg-background text-foreground placeholder-muted-foreground"
                                    placeholder={index === 0 ? "Alamat 1" : `Alamat ${index + 1}`}
                                    rows={1} 
                                />
                                {addresses.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAddressField(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10 mt-0.5">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addAddressField} className="text-xs h-8 px-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            <PlusCircle className="mr-1 h-3 w-3" /> Tambah Alamat
                        </Button>
                    </div>
                </div>
              </div>
            </div>
            
            {/* Pilih Layanan Section */}
            <div className="p-4 border rounded-lg shadow-sm bg-card">
              <h3 className="text-base font-semibold mb-3 text-card-foreground">Pilih Layanan <span className="text-destructive">*</span></h3>
              <Accordion 
                  type="multiple" 
                  className="w-full" 
                  value={activeAccordionItems}
                  onValueChange={setActiveAccordionItems}
              >
                  {SERVICE_TYPES.map((serviceType) => (
                      <AccordionItem value={serviceType.value} key={serviceType.value} className="border-b-border last:border-b-0">
                          <AccordionTrigger className="text-sm py-3 hover:no-underline text-foreground hover:text-foreground/80 [&[data-state=open]>svg]:text-primary">
                              {serviceType.label}
                          </AccordionTrigger>
                          <AccordionContent className="bg-background/50">
                              <div className="space-y-1 pl-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-background">
                                  {serviceType.services.map((serviceDef) => (
                                      <div key={serviceDef.value} className="flex flex-col p-1 rounded-md hover:bg-muted/50">
                                          <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2 flex-grow">
                                                  <Checkbox
                                                      id={`${serviceType.value}-${serviceDef.value}`}
                                                      checked={selectedServices.some(s => s.valueKey === serviceDef.value)}
                                                      onCheckedChange={(checked) => handleServiceSelectionChange(serviceType.value, serviceDef, !!checked)}
                                                      className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus:ring-primary"
                                                  />
                                                  <Label
                                                      htmlFor={`${serviceType.value}-${serviceDef.value}`}
                                                      className="text-xs font-normal flex-grow cursor-pointer py-1.5 text-foreground"
                                                  >
                                                      {serviceDef.label}
                                                  </Label>
                                              </div>
                                              {serviceDef.isEditable && selectedServices.some(s => s.valueKey === serviceDef.value) && (
                                                  <Input
                                                      value={customServiceInputs[serviceDef.value] || ""}
                                                      onChange={(e) => handleCustomServiceInputChange(serviceDef.value, e.target.value)}
                                                      className="text-xs h-7 ml-2 flex-shrink w-2/5 bg-background text-foreground placeholder-muted-foreground"
                                                      placeholder={`Detail...`}
                                                  />
                                              )}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                  ))}
              </Accordion>
            </div>
            </form>
        </ScrollArea>
        <DialogFooter className="px-6 py-4 border-t mt-0 bg-background">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="text-xs">Batal</Button>
            <Button type="button" size="sm" onClick={handleSubmit} className="text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="mr-2 h-3.5 w-3.5" />
                Simpan Klien
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    