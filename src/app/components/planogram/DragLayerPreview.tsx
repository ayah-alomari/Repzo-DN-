import { useDragLayer } from 'react-dnd';
import { DRAG_TYPE, SCALE } from './types';
import { ALL_PRODUCTS } from './catalogData';
import { ProductFace } from './ProductFace';

/**
 * Renders the actual product face at the cursor position during drag.
 * Replaces the browser's default ghost image (which shows the catalog card).
 * Must be rendered inside the DndProvider.
 */
export function DragLayerPreview() {
  const { isDragging, item, offset } = useDragLayer(m => ({
    isDragging: m.isDragging(),
    item: m.getItem() as { productId: string } | null,
    offset: m.getClientOffset(),
  }));

  if (!isDragging || !item || !offset) return null;
  const product = ALL_PRODUCTS.find(p => p.id === item.productId);
  if (!product) return null;

  const w = Math.round(product.width_cm * SCALE);
  const h = Math.round(product.height_cm * SCALE);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 9999,
    }}>
      <div style={{
        position: 'absolute',
        left: offset.x - w / 2,
        top: offset.y - h / 2,
        width: w,
        height: h,
        opacity: 0.88,
        filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.42)) drop-shadow(0 2px 6px rgba(0,0,0,0.28))',
      }}>
        <ProductFace productId={product.id} w={w} h={h} />
      </div>
    </div>
  );
}
