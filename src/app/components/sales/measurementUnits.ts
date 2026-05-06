export interface MeasurementUnit {
  id: string;
  name: string;
  factor: number; // how many base units this unit contains
}

export interface MeasurementFamily {
  id: string;
  name: string;
  units: MeasurementUnit[];
}

export const MEASUREMENT_FAMILIES: Record<string, MeasurementFamily> = {
  count: {
    id: "count",
    name: "Count",
    units: [
      { id: "piece", name: "Piece", factor: 1 },
      { id: "box", name: "Box", factor: 6 },
      { id: "dozen", name: "Dozen", factor: 12 },
      { id: "carton", name: "Carton", factor: 24 },
    ],
  },
  weight: {
    id: "weight",
    name: "Weight",
    units: [
      { id: "gram", name: "Gram", factor: 1 },
      { id: "kg", name: "KG", factor: 1000 },
    ],
  },
};

/** Maps product id → family id */
export const PRODUCT_FAMILY_MAP: Record<string, string> = {
  itm1: "count",
  itm2: "count",
};

export function getProductFamily(productId: string): MeasurementFamily | null {
  const familyId = PRODUCT_FAMILY_MAP[productId];
  return familyId ? (MEASUREMENT_FAMILIES[familyId] ?? null) : null;
}

export function getUnitFactor(unitName: string, family: MeasurementFamily): number {
  return family.units.find(u => u.name === unitName)?.factor ?? 1;
}

export function getBaseUnit(family: MeasurementFamily): MeasurementUnit {
  return family.units.find(u => u.factor === 1) ?? family.units[0];
}

/** Convert qty in a given unit to base units */
export function toBase(qty: number, unitName: string, family: MeasurementFamily): number {
  return qty * getUnitFactor(unitName, family);
}

/** Convert base-unit qty to display qty in a given unit */
export function fromBase(baseQty: number, unitName: string, family: MeasurementFamily): number {
  const factor = getUnitFactor(unitName, family);
  return factor > 0 ? baseQty / factor : baseQty;
}
