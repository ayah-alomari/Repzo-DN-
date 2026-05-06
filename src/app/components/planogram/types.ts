export const SCALE = 7; // 1 cm = 7px
export const DRAG_TYPE = 'PLANOGRAM_ITEM';
export const SHELF_BOARD_H = 14; // shelf board thickness in px
export const DEPTH_PANEL_H = 10; // depth shadow height in px

export type StandType = 'wall' | 'cooler' | 'fsdu';

export interface ProductDef {
  id: string;
  name: string;
  shortName: string;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  primaryColor: string;
  secondaryColor: string;
  type: 'product' | 'pos';
  posType?: 'banner' | 'price-tag';
  price?: number; // retail price in SAR
}

export interface PlacedItem {
  instanceId: string;
  productId: string;
  position_x: number;       // cm from left edge
  facing_count: number;     // columns (horizontal repetitions)
  depth_count: number;      // rows behind (depth)
  vertical_facings?: number; // rows stacked on top of each other (default 1)
  width_percent?: number;   // for POS banners spanning full shelf width
}

export interface ShelfData {
  id: number;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  items: PlacedItem[];
}

export interface PlanogramTemplate {
  name: string;
  shelves: Array<{ width_cm: number; height_cm: number; depth_cm: number }>;
}

/** A user-saved planogram stored in the templates list */
export interface SavedPlanogram {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  shelves: ShelfData[];
  gondolaWidthCm: number;
  ignoreFacing: boolean;   // exclude facing % from compliance score
  ignorePosition: boolean; // exclude position % from compliance score
  ignorePriceTags: boolean;
  ignoreShelfTalker: boolean;
  standType: StandType;    // wall | cooler | fsdu
}
