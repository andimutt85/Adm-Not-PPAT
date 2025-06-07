
import type { Metadata } from 'next';
// Removed Geist font imports
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";

// Removed Geist font definitions

export const metadata: Metadata = {
  title: 'KANTOR NOTARIS-PPAT ANDI MUTTAQIN',
  description: 'Sistem Manajemen Kantor Notaris dan PPAT Andi Muttaqin, S.H., M.Kn.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      {/* Removed Geist font variables from body className */}
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
