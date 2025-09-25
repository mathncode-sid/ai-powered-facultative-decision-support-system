import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubmissionProvider } from '@/contexts/SubmissionContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KRFDS - Kenya Re Facultative Decision Support System',
  description: 'AI-powered Facultative Reinsurance Decision Support System for Kenya Reinsurance Company',
  keywords: ['reinsurance', 'facultative', 'decision support', 'AI', 'Kenya Re'],
  authors: [{ name: 'Kenya Reinsurance Corporation' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#DC2626',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SubmissionProvider>
            {children}
            <Toaster />
          </SubmissionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}