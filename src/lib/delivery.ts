import zonesData from "@/data/delivery-zones.json";

interface ZoneArea {
  cities: string[];
  fee: number;
}

interface Zone {
  region: string;
  areas: {
    inner: ZoneArea;
    outer: ZoneArea;
  };
}

interface Rules {
  freeDeliveryAccra: number;
  freeDeliveryNationwide: number;
  heavyItemSurcharge: number;
  heavyItemIds: string[];
}

const zones = zonesData.zones as Zone[];
const rules = zonesData.rules as Rules;

interface CartItemForDelivery {
  id: string;
  price: number;
  qty: number;
}

/**
 * Calculate delivery fee in pesewas (GH₵1 = 100 pesewas).
 * Returns 0 for pickup or when free delivery thresholds are met.
 */
export function calculateDeliveryFee(
  region: string,
  city: string,
  items: CartItemForDelivery[],
  subtotalPesewas: number
): number {
  // Find the zone for the selected region
  const zone = zones.find(
    (z) => z.region.toLowerCase() === region.toLowerCase()
  );

  if (!zone) {
    // Default fee if region not found
    return 5000; // GH₵50 default
  }

  // Find fee based on city match
  let baseFee = 0;
  const cityLower = city.toLowerCase();

  // Check inner cities first
  const innerMatch = zone.areas.inner.cities.some(
    (c) => c.toLowerCase() === cityLower
  );
  if (innerMatch) {
    baseFee = zone.areas.inner.fee;
  } else {
    // Check outer cities or use outer fee as default
    baseFee = zone.areas.outer.fee;
  }

  // Convert to pesewas
  let feePesewas = baseFee * 100;

  // Apply free delivery rules
  const subtotalGhs = subtotalPesewas / 100;

  // Free delivery nationwide for orders above threshold
  if (subtotalGhs >= rules.freeDeliveryNationwide) {
    return 0;
  }

  // Free delivery within Greater Accra for orders above threshold
  if (
    zone.region === "Greater Accra" &&
    subtotalGhs >= rules.freeDeliveryAccra
  ) {
    return 0;
  }

  // Heavy item surcharge
  const hasHeavyItems = items.some((item) =>
    rules.heavyItemIds.includes(item.id)
  );
  if (hasHeavyItems) {
    feePesewas += rules.heavyItemSurcharge * 100;
  }

  return feePesewas;
}

/** Get all 16 Ghana region names */
export function getRegions(): string[] {
  return zones.map((z) => z.region);
}

/** Get cities for a given region (inner + outer combined) */
export function getCities(region: string): string[] {
  const zone = zones.find(
    (z) => z.region.toLowerCase() === region.toLowerCase()
  );
  if (!zone) return [];

  return [...zone.areas.inner.cities, ...zone.areas.outer.cities];
}
