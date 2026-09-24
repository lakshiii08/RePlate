import React from 'react';
import RecipientHistoryView from '@/components/recipient/RecipientHistoryView';

export const metadata = {
  title: 'Intake History — RePlate',
  description: 'Previous surplus food received and intake slips.',
};

export default function RecipientHistoryPage() {
  return <RecipientHistoryView />;
}
