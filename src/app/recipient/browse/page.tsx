import React from 'react';
import RecipientBrowseFoodView from '@/components/recipient/RecipientBrowseFoodView';

export const metadata = {
  title: 'Browse Available Food — RePlate',
  description: 'See nearby available surplus food from restaurants, hotels, and bakeries.',
};

export default function RecipientBrowsePage() {
  return <RecipientBrowseFoodView />;
}
