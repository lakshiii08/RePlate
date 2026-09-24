import { NextRequest, NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';

const monthKey = (date: Date) =>
  date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');

const matchesLocation = (
  item: { state: string; city: string },
  state: string | null,
  city: string | null
) =>
  (!state || item.state === state) &&
  (!city || item.city === city);

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get('state') || null;
  const city = request.nextUrl.searchParams.get('city') || null;
  const connectedPartners = globalServerStore.partners.filter(
    (partner) => partner.status === 'CONNECTED'
  );
  const selectedPartners = connectedPartners.filter((partner) =>
    matchesLocation(partner, state, city)
  );
  const selectedRecoveries = globalServerStore.recoveryHistory.filter((recovery) =>
    matchesLocation(recovery, state, city)
  );
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: monthKey(date),
      label: new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(date),
      meals: 0,
    };
  });

  selectedRecoveries.forEach((recovery) => {
    const entry = months.find(
      (month) => month.key === monthKey(new Date(recovery.completedAt))
    );
    if (entry) entry.meals += recovery.meals;
  });

  const locations = Array.from(
    new Map(
      [...connectedPartners, ...globalServerStore.recoveryHistory].map((item) => [
        item.state + '|' + item.city,
        { state: item.state, city: item.city },
      ])
    ).values()
  ).sort((a, b) =>
    a.state === b.state
      ? a.city.localeCompare(b.city)
      : a.state.localeCompare(b.state)
  );

  const regions = locations
    .filter((location) => matchesLocation(location, state, city))
    .map((location) => {
      const regionalPartners = connectedPartners.filter(
        (partner) =>
          partner.state === location.state && partner.city === location.city
      );
      const mealsSaved = globalServerStore.recoveryHistory
        .filter(
          (recovery) =>
            recovery.state === location.state && recovery.city === location.city
        )
        .reduce((total, recovery) => total + recovery.meals, 0);

      return {
        ...location,
        restaurants: regionalPartners.filter(
          (partner) => partner.kind === 'RESTAURANT'
        ).length,
        groceries: regionalPartners.filter((partner) => partner.kind === 'GROCERY')
          .length,
        ngos: regionalPartners.filter((partner) => partner.kind === 'NGO').length,
        mealsSaved,
      };
    })
    .sort((a, b) => b.mealsSaved - a.mealsSaved || a.city.localeCompare(b.city));

  return NextResponse.json({
    metrics: {
      restaurants: selectedPartners.filter((partner) => partner.kind === 'RESTAURANT')
        .length,
      groceries: selectedPartners.filter((partner) => partner.kind === 'GROCERY')
        .length,
      ngos: selectedPartners.filter((partner) => partner.kind === 'NGO').length,
      mealsSaved: months.reduce((total, month) => total + month.meals, 0),
    },
    monthlyFoodSaved: months,
    regions,
    locations,
    updatedAt: new Date().toISOString(),
  });
}
