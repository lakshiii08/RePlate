import React from 'react';
import RecipientRequestsView from '@/components/recipient/RecipientRequestsView';

export const metadata = {
  title: 'Intake Requests — RePlate',
  description: 'Request, accept food, and track approval status.',
};

export default function RecipientRequestsPage() {
  return <RecipientRequestsView />;
}
