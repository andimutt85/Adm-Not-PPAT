
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Hourglass, FileCheck2, CheckCircle2, Download } from "lucide-react"; // Added Download
import Link from "next/link";
import type { Client } from "@/types"; 
import { useClientData } from "@/context/ClientDataContext";
import { Button } from "@/components/ui/button"; // Added Button
import jsPDF from 'jspdf'; // Added jsPDF
import 'jspdf-autotable'; // Added jspdf-autotable
import { format } from "date-fns"; // Added date-fns
import { id as localeID } from "date-fns/locale"; // Added locale for date formatting

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  href?: string;
}

function SummaryCard({ title, value, icon: Icon, description, href }: SummaryCardProps) {
  const cardContent = (
    <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block h-full">{cardContent}</Link>;
  }
  return cardContent;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export default function DashboardPage() {
  const { clients } = useClientData(); 

  const totalClients = clients.length;
  const clientsInProcess = clients.filter(c => c.fileStatus.status === "Dalam Proses" || c.fileStatus.status === "Belum Diproses").length;
  const clientsCompletedNotTaken = clients.filter(c => c.fileStatus.status === "Selesai - Belum Diambil").length;
  const clientsCompletedTaken = clients.filter(c => c.fileStatus.status === "Selesai - Sudah Diambil").length;

  const summaryData = [
    { title: "Total Klien Terdaftar", value: totalClients, icon: Users, description: "Jumlah semua klien", href: "/dashboard/clients" },
    { title: "Berkas Dalam Proses", value: clientsInProcess, icon: Hourglass, description: "Klien dengan berkas aktif", href: "/dashboard/processes" },
    { title: "Selesai (Belum Diambil)", value: clientsCompletedNotTaken, icon: FileCheck2, description: "Berkas siap untuk klien", href: "/dashboard/completed-files" },
    { title: "Selesai (Sudah Diambil)", value: clientsCompletedTaken, icon: CheckCircle2, description: "Berkas yang telah diserahkan", href: "/dashboard/completed-files" },
  ];

  const recentActivities = clients
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3) 
    .map(client => ({
      id: client.id,
      text: `Klien baru ditambahkan: ${client.names[0]} (${client.service.name})`,
      date: new Date(client.createdAt).toLocaleDateString('id-ID'),
    }));

  const generateAdminReportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    }) as jsPDFWithAutoTable;

    const titleText1 = "RINGKASAN ADMINISTRASI KANTOR NOTARIS-PPAT";
    const titleText2 = "ANDI MUTTAQIN, S.H., M.Kn.";
    const titleFontSize1 = 14;
    const titleFontSize2 = 12;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(titleFontSize1);
    doc.text(titleText1, pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(titleFontSize2);
    doc.text(titleText2, pageWidth / 2, 60, { align: 'center' });

    const tableColumn = ["NO", "NAMA KLIEN", "ALAMAT", "NOMOR HP", "BERKAS MASUK (INPUT)", "LAYANAN", "STATUS PROSES", "SUDAH DIAMBIL/BELUM", "TANGGAL PENGAMBILAN"];
    const tableRows: (string | number)[][] = [];

    clients.forEach((client, index) => {
      const clientData = [
        index + 1,
        client.names.join(", "),
        client.addresses && client.addresses.length > 0 ? client.addresses.join("; ") : "-",
        client.phones && client.phones.length > 0 ? client.phones.join(", ") : "-",
        format(new Date(client.createdAt), "dd/MM/yy", { locale: localeID }),
        `${client.service.type} - ${client.service.name}${client.service.customName && client.service.name !== client.service.customName ? ` (${client.service.customName})` : ""}`,
        client.fileStatus.status,
        client.fileStatus.status === "Selesai - Sudah Diambil" ? "Sudah" : (client.fileStatus.status === "Selesai - Belum Diambil" ? "Belum" : "-"),
        client.fileStatus.retrievalDate ? format(new Date(client.fileStatus.retrievalDate), "dd/MM/yy HH:mm", { locale: localeID }) : "-",
      ];
      tableRows.push(clientData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [220, 220, 220], // Light gray for header
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' }, // NO
        1: { cellWidth: 'auto' }, // NAMA KLIEN
        2: { cellWidth: 'auto' }, // ALAMAT
        3: { cellWidth: 60 }, // NOMOR HP
        4: { cellWidth: 50, halign: 'center' }, // BERKAS MASUK
        5: { cellWidth: 'auto' }, // LAYANAN
        6: { cellWidth: 70 }, // STATUS PROSES
        7: { cellWidth: 50, halign: 'center' }, // SUDAH/BELUM
        8: { cellWidth: 60, halign: 'center' }, // TGL PENGAMBILAN
      },
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      pageBreak: 'auto',
      tableWidth: 'auto',
    });
    
    const date = new Date();
    doc.save(`Laporan_Administrasi_Notaris_${format(date, "yyyy-MM-dd")}.pdf`);
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-xl font-semibold">Ringkasan Dashboard</h1>
        <Button onClick={generateAdminReportPDF} size="sm" variant="outline" className="mt-4 sm:mt-0 text-xs">
          <Download className="mr-2 h-4 w-4" />
          Unduh Laporan Administrasi (PDF)
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((data) => (
          <SummaryCard key={data.title} {...data} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Aktivitas Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <ul className="space-y-3 text-xs">
                {recentActivities.map(activity => (
                  <li key={activity.id}>
                    <span className="font-semibold">{activity.text}</span> - <span className="text-muted-foreground">{activity.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">Tidak ada aktivitas baru.</p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Pengingat & Tugas (Contoh)</CardTitle>
          </CardHeader>
          <CardContent>
             <ul className="space-y-3 text-xs">
              <li className="text-muted-foreground">Tidak ada pengingat mendesak saat ini.</li>
              {clientsCompletedNotTaken > 0 && (
                <li className="text-primary">
                  Ada {clientsCompletedNotTaken} berkas selesai yang belum diambil klien. <Link href="/dashboard/completed-files" className="underline">Lihat detail</Link>.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

