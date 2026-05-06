import { ProductDef, PlanogramTemplate } from './types';

export const CATALOG_PRODUCTS: ProductDef[] = [
  {
    id: 'pepsi_can',
    name: 'Pepsi Can (330ml)',
    shortName: 'Pepsi',
    width_cm: 6.6,
    height_cm: 12.3,
    depth_cm: 6.6,
    primaryColor: '#003087',
    secondaryColor: '#E31837',
    type: 'product',
    price: 1.50,
  },
  {
    id: 'coke_can',
    name: 'Coke Can (330ml)',
    shortName: 'Coke',
    width_cm: 6.6,
    height_cm: 12.3,
    depth_cm: 6.6,
    primaryColor: '#E31837',
    secondaryColor: '#1A1A1A',
    type: 'product',
    price: 1.50,
  },
  {
    id: 'lays_chips',
    name: "Lay's Chips (Small)",
    shortName: "Lay's",
    width_cm: 14.0,
    height_cm: 20.0,
    depth_cm: 4.0,
    primaryColor: '#F5D300',
    secondaryColor: '#E31837',
    type: 'product',
    price: 3.00,
  },
  {
    id: 'arwa_water',
    name: 'Arwa Water (500ml)',
    shortName: 'Arwa',
    width_cm: 6.4,
    height_cm: 21.0,
    depth_cm: 6.4,
    primaryColor: '#0077BE',
    secondaryColor: '#00B4D8',
    type: 'product',
    price: 0.75,
  },
  {
    id: 'mocitos_can',
    name: 'Mocitos Fruit Cocktail (820g)',
    shortName: 'Mocitos',
    width_cm: 10.2,
    height_cm: 11.4,
    depth_cm: 10.2,
    primaryColor: '#5a9e4a',
    secondaryColor: '#1b4d1a',
    type: 'product',
    price: 4.50,
  },
];

export const CATALOG_POS: ProductDef[] = [
  {
    id: 'promo_banner',
    name: 'Promotional Banner',
    shortName: 'Banner',
    width_cm: 30,
    height_cm: 5,
    depth_cm: 0.1,
    primaryColor: '#FF6B35',
    secondaryColor: '#FFFFFF',
    type: 'pos',
    posType: 'banner',
  },
  {
    id: 'price_tag',
    name: 'Price Tag',
    shortName: 'Price',
    width_cm: 5,
    height_cm: 3,
    depth_cm: 0.1,
    primaryColor: '#FFFFFF',
    secondaryColor: '#E31837',
    type: 'pos',
    posType: 'price-tag',
  },
];

export const ALL_PRODUCTS: ProductDef[] = [...CATALOG_PRODUCTS, ...CATALOG_POS];

export const BUILTIN_TEMPLATES: PlanogramTemplate[] = [
  {
    name: 'Small Grocery Rack',
    shelves: [
      { width_cm: 60, height_cm: 35, depth_cm: 40 },
      { width_cm: 60, height_cm: 35, depth_cm: 40 },
    ],
  },
  {
    name: 'Large Hypermarket Unit',
    shelves: [
      { width_cm: 120, height_cm: 50, depth_cm: 60 },
      { width_cm: 120, height_cm: 50, depth_cm: 60 },
      { width_cm: 120, height_cm: 50, depth_cm: 60 },
      { width_cm: 120, height_cm: 45, depth_cm: 60 },
    ],
  },
  {
    name: 'Standard Convenience',
    shelves: [
      { width_cm: 80, height_cm: 40, depth_cm: 60 },
      { width_cm: 80, height_cm: 40, depth_cm: 60 },
      { width_cm: 80, height_cm: 40, depth_cm: 60 },
    ],
  },
];
