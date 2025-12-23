import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Purchasing Manager Helper',
  description: 'Maritime purchasing assistant - RFQ drafting, quotation extraction, vendor recommendations, compliance checking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
