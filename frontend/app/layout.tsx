import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Voltz - AI-Powered Event Networking',
  description:
    'Intelligent event connections using AI-powered verified matching on 0G Infrastructure. Make meaningful connections at conferences and hackathons.',
  keywords: ['networking', 'events', 'AI', 'blockchain', 'Web3', 'XMTP', 'vlayer'],
  authors: [{ name: 'Voltz' }],
  openGraph: {
    title: 'Voltz - AI-Powered Event Networking',
    description:
      'Make meaningful connections at events using AI and blockchain technology.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
