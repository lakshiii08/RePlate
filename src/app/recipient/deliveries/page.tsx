import React from 'react';
import RecipientDeliveriesView from '@/components/recipient/RecipientDeliveriesView';

export const metadata = {
  title: 'Track Deliveries — RePlate',
  description: 'Track incoming deliveries, courier status, and verify food intake.',
};

export default function RecipientDeliveriesPage() {
  return <RecipientDeliveriesView />;
}
