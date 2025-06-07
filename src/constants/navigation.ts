
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, FolderGit2, FileCheck2, Settings } from "lucide-react";
import type { ServiceType as AppServiceType } from "@/types"; // Renamed to avoid conflict

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  allowedRoles: ('Notaris/PPAT' | 'Staf')[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Ringkasan",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["Notaris/PPAT", "Staf"],
  },
  {
    label: "Klien",
    href: "/dashboard/clients",
    icon: Users,
    allowedRoles: ["Notaris/PPAT", "Staf"],
  },
  {
    label: "Proses",
    href: "/dashboard/processes",
    icon: FolderGit2,
    allowedRoles: ["Notaris/PPAT", "Staf"],
  },
  {
    label: "Berkas Selesai",
    href: "/dashboard/completed-files",
    icon: FileCheck2,
    allowedRoles: ["Notaris/PPAT", "Staf"],
  },
  {
    label: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
    allowedRoles: ["Notaris/PPAT", "Staf"],
  },
];

// --- Service Definitions ---
export const PPAT_SERVICES_RAW = [
  "Jual Beli", "Hibah", "Tukar Menukar", "Lelang", "APHB", "Warisan",
  "Pemecahan / Penggabungan Sertipikat", "Pembaharuan Hak / Permohonan Hak",
  "Peningkatan Hak", "Permohonan Sertipikat Hilang", "Permohonan TN", "Roya",
  "Penataan Batas", "Ralat Data", "Ganti Kelurahan", "Revisi / Pecah PBB",
  "Lain-lain PPAT"
];

export const NOTARIS_SERVICES_RAW = [
  "CV", "PT", "Firma", "Persekutuan Perdata", "Koperasi", "Yayasan", "Perkumpulan",
  "Sewa-Menyewa", "PPJB", "Kerjasama", "Kesepakatan", "Pembagian Warisan",
  "IMB (PBG) / HAKI", "Lain-lain Notaris"
];

interface ServiceDefinition {
  value: string; // unique key, e.g. "jual_beli"
  label: string; // display name, e.g. "Jual Beli"
  isEditable?: boolean;
}

interface ServiceType {
  value: AppServiceType;
  label: string;
  services: ServiceDefinition[];
}

const generateServiceDefinitions = (rawServices: string[], typePrefix: string): ServiceDefinition[] => {
  return rawServices.map(s => ({
    value: `${typePrefix}_${s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '')}`,
    label: s,
    isEditable: s.toLowerCase().startsWith("lain-lain"),
  }));
};

export const SERVICE_TYPES: ServiceType[] = [
  { value: "PPAT", label: "PPAT", services: generateServiceDefinitions(PPAT_SERVICES_RAW, "ppat") },
  { value: "NOTARIS", label: "NOTARIS", services: generateServiceDefinitions(NOTARIS_SERVICES_RAW, "notaris") },
];


// --- Checklist Definitions ---
export type ChecklistItemConstant = { id: string; label: string };
export type ServiceChecklists = Record<string, ChecklistItemConstant[]>; // Key is service value (e.g., "ppat_jual_beli")

const DEFAULT_PPAT_CHECKLIST: ChecklistItemConstant[] = [{ id: 'ppat_selesai', label: 'Selesai' }];
const DEFAULT_NOTARIS_CHECKLIST: ChecklistItemConstant[] = [{ id: 'notaris_selesai', label: 'Selesai' }];

export const PPAT_CHECKLISTS: ServiceChecklists = {
  ppat_jual_beli: [ { id: 'sppt_pbb', label: 'SPPT PBB' }, { id: 'nop', label: 'NOP' }, { id: 'bphtb_ssb', label: 'BPHTB / SSB' }, { id: 'ssp', label: 'SSP' }, { id: 'pengajuan_skb', label: 'Pengajuan SKB' }, { id: 'validasi_su_el', label: 'Validasi SU-el' }, { id: 'cek_sertifikat', label: 'Cek Sertifikat' }, { id: 'znt', label: 'ZNT' }, { id: 'bpn', label: 'BPN' }, { id: 'selesai', label: 'Selesai' } ],
  ppat_hibah: [ { id: 'sppt_pbb', label: 'SPPT PBB' }, { id: 'nop', label: 'NOP' }, { id: 'bphtb_ssb', label: 'BPHTB / SSB' }, { id: 'ssp', label: 'SSP' }, { id: 'pengajuan_skb', label: 'Pengajuan SKB' }, { id: 'validasi_su_el', label: 'Validasi SU-el' }, { id: 'cek_sertifikat', label: 'Cek Sertifikat' }, { id: 'znt', label: 'ZNT' }, { id: 'bpn', label: 'BPN' }, { id: 'selesai', label: 'Selesai' } ],
  ppat_tukar_menukar: [ { id: 'sppt_pbb', label: 'SPPT PBB' }, { id: 'nop', label: 'NOP' }, { id: 'bphtb_ssb', label: 'BPHTB / SSB' }, { id: 'ssp', label: 'SSP' }, { id: 'pengajuan_skb', label: 'Pengajuan SKB' }, { id: 'validasi_su_el', label: 'Validasi SU-el' }, { id: 'cek_sertifikat', label: 'Cek Sertifikat' }, { id: 'znt', label: 'ZNT' }, { id: 'bpn', label: 'BPN' }, { id: 'selesai', label: 'Selesai' } ],
  ppat_lelang: [ { id: 'sppt_pbb', label: 'SPPT PBB' }, { id: 'nop', label: 'NOP' }, { id: 'bphtb_ssb', label: 'BPHTB / SSB' }, { id: 'ssp', label: 'SSP' }, { id: 'pengajuan_skb', label: 'Pengajuan SKB' }, { id: 'validasi_su_el', label: 'Validasi SU-el' }, { id: 'cek_sertifikat', label: 'Cek Sertifikat' }, { id: 'znt', label: 'ZNT' }, { id: 'bpn', label: 'BPN' }, { id: 'selesai', label: 'Selesai' } ],
  ppat_aphb: [ { id: 'sppt_pbb', label: 'SPPT PBB' }, { id: 'nop', label: 'NOP' }, { id: 'bphtb_ssb', label: 'BPHTB / SSB' }, { id: 'ssp', label: 'SSP' }, { id: 'pengajuan_skb', label: 'Pengajuan SKB' }, { id: 'validasi_su_el', label: 'Validasi SU-el' }, { id: 'cek_sertifikat', label: 'Cek Sertifikat' }, { id: 'znt', label: 'ZNT' }, { id: 'bpn', label: 'BPN' }, { id: 'selesai', label: 'Selesai' } ],
  ppat_warisan: [ { id: 'sppt_pbb', label: 'SPPT PBB' }, { id: 'nop', label: 'NOP' }, { id: 'bphtb_ssb', label: 'BPHTB / SSB' }, { id: 'ssp', label: 'SSP' }, { id: 'pengajuan_skb', label: 'Pengajuan SKB' }, { id: 'validasi_su_el', label: 'Validasi SU-el' }, { id: 'cek_sertifikat', label: 'Cek Sertifikat' }, { id: 'znt', label: 'ZNT' }, { id: 'bpn', label: 'BPN' }, { id: 'selesai', label: 'Selesai' } ],
  ppat_pemecahan_sertipikat: [ { id: 'tapak_kapling', label: 'Tapak Kapling' }, { id: 'pengukuran', label: 'Pengukuran' }, { id: 'selesai', label: 'Selesai' } ], // Original name from user
  ppat_pembaharuan_hak_permohonan_hak: [ { id: 'pkkpr', label: 'PKKPR' }, { id: 'pelepasan_hak', label: 'Pelepasan Hak' }, { id: 'pengukuran', label: 'Pengukuran' }, { id: 'permohonan_skph', label: 'Permohonan SKPH' }, { id: 'ssb_bphtb', label: 'SSB / BPHTB' }, { id: 'permohonan_hat', label: 'Permohonan HAT' }, { id: 'selesai', label: 'Selesai' } ],
  ppat_permohonan_sertipikat_hilang: [ { id: 'pengukuran', label: 'Pengukuran' }, { id: 'sumpah', label: 'Sumpah' }, { id: 'pengumuman', label: 'Pengumuman' }, { id: 'selesai', label: 'Selesai' } ],
  ppat_pemecahan_penggabungan_sertipikat: [ { id: 'tapak_kapling_pgs', label: 'Tapak Kapling' }, { id: 'pengukuran_pemecahan_pgs', label: 'Pengukuran dan Pemecahan' }, { id: 'selesai_wa_placeholder', label: 'Selesai (WA Notif Placeholder)' } ], // WA placeholder
  // Defaults for other PPAT services not explicitly listed
  ppat_peningkatan_hak: DEFAULT_PPAT_CHECKLIST,
  ppat_permohonan_tn: DEFAULT_PPAT_CHECKLIST,
  ppat_roya: DEFAULT_PPAT_CHECKLIST,
  ppat_penataan_batas: DEFAULT_PPAT_CHECKLIST,
  ppat_ralat_data: DEFAULT_PPAT_CHECKLIST,
  ppat_ganti_kelurahan: DEFAULT_PPAT_CHECKLIST,
  ppat_revisi_pecah_pbb: DEFAULT_PPAT_CHECKLIST,
  ppat_lain_lain_ppat: DEFAULT_PPAT_CHECKLIST,
  default_ppat: DEFAULT_PPAT_CHECKLIST,
};

export const NOTARIS_CHECKLISTS: ServiceChecklists = {
  notaris_cv: [ { id: 'pesan_nama', label: 'Pesan Nama' }, { id: 'proses_pembuatan_akta', label: 'Proses Pembuatan Akta' }, { id: 'permohonan_sk_kemenkumham', label: 'Permohonan SK/SP/SKT Kemenkumham' }, { id: 'bnri_tbnri', label: 'BNRI-TBNRI' }, { id: 'npwp_badan', label: 'NPWP Badan' }, { id: 'oss_nib', label: 'OSS / NIB' }, { id: 'selesai', label: 'Selesai' } ],
  notaris_pt: [ { id: 'pesan_nama', label: 'Pesan Nama' }, { id: 'proses_pembuatan_akta', label: 'Proses Pembuatan Akta' }, { id: 'permohonan_sk_kemenkumham', label: 'Permohonan SK/SP/SKT Kemenkumham' }, { id: 'bnri_tbnri', label: 'BNRI-TBNRI' }, { id: 'npwp_badan', label: 'NPWP Badan' }, { id: 'oss_nib', label: 'OSS / NIB' }, { id: 'selesai', label: 'Selesai' } ],
  notaris_firma: [ { id: 'pesan_nama', label: 'Pesan Nama' }, { id: 'proses_pembuatan_akta', label: 'Proses Pembuatan Akta' }, { id: 'permohonan_sk_kemenkumham', label: 'Permohonan SK/SP/SKT Kemenkumham' }, { id: 'bnri_tbnri', label: 'BNRI-TBNRI' }, { id: 'npwp_badan', label: 'NPWP Badan' }, { id: 'oss_nib', label: 'OSS / NIB' }, { id: 'selesai', label: 'Selesai' } ],
  notaris_persekutuan_perdata: [ { id: 'pesan_nama', label: 'Pesan Nama' }, { id: 'proses_pembuatan_akta', label: 'Proses Pembuatan Akta' }, { id: 'permohonan_sk_kemenkumham', label: 'Permohonan SK/SP/SKT Kemenkumham' }, { id: 'bnri_tbnri', label: 'BNRI-TBNRI' }, { id: 'npwp_badan', label: 'NPWP Badan' }, { id: 'oss_nib', label: 'OSS / NIB' }, { id: 'selesai', label: 'Selesai' } ],
  notaris_koperasi: [ { id: 'pesan_nama', label: 'Pesan Nama' }, { id: 'proses_pembuatan_akta', label: 'Proses Pembuatan Akta' }, { id: 'permohonan_sk_kemenkumham', label: 'Permohonan SK/SP/SKT Kemenkumham' }, { id: 'bnri_tbnri', label: 'BNRI-TBNRI' }, { id: 'npwp_badan', label: 'NPWP Badan' }, { id: 'oss_nib', label: 'OSS / NIB' }, { id: 'selesai', label: 'Selesai' } ],
  notaris_yayasan: [ { id: 'pesan_nama', label: 'Pesan Nama' }, { id: 'proses_pembuatan_akta', label: 'Proses Pembuatan Akta' }, { id: 'permohonan_sk_kemenkumham', label: 'Permohonan SK/SP/SKT Kemenkumham' }, { id: 'bnri_tbnri', label: 'BNRI-TBNRI' }, { id: 'npwp_badan', label: 'NPWP Badan' }, { id: 'oss_nib', label: 'OSS / NIB' }, { id: 'selesai', label: 'Selesai' } ],
  notaris_perkumpulan: [ { id: 'pesan_nama', label: 'Pesan Nama' }, { id: 'proses_pembuatan_akta', label: 'Proses Pembuatan Akta' }, { id: 'permohonan_sk_kemenkumham', label: 'Permohonan SK/SP/SKT Kemenkumham' }, { id: 'bnri_tbnri', label: 'BNRI-TBNRI' }, { id: 'npwp_badan', label: 'NPWP Badan' }, { id: 'oss_nib', label: 'OSS / NIB' }, { id: 'selesai', label: 'Selesai' } ],
  notaris_imb_pbg_haki: [ { id: 'proses_pengerjaan', label: 'Proses Pengerjaan' }, { id: 'selesai', label: 'Selesai' } ],
  // Defaults for other Notaris services not explicitly listed
  notaris_sewa_menyewa: DEFAULT_NOTARIS_CHECKLIST,
  notaris_ppjb: DEFAULT_NOTARIS_CHECKLIST,
  notaris_kerjasama: DEFAULT_NOTARIS_CHECKLIST,
  notaris_kesepakatan: DEFAULT_NOTARIS_CHECKLIST,
  notaris_pembagian_warisan: DEFAULT_NOTARIS_CHECKLIST,
  notaris_lain_lain_notaris: DEFAULT_NOTARIS_CHECKLIST,
  default_notaris: DEFAULT_NOTARIS_CHECKLIST,
};


export function getChecklistForService(serviceType: AppServiceType, serviceValueKey: string): ChecklistItemConstant[] {
  // serviceValueKey is expected to be like "ppat_jual_beli" or "notaris_cv"
  if (serviceType === "PPAT") {
    return PPAT_CHECKLISTS[serviceValueKey] || PPAT_CHECKLISTS.default_ppat;
  }
  if (serviceType === "NOTARIS") {
    return NOTARIS_CHECKLISTS[serviceValueKey] || NOTARIS_CHECKLISTS.default_notaris;
  }
  return [];
}
