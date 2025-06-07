
export type Role = "Notaris/PPAT" | "Staf";

export interface Staff {
  id: string;
  name: string;
  username: string;
  password?: string; 
}

export type ServiceType = "PPAT" | "NOTARIS";

export interface Service {
  type: ServiceType;
  name: string;
  customName?: string;
}

export interface ProcessChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface PaymentDetails {
  status: "Belum Bayar" | "DP" | "Lunas";
  dpAmount?: string;
}

export interface FileStatus {
  status: "Belum Diproses" | "Dalam Proses" | "Selesai - Belum Diambil" | "Selesai - Sudah Diambil";
  retrievedBy?: string;
  retrievalDate?: string;
}

export interface Client {
  id: string;
  names: string[];
  phones?: string[];
  addresses?: string[];
  service: Service;
  processChecklist: ProcessChecklistItem[];
  paymentDetails: PaymentDetails;
  fileStatus: FileStatus;
  notes?: string;
  createdAt: string;
}

// For settings page
export interface OfficeInfo {
  notarisName: string;
  notarisEmail: string;
  notarisUsername: string;
  notarisPassword?: string;
  notarisPersonalPhone?: string; // Added for Notary's personal/direct phone
  phone: string; // This will be for "Nomor Telepon Kantor"
  email: string;
  address: string;
}

export interface NotificationPrefs {
  notifAktivitasAkun: boolean;
  notifPembaruanProses: boolean;
  notifCatatanBaru: boolean;
}
