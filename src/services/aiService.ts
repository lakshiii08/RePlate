import { FoodCategory, StorageMethod, PackagingType, FeasibilityBreakdown } from '@/types';

export interface ParsedDonationResult {
  foodName: string;
  category: FoodCategory;
  quantity: string;
  mealCount: number;
  prepTime: string;
  packagingType: PackagingType;
  storageMethod: StorageMethod;
  allergens: string[];
  confidenceScore: number;
  extractedReasoning: string;
}

export const aiService = {
  async parseSurplusText(text: string): Promise<ParsedDonationResult> {
    // Simulate AI LLM latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lower = text.toLowerCase();
    
    // Default smart extraction defaults
    let foodName = 'Surplus Prepared Meals';
    let category: FoodCategory = 'Cooked Meal';
    let quantity = '40 meals';
    let mealCount = 40;
    let prepTime = '7:00 PM';
    let packagingType: PackagingType = 'sealed';
    let storageMethod: StorageMethod = 'hot_held';
    const allergens: string[] = [];

    // Extract quantity pattern e.g. "50 meals", "25 portions"
    const numberMatch = text.match(/(\d+)\s*(meals|portions|boxes|packed|loaves|kg|lbs)?/i);
    if (numberMatch) {
      const count = parseInt(numberMatch[1], 10);
      mealCount = count;
      quantity = `${count} ${numberMatch[2] || 'meals'}`;
    }

    // Extract Food Type
    if (lower.includes('paneer') || lower.includes('rice') || lower.includes('curry')) {
      foodName = 'Paneer Rice & Fresh Curry';
      category = 'Cooked Meal';
      allergens.push('Dairy');
    } else if (lower.includes('bread') || lower.includes('croissant') || lower.includes('bakery')) {
      foodName = 'Fresh Bakery Loaves & Pastries';
      category = 'Bakery & Bread';
      storageMethod = 'ambient';
      packagingType = 'covered';
      allergens.push('Gluten', 'Dairy');
    } else if (lower.includes('chicken') || lower.includes('meat') || lower.includes('steak')) {
      foodName = 'Herb Grilled Chicken & Protein Bowls';
      category = 'Cooked Meal';
      storageMethod = 'refrigerated';
      packagingType = 'individual_containers';
    } else if (lower.includes('salad') || lower.includes('fruit') || lower.includes('veggie')) {
      foodName = 'Garden Salad & Chilled Produce';
      category = 'Fresh Produce';
      storageMethod = 'refrigerated';
    } else if (lower.includes('sandwich') || lower.includes('wrap')) {
      foodName = 'Artisan Delicatessen Wraps & Sandwiches';
      category = 'Packaged Goods';
      storageMethod = 'refrigerated';
      allergens.push('Gluten');
    }

    // Extract timing
    const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (timeMatch) {
      prepTime = timeMatch[1].toUpperCase();
    }

    return {
      foodName,
      category,
      quantity,
      mealCount,
      prepTime,
      packagingType,
      storageMethod,
      allergens,
      confidenceScore: 0.94,
      extractedReasoning: 'Parsed quantity, food category, thermal storage parameters, and allergen flags from natural text with 94% confidence.',
    };
  },

  async generateExplainableMatchReason(
    shelterName: string,
    foodCategory: string,
    etaMinutes: number,
    capacity: number,
    rescueWindowMinutes: number
  ): Promise<FeasibilityBreakdown> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const overallScore = Math.min(98, Math.max(65, Math.floor(95 - (etaMinutes * 0.8) + (capacity > 50 ? 5 : 0))));
    
    return {
      overallScore,
      timeFeasibility: 96,
      capacityFit: capacity >= 50 ? 94 : 78,
      foodCompatibility: 98,
      distanceEta: etaMinutes <= 15 ? 92 : 75,
      needPriority: 95,
      driverReadiness: 91,
      explanation: `${shelterName} is currently requesting ${foodCategory}, has confirmed capacity for ${capacity} meals, and can be reached within ${etaMinutes} mins—leaving a ${rescueWindowMinutes - etaMinutes} minute safety buffer before expiration.`,
    };
  },

  async getRescueCopilotAlerts(
    rescueWindowMinutes: number,
    driverStatus: string
  ): Promise<string[]> {
    const alerts: string[] = [];
    if (rescueWindowMinutes < 30) {
      alerts.push('Rescue window critical (<30m). Dynamic route optimization active.');
    }
    if (driverStatus === 'DELAYED') {
      alerts.push('Driver position static for 5+ mins. Backup driver pre-notified.');
    }
    return alerts;
  }
};
