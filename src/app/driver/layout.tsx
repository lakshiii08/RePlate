import React from 'react';
import DriverSidebar from '@/components/driver/DriverSidebar';

export const metadata = {
  title: 'Courier Logistics Portal — RePlate',
  description: 'Manage active deliveries, route turn-by-turn navigation, dispatch alerts, and verified food handovers.',
};

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DriverSidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
