import React from 'react';
import RecipientSidebar from '@/components/recipient/RecipientSidebar';

export const metadata = {
  title: 'Recipient Portal — RePlate',
  description: 'Manage surplus food intake, requests, live deliveries, intake verification, and community impact.',
};

export default function RecipientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <RecipientSidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
