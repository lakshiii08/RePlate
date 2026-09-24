import { NextResponse } from 'next/server';
import { globalServerStore, getImpactMetrics } from '@/lib/serverStore';

export async function GET() {
  const activeRescues = globalServerStore.donations.filter(
    (d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED'
  );
  const criticalRescues = globalServerStore.donations.filter(
    (d) => d.urgencyLevel === 'critical' || d.status === 'RE_MATCHING'
  );
  const availableDrivers = globalServerStore.drivers.filter((d) => d.status === 'AVAILABLE');
  const pendingDonations = globalServerStore.donations.filter(
    (d) => d.status === 'POSTED' || d.status === 'VERIFIED'
  );
  const completedDeliveries = globalServerStore.donations.filter((d) => d.status === 'DELIVERED');

  return NextResponse.json({
    metrics: {
      activeRescuesCount: activeRescues.length,
      criticalRescuesCount: criticalRescues.length,
      availableDriversCount: availableDrivers.length,
      pendingDonationsCount: pendingDonations.length,
      completedDeliveriesCount: completedDeliveries.length,
    },
    impact: getImpactMetrics(),
    recentActive: activeRescues.slice(0, 5),
  });
}
