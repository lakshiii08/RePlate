import { NextResponse } from 'next/server';
import { globalServerStore } from '@/lib/serverStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const donation = globalServerStore.donations.find((d) => d.id.toLowerCase() === id.toLowerCase());
  const category = donation?.category || 'Cooked Meal';
  const remainingMin = donation?.rescueWindowMinutes || 90;

  const scoredShelters = globalServerStore.shelters.map((shelter) => {
    const timeScore = Math.max(50, Math.min(99, Math.round(100 - shelter.etaMinutes * 1.2)));
    const capScore = shelter.capacityMeals >= (donation?.mealCount || 40) ? 96 : 72;
    const foodComp = shelter.currentNeeds.includes(category) ? 100 : 80;
    const overall = Math.round(timeScore * 0.4 + capScore * 0.3 + foodComp * 0.3);

    return {
      ...shelter,
      feasibilityScore: {
        overallScore: overall,
        timeFeasibility: timeScore,
        capacityFit: capScore,
        foodCompatibility: foodComp,
        distanceEta: Math.max(65, 100 - Math.round(shelter.distanceKm * 5)),
        needPriority: shelter.currentNeeds[0] === category ? 98 : 84,
        driverReadiness: 90,
        explanation: `${shelter.name} matches dietary demand for ${category} with confirmed intake capacity (${shelter.capacityMeals} portions), reachable in ${shelter.etaMinutes} mins with safe ${
          remainingMin - shelter.etaMinutes
        }m preservation cushion.`,
      },
    };
  });

  scoredShelters.sort((a, b) => (b.feasibilityScore?.overallScore || 0) - (a.feasibilityScore?.overallScore || 0));
  return NextResponse.json(scoredShelters);
}
