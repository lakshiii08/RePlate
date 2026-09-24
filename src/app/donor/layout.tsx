import React from 'react';
import DonorSidebar from '@/components/donor/DonorSidebar';

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Donor Sidebar */}
      <DonorSidebar />

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
