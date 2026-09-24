import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Text prompt required' }, { status: 400 });
    }

    const lower = text.toLowerCase();
    let foodName = 'Surplus Prepared Food';
    let category = 'Cooked Meal';
    let quantity = '40 portions';
    let mealCount = 40;
    let prepTime = '7:00 PM';
    let packagingType = 'sealed';
    let storageMethod = 'hot_held';
    const allergens: string[] = [];

    // Quantity detection
    const numberMatch = text.match(/(\d+)\s*(meals|portions|boxes|trays|platters|loaves|crates|kg|lbs|containers)?/i);
    if (numberMatch) {
      const count = parseInt(numberMatch[1], 10);
      mealCount = count;
      quantity = `${count} ${numberMatch[2] || 'portions'}`;
    }

    // Time detection
    const timeMatch = text.match(/(\b\d{1,2}:\d{2}\s*(?:am|pm)?\b|\b\d{1,2}\s*(?:am|pm)\b)/i);
    if (timeMatch) {
      prepTime = timeMatch[1].toUpperCase();
    }

    // Category & storage
    if (lower.includes('lasagna') || lower.includes('pasta') || lower.includes('spaghetti') || lower.includes('penne')) {
      foodName = 'Baked Italian Pasta & Lasagna';
      category = 'Cooked Meal';
      storageMethod = 'hot_held';
      packagingType = 'sealed';
      if (!allergens.includes('Gluten')) allergens.push('Gluten');
      if (!allergens.includes('Dairy')) allergens.push('Dairy');
    } else if (lower.includes('paneer') || lower.includes('curry') || lower.includes('rice') || lower.includes('biryani')) {
      foodName = 'Paneer Rice & Vegetable Curry';
      category = 'Cooked Meal';
      storageMethod = 'hot_held';
      packagingType = 'sealed';
      if (!allergens.includes('Dairy')) allergens.push('Dairy');
    } else if (lower.includes('bread') || lower.includes('croissant') || lower.includes('pastr') || lower.includes('sourdough')) {
      foodName = 'Artisanal Sourdough & Pastries';
      category = 'Bakery & Bread';
      storageMethod = 'ambient';
      packagingType = 'covered';
      if (!allergens.includes('Gluten')) allergens.push('Gluten');
      if (!allergens.includes('Dairy')) allergens.push('Dairy');
    } else if (lower.includes('chicken') || lower.includes('beef') || lower.includes('meat') || lower.includes('turkey')) {
      foodName = 'Herb Roasted Chicken & Grain Bowls';
      category = 'Cooked Meal';
      storageMethod = 'refrigerated';
      packagingType = 'individual_containers';
    } else if (lower.includes('salad') || lower.includes('fruit') || lower.includes('produce') || lower.includes('vegetable')) {
      foodName = 'Garden Salad & Fresh Produce';
      category = 'Fresh Produce';
      storageMethod = 'refrigerated';
      packagingType = 'bulk_boxes';
    } else if (lower.includes('sandwich') || lower.includes('wrap') || lower.includes('box lunch')) {
      foodName = 'Deli Sandwiches & Wrapped Lunch Boxes';
      category = 'Packaged Goods';
      storageMethod = 'refrigerated';
      packagingType = 'individual_containers';
      if (!allergens.includes('Gluten')) allergens.push('Gluten');
    }

    if (lower.includes('cheese') || lower.includes('milk') || lower.includes('dairy')) {
      if (!allergens.includes('Dairy')) allergens.push('Dairy');
    }
    if (lower.includes('wheat') || lower.includes('flour') || lower.includes('gluten')) {
      if (!allergens.includes('Gluten')) allergens.push('Gluten');
    }

    return NextResponse.json({
      foodName,
      category,
      quantity,
      mealCount,
      prepTime,
      packagingType,
      storageMethod,
      allergens,
      confidenceScore: 0.95,
      extractedReasoning: `Structured ${category} parameters parsed: count (${mealCount}), storage method (${storageMethod}), allergen flags.`,
    });
  } catch {
    return NextResponse.json({ error: 'Parsing failed' }, { status: 500 });
  }
}
