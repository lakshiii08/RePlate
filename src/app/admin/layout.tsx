import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Enterprise Admin Sidebar */}
      <AdminSidebar />

      {/* Dynamic View Workspace */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
