import React from 'react';
import RecipientDashboardView from '@/components/recipient/RecipientDashboardView';

export const metadata = {
  title: 'Recipient Dashboard — RePlate',
  description: 'Monitor food available, active requests, and upcoming deliveries.',
};

export default function RecipientDashboardPage() {
  return <RecipientDashboardView />;
}
