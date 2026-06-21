import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import SplashOverlay from '@/components/layout/SplashOverlay';

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets:  ['devanagari'],
  variable: '--font-noto-devanagari',
  weight:   ['400', '500', '600', '700'],
  display:  'swap',
});

export const metadata: Metadata = {
  title: {
    default:  'NRSC Smart Leave Management System',
    template: '%s — NRSC SLMS',
  },
  description:
    'Digital Leave Management System for ISRO – National Remote Sensing Centre (NRSC). Submit, track, and manage leave applications securely.',
  robots:      { index: false, follow: false },
};

export const viewport = {
  themeColor:   '#0B3C6D',
  width:        'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={`${inter.variable} ${notoDevanagari.variable}`}>
      <body className="antialiased bg-bg text-text-primary">
        <Providers>
          <SplashOverlay />
          {children}
        </Providers>
      </body>
    </html>
  );
}
