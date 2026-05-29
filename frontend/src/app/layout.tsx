import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HireFlow — AI Recruitment Platform',
  description: 'Autonomous multi-agent hiring pipeline',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
