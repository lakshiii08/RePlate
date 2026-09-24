'use client';

import React, { useState } from 'react';
import AdminSidebar, { AdminTab } from '@/components/admin/AdminSidebar';
import CommandCenterView from '@/components/admin/CommandCenterView';
import LiveOperationsMapView from '@/components/admin/LiveOperationsMapView';
import CriticalRescuesView from '@/components/admin/CriticalRescuesView';
import RescueManagementView from '@/components/admin/RescueManagementView';
import DynamicRematchDemoView from '@/components/admin/DynamicRematchDemoView';
import SafetyReviewView from '@/components/admin/SafetyReviewView';
import RescueCopilotView from '@/components/admin/RescueCopilotView';
import UsersManagementView from '@/components/admin/UsersManagementView';
import ImpactDashboardView from '@/components/admin/ImpactDashboardView';
import { useRescue } from '@/context/RescueContext';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('command_center');
  const { donations } = useRescue();

  const criticalCount = donations.filter(
    (d) => d.urgencyLevel === 'critical' || d.status === 'RE_MATCHING'
  ).length || 2;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* SIDEBAR */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        criticalCount={criticalCount}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl">
        {/* Dynamic Section Renderer */}
        {activeTab === 'command_center' && <CommandCenterView />}
        {activeTab === 'live_operations' && <LiveOperationsMapView />}
        {activeTab === 'critical_rescues' && <CriticalRescuesView />}
        {activeTab === 'all_rescues' && <RescueManagementView />}
        {activeTab === 'safety_review' && <SafetyReviewView />}
        {activeTab === 'rescue_copilot' && <RescueCopilotView />}
        {activeTab === 'users' && <UsersManagementView />}
        {activeTab === 'impact' && <ImpactDashboardView />}
      </main>
    </div>
  );
}
