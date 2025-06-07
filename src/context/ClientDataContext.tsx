
'use client';

import type { Client, PaymentDetails, FileStatus } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getChecklistForService } from "@/constants/navigation";

interface ClientDataContextType {
  clients: Client[];
  addClient: (clientData: Omit<Client, "id" | "createdAt" | "processChecklist" | "paymentDetails" | "fileStatus" | "notes"> & { serviceValueKey: string }) => void;
  updateClient: (updatedClient: Client) => void;
  deleteClient: (clientId: string) => void;
  getClientById: (clientId: string) => Client | undefined;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>; // Added for backup/restore
}

const ClientDataContext = createContext<ClientDataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'notarisAppClients';

export const ClientDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window !== 'undefined') {
      const storedClients = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedClients) {
        try {
          return JSON.parse(storedClients);
        } catch (e) {
          console.error("Failed to parse clients from localStorage", e);
          return [];
        }
      }
    }
    return []; 
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clients));
    }
  }, [clients]);

  const addClient = useCallback((clientData: Omit<Client, "id" | "createdAt" | "processChecklist" | "paymentDetails" | "fileStatus" | "notes"> & { serviceValueKey: string }) => {
    const newProcessChecklist = getChecklistForService(clientData.service.type, clientData.serviceValueKey).map(item => ({ ...item, checked: false }));
    const defaultPaymentDetails: PaymentDetails = { status: "Belum Bayar" };
    const defaultFileStatus: FileStatus = { status: "Belum Diproses" };

    const newClient: Client = {
      names: clientData.names,
      phones: clientData.phones,
      addresses: clientData.addresses,
      service: clientData.service,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      processChecklist: newProcessChecklist,
      paymentDetails: defaultPaymentDetails,
      fileStatus: defaultFileStatus,
      notes: "", 
    };
    setClients(prevClients => [newClient, ...prevClients]);
  }, []);

  const updateClient = useCallback((updatedClient: Client) => {
    setClients(prevClients =>
      prevClients.map(c => (c.id === updatedClient.id ? updatedClient : c))
    );
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    setClients(prevClients => prevClients.filter(c => c.id !== clientId));
  }, []);

  const getClientById = useCallback((clientId: string) => {
    return clients.find(c => c.id === clientId);
  }, [clients]);

  return (
    <ClientDataContext.Provider value={{ clients, addClient, updateClient, deleteClient, getClientById, setClients }}>
      {children}
    </ClientDataContext.Provider>
  );
};

export const useClientData = () => {
  const context = useContext(ClientDataContext);
  if (context === undefined) {
    throw new Error('useClientData must be used within a ClientDataProvider');
  }
  return context;
};
