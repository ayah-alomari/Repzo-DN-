import { useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Package, Tag } from 'lucide-react';
import { CATALOG_PRODUCTS, CATALOG_POS } from './catalogData';
import { ProductDef, DRAG_TYPE, SCALE } from './types';
import { ProductFace } from './ProductFace';

function DraggableItem({ product }: { product: ProductDef }) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: DRAG_TYPE,
    item: { productId: product.id },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  // Suppress the browser's default ghost image — DragLayerPreview renders
  // the real product shape at the cursor instead.
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const w = Math.round(product.width_cm * SCALE);
  const h = Math.round(product.height_cm * SCALE);
  // Cap display size in catalog card
  const scale = Math.min(1, 52 / w, 68 / h);
  const displayW = Math.round(w * scale);
  const displayH = Math.round(h * scale);

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 9,
        border: '1.5px solid #e8e8ec',
        background: 'white',
        cursor: 'grab',
        opacity: isDragging ? 0.35 : 1,
        transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.15s',
        userSelect: 'none',
      }}
      className="hover:border-[#4f6ef7] hover:shadow-sm active:cursor-grabbing"
    >
      {/* Product face at scaled size */}
      <div style={{
        width: 52,
        height: 68,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f8f8fa 0%, #f0f0f4 100%)',
        borderRadius: 6,
        padding: '4px 4px 2px',
        border: '1px solid #eee',
      }}>
        <ProductFace productId={product.id} w={displayW} h={displayH} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
          {product.name}
        </div>
        <div style={{ fontSize: 10, color: '#8b8b9e', marginTop: 3 }}>
          {product.width_cm} × {product.height_cm} cm
        </div>
        {product.depth_cm > 0 && product.type === 'product' && (
          <div style={{
            marginTop: 4, display: 'inline-block',
            fontSize: 9, fontWeight: 600, color: '#4f6ef7',
            background: '#f0f2ff', padding: '1px 6px', borderRadius: 8,
          }}>
            D: {product.depth_cm} cm
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductCatalog() {
  const [activeTab, setActiveTab] = useState<'products' | 'pos'>('products');
  const items = activeTab === 'products' ? CATALOG_PRODUCTS : CATALOG_POS;

  return (
    <div style={{
      width: 240,
      minWidth: 240,
      height: '100%',
      background: 'white',
      borderRight: '1px solid #e8e8ec',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid #e8e8ec' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
          Item Catalog
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: '#f5f5f7', borderRadius: 8, padding: 4,
        }}>
          {(['products', 'pos'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 5, padding: '5px 0', borderRadius: 6, border: 'none',
                fontSize: 12, cursor: 'pointer', transition: 'all 0.12s',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#1a1a2e' : '#6a6a7a',
                fontWeight: activeTab === tab ? 600 : 400,
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab === 'products' ? <Package size={12} /> : <Tag size={12} />}
              {tab === 'products' ? 'Products' : 'POS'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '8px 12px 4px' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#a0a0b0',
          textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Drag onto shelf
        </span>
      </div>

      {/* Catalog items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 16px',
        display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(product => (
          <DraggableItem key={product.id} product={product} />
        ))}
      </div>

      {/* Footer hint */}
      <div style={{
        padding: '8px 12px 10px', borderTop: '1px solid #e8e8ec',
        background: '#fafafa',
      }}>
        <p style={{ fontSize: 10, color: '#b0b0c0', lineHeight: 1.5, margin: 0 }}>
          Drag to place · Click placed product to adjust facings · Hover to remove
        </p>
      </div>
    </div>
  );
}
