'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NetworkOverviewView from '@/components/admin/NetworkOverviewView';
import AdminProvidersView from '@/components/admin/AdminProvidersView';
import AdminDriversView from '@/components/admin/AdminDriversView';
import AdminDeliveriesView from '@/components/admin/AdminDeliveriesView';
import AdminAlertsView from '@/components/admin/AdminAlertsView';
import AdminReportsView from '@/components/admin/AdminReportsView';
import AdminSettingsView from '@/components/admin/AdminSettingsView';
import MonthlyFoodSavedGraphView from '@/components/admin/MonthlyFoodSavedGraphView';
import CityStateMatrixView from '@/components/admin/CityStateMatrixView';
import ConnectedNGOsView from '@/components/admin/ConnectedNGOsView';
import ComplaintsQueueView from '@/components/admin/ComplaintsQueueView';
import SafetyReviewView from '@/components/admin/SafetyReviewView';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  if (tab === 'providers') return <AdminProvidersView />;
  if (tab === 'drivers') return <AdminDriversView />;
  if (tab === 'deliveries') return <AdminDeliveriesView />;
  if (tab === 'alerts') return <AdminAlertsView />;
  if (tab === 'reports') return <AdminReportsView />;
  if (tab === 'settings') return <AdminSettingsView />;
  if (tab === 'food_saved_analytics' || tab === 'monthly-recovered') return <MonthlyFoodSavedGraphView />;
  if (tab === 'city_state_matrix' || tab === 'city-state-matrix') return <CityStateMatrixView />;
  if (tab === 'connected_ngos' || tab === 'ngos') return <ConnectedNGOsView />;
  if (tab === 'complaints_desk' || tab === 'complaints') return <ComplaintsQueueView />;
  if (tab === 'safety_audit') return <SafetyReviewView />;

  return <NetworkOverviewView />;
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading admin workspace...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
