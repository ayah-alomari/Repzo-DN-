import { useRef, useState, useCallback, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Minus, Plus, X, Trash2, Move } from 'lucide-react';
import { ShelfData, PlacedItem, DRAG_TYPE, SCALE, SHELF_BOARD_H, DEPTH_PANEL_H } from './types';
import { ALL_PRODUCTS } from './catalogData';
import { ProductFace } from './ProductFace';

// ── Drag payload shared between catalog drag and placed-item drag ────────────
interface DragPayload {
  productId: string;
  // Present only when repositioning an already-placed item
  sourceInstanceId?: string;
  sourceShelfId?: number;
  facing_count?: number;
  depth_count?: number;
  width_percent?: number;
}

// ── Architect dimension lines ────────────────────────────────────────────────
function WidthDimLine({ width_cm, scale }: { width_cm: number; scale: number }) {
  const W = width_cm * scale;
  const CX = W / 2;
  return (
    <svg style={{ position: 'absolute', top: -52, left: 0, width: W, height: 52,
      overflow: 'visible', pointerEvents: 'none' }}>
      <line x1={0} y1={40} x2={W} y2={40} stroke="#4f6ef7" strokeWidth={1.2} />
      <line x1={0} y1={29} x2={0} y2={51} stroke="#4f6ef7" strokeWidth={1.5} />
      <line x1={W} y1={29} x2={W} y2={51} stroke="#4f6ef7" strokeWidth={1.5} />
      <polygon points={`0,40 11,34 11,46`} fill="#4f6ef7" />
      <polygon points={`${W},40 ${W - 11},34 ${W - 11},46`} fill="#4f6ef7" />
      <rect x={CX - 33} y={21} width={66} height={22} fill="white" rx={4} stroke="#4f6ef7" strokeWidth={1} />
      <text x={CX} y={36} textAnchor="middle" fill="#4f6ef7" fontSize={12}
        fontFamily="system-ui" fontWeight="700">{width_cm} cm</text>
    </svg>
  );
}

function HeightDimLine({ height_cm, shelfW, scale }: { height_cm: number; shelfW: number; scale: number }) {
  const H = height_cm * scale;
  const CY = H / 2;
  return (
    <svg style={{ position: 'absolute', top: 0, left: shelfW + 6, width: 60, height: H,
      overflow: 'visible', pointerEvents: 'none' }}>
      <line x1={20} y1={0} x2={20} y2={H} stroke="#4f6ef7" strokeWidth={1.2} />
      <line x1={9} y1={0} x2={31} y2={0} stroke="#4f6ef7" strokeWidth={1.5} />
      <line x1={9} y1={H} x2={31} y2={H} stroke="#4f6ef7" strokeWidth={1.5} />
      <polygon points={`20,0 14,11 26,11`} fill="#4f6ef7" />
      <polygon points={`20,${H} 14,${H - 11} 26,${H - 11}`} fill="#4f6ef7" />
      <rect x={28} y={CY - 11} width={46} height={22} fill="white" rx={4} stroke="#4f6ef7" strokeWidth={1} />
      <text x={51} y={CY + 5} textAnchor="middle" fill="#4f6ef7" fontSize={12}
        fontFamily="system-ui" fontWeight="700">{height_cm} cm</text>
    </svg>
  );
}

// ── Placed product on the shelf ──────────────────────────────────────────────
interface PlacedProductProps {
  item: PlacedItem;
  shelfId: number;
  shelfHeightPx: number;
  shelfWidthPx: number;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onFacingChange: (delta: number) => void;
  onRemove: () => void;
}

function PlacedProductItem({
  item,
  shelfId,
  shelfHeightPx,
  shelfWidthPx,
  isSelected,
  onClick,
  onFacingChange,
  onRemove,
}: PlacedProductProps) {
  const product = ALL_PRODUCTS.find(p => p.id === item.productId);
  const [isHovered, setIsHovered] = useState(false);

  // Make placed items re-draggable for repositioning
  const [{ isDragging }, drag] = useDrag<DragPayload, unknown, { isDragging: boolean }>({
    type: DRAG_TYPE,
    item: () => ({
      productId: item.productId,
      sourceInstanceId: item.instanceId,
      sourceShelfId: shelfId,
      facing_count: item.facing_count,
      depth_count: item.depth_count,
      width_percent: item.width_percent,
    }),
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  if (!product) return null;

  const isBanner = product.posType === 'banner';
  const isPriceTag = product.posType === 'price-tag';

  const singleW = product.width_cm * SCALE;
  const itemH = product.height_cm * SCALE;
  const totalW = isBanner ? shelfWidthPx : singleW * item.facing_count;
  const itemLeft = isBanner ? 0 : item.position_x * SCALE;
  const itemTop = shelfHeightPx - itemH - (isBanner ? 2 : 4);

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: isBanner ? 0 : itemLeft,
        top: itemTop,
        width: totalW,
        height: itemH,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.25 : 1,
        zIndex: isSelected ? 10 : isHovered ? 5 : 1,
        userSelect: 'none',
        transition: 'opacity 0.15s',
      }}
    >
      {/* Product face(s) — one per facing */}
      <div style={{ display: 'flex', width: totalW, height: itemH,
        border: isSelected ? '2px solid #4f6ef7' : isHovered ? '1.5px solid rgba(79,110,247,0.45)' : 'none',
        borderRadius: 3, overflow: 'hidden',
        boxShadow: isSelected ? '0 0 0 2px rgba(79,110,247,0.25), 0 2px 10px rgba(0,0,0,0.18)'
          : isHovered ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.12s',
      }}>
        {isBanner ? (
          <ProductFace productId={product.id} w={totalW} h={itemH} />
        ) : (
          Array.from({ length: item.facing_count }).map((_, i) => (
            <div key={i} style={{ width: singleW, height: itemH, flexShrink: 0,
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.25)' : 'none' }}>
              <ProductFace productId={product.id} w={singleW} h={itemH} />
            </div>
          ))
        )}
      </div>

      {/* Depth badge (bottom-right of last facing) */}
      {!isBanner && !isPriceTag && (
        <div style={{
          position: 'absolute', bottom: 3, right: 4,
          background: 'rgba(0,0,0,0.62)', color: 'white',
          fontSize: 7.5, fontWeight: 700, padding: '1px 4px', borderRadius: 3,
          lineHeight: 1.2, pointerEvents: 'none',
        }}>
          ×{item.depth_count}
        </div>
      )}

      {/* Hover quick-delete button (top-right corner X) */}
      {(isHovered || isSelected) && !isDragging && (
        <button
          title="Remove product"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{
            position: 'absolute', top: -8, right: -8,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ef4444', border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 30,
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            padding: 0,
          }}
        >
          <X size={8} color="white" strokeWidth={3} />
        </button>
      )}

      {/* Drag handle icon (top-left, visible on hover) */}
      {isHovered && !isDragging && !isSelected && (
        <div style={{
          position: 'absolute', top: 2, left: 2,
          background: 'rgba(0,0,0,0.45)', borderRadius: 3,
          padding: '2px 3px', pointerEvents: 'none',
        }}>
          <Move size={8} color="white" />
        </div>
      )}

      {/* Selection controls — facing ± and info */}
      {isSelected && !isDragging && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: -34,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: 'white',
            border: '1px solid #dde0f0',
            borderRadius: 7,
            padding: '3px 6px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
            zIndex: 40,
            whiteSpace: 'nowrap',
          }}
        >
          <button
            onClick={() => onFacingChange(-1)}
            style={{ padding: '2px 4px', borderRadius: 4, border: 'none',
              background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            className="hover:bg-[#f0f0f3]"
            title="Fewer facings"
          >
            <Minus size={10} color="#4a4a5a" />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e', padding: '0 3px', minWidth: 22, textAlign: 'center' }}>
            {item.facing_count}F
          </span>
          <button
            onClick={() => onFacingChange(1)}
            style={{ padding: '2px 4px', borderRadius: 4, border: 'none',
              background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            className="hover:bg-[#f0f0f3]"
            title="More facings"
          >
            <Plus size={10} color="#4a4a5a" />
          </button>
          <div style={{ width: 1, height: 14, background: '#e0e0ea', margin: '0 3px' }} />
          <span style={{ fontSize: 10, color: '#6a6a7a' }}>×{item.depth_count} deep</span>
        </div>
      )}
    </div>
  );
}

// ── Shelf canvas ─────────────────────────────────────────────────────────────
export interface ShelfCanvasProps {
  shelf: ShelfData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updated: ShelfData) => void;
  onDelete: () => void;
  /** Called when a placed item was dragged OUT to another shelf — remove it here */
  onTransferOut: (instanceId: string) => void;
}

export function ShelfCanvas({
  shelf, isSelected, onSelect, onUpdate, onDelete, onTransferOut,
}: ShelfCanvasProps) {
  const shelfBodyRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width_cm: shelf.width_cm, height_cm: shelf.height_cm });
  const [isResizing, setIsResizing] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const dimsRef = useRef(dims);

  useEffect(() => { dimsRef.current = dims; }, [dims]);

  useEffect(() => {
    if (!isResizing) {
      setDims({ width_cm: shelf.width_cm, height_cm: shelf.height_cm });
    }
  }, [shelf.width_cm, shelf.height_cm, isResizing]);

  useEffect(() => {
    if (!isSelected) setSelectedItemId(null);
  }, [isSelected]);

  const shelfWidthPx = dims.width_cm * SCALE;
  const shelfHeightPx = dims.height_cm * SCALE;
  const showDimLines = isSelected || isResizing;

  // Drop target — accepts both catalog drags and placed-item repositioning
  const [{ isOver }, drop] = useDrop<DragPayload, unknown, { isOver: boolean }>({
    accept: DRAG_TYPE,
    drop: (dragItem, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !shelfBodyRef.current) return;

      const rect = shelfBodyRef.current.getBoundingClientRect();
      const x_px = Math.max(0, clientOffset.x - rect.left);
      const x_cm = parseFloat((x_px / SCALE).toFixed(1));

      if (dragItem.sourceInstanceId) {
        // ── Repositioning an existing item ───────────────────────────────────
        if (dragItem.sourceShelfId === shelf.id) {
          // Same shelf: just move it
          onUpdate({
            ...shelf,
            items: shelf.items.map(i =>
              i.instanceId === dragItem.sourceInstanceId
                ? { ...i, position_x: x_cm }
                : i
            ),
          });
        } else {
          // Cross-shelf: add to this shelf, caller removes from source
          const newItem: PlacedItem = {
            instanceId: dragItem.sourceInstanceId,
            productId: dragItem.productId,
            position_x: x_cm,
            facing_count: dragItem.facing_count ?? 1,
            depth_count: dragItem.depth_count ?? 1,
            ...(dragItem.width_percent !== undefined ? { width_percent: dragItem.width_percent } : {}),
          };
          onUpdate({ ...shelf, items: [...shelf.items, newItem] });
          if (dragItem.sourceShelfId !== undefined) {
            onTransferOut(dragItem.sourceInstanceId);
          }
        }
      } else {
        // ── New item from catalog ─────────────────────────────────────────────
        const product = ALL_PRODUCTS.find(p => p.id === dragItem.productId);
        if (!product) return;

        const depth_count = product.depth_cm > 0
          ? Math.max(1, Math.floor(shelf.depth_cm / product.depth_cm))
          : 1;

        const newItem: PlacedItem = {
          instanceId: `${dragItem.productId}_${Date.now()}`,
          productId: dragItem.productId,
          position_x: x_cm,
          facing_count: 1,
          depth_count,
          ...(product.posType === 'banner' ? { width_percent: 100 } : {}),
        };
        onUpdate({ ...shelf, items: [...shelf.items, newItem] });
      }
    },
    collect: monitor => ({ isOver: monitor.isOver() }),
  });

  const setRef = useCallback((el: HTMLDivElement | null) => {
    (shelfBodyRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    drop(el);
  }, [drop]);

  const startResize = (e: React.MouseEvent, direction: 'width' | 'height') => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const startW = dims.width_cm, startH = dims.height_cm;
    setIsResizing(true);
    onSelect();

    const onMove = (ev: MouseEvent) => {
      if (direction === 'width') {
        const newW = Math.max(20, Math.round(startW + (ev.clientX - startX) / SCALE));
        setDims(d => ({ ...d, width_cm: newW }));
      } else {
        const newH = Math.max(15, Math.round(startH + (ev.clientY - startY) / SCALE));
        setDims(d => ({ ...d, height_cm: newH }));
      }
    };

    const onUp = () => {
      setIsResizing(false);
      const cur = dimsRef.current;
      onUpdate({ ...shelf, width_cm: cur.width_cm, height_cm: cur.height_cm });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const updateFacing = (instanceId: string, delta: number) => {
    onUpdate({
      ...shelf,
      items: shelf.items.map(i =>
        i.instanceId === instanceId
          ? { ...i, facing_count: Math.max(1, i.facing_count + delta) }
          : i
      ),
    });
  };

  const removeItem = (instanceId: string) => {
    onUpdate({ ...shelf, items: shelf.items.filter(i => i.instanceId !== instanceId) });
    if (selectedItemId === instanceId) setSelectedItemId(null);
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        marginBottom: SHELF_BOARD_H + DEPTH_PANEL_H + 44,
        marginTop: showDimLines ? 56 : 12,
        marginRight: showDimLines ? 80 : 12,
      }}
      onClick={onSelect}
    >
      {/* Dimension lines */}
      {showDimLines && <WidthDimLine width_cm={dims.width_cm} scale={SCALE} />}
      {showDimLines && <HeightDimLine height_cm={dims.height_cm} shelfW={shelfWidthPx} scale={SCALE} />}

      {/* ── Main shelf body ────────────────────────────────────────────────── */}
      <div
        ref={setRef}
        onClick={e => { e.stopPropagation(); onSelect(); }}
        style={{
          position: 'relative',
          width: shelfWidthPx,
          height: shelfHeightPx,
          background: isOver
            ? 'linear-gradient(180deg, #eef1ff 0%, #e4e9ff 100%)'
            : 'linear-gradient(180deg, #fafaf8 0%, #f2ece0 100%)',
          border: isSelected
            ? '2px solid #4f6ef7'
            : isOver
            ? '2px dashed #4f6ef7'
            : '1.5px solid #cfc8b4',
          borderRadius: '3px 3px 0 0',
          overflow: 'visible',  // allow badges to overflow
          cursor: 'default',
          boxShadow: isSelected
            ? '0 0 0 3px rgba(79,110,247,0.1), inset 0 0 0 1px rgba(79,110,247,0.06)'
            : 'inset 0 0 16px rgba(0,0,0,0.04)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          clipPath: 'none',
        }}
      >
        {/* Clip inner content so products don't overflow the shelf */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
          {/* Products */}
          {shelf.items.map(item => (
            <PlacedProductItem
              key={item.instanceId}
              item={item}
              shelfId={shelf.id}
              shelfHeightPx={shelfHeightPx}
              shelfWidthPx={shelfWidthPx}
              isSelected={selectedItemId === item.instanceId}
              onClick={e => {
                e.stopPropagation();
                setSelectedItemId(prev => prev === item.instanceId ? null : item.instanceId);
              }}
              onFacingChange={delta => updateFacing(item.instanceId, delta)}
              onRemove={() => removeItem(item.instanceId)}
            />
          ))}

          {/* Empty / hover hints */}
          {shelf.items.length === 0 && !isOver && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: 12, color: '#c8c0a4', fontWeight: 500 }}>
                Drop products here
              </span>
            </div>
          )}
          {isOver && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
              background: 'rgba(79,110,247,0.06)' }}>
              <div style={{ background: 'rgba(79,110,247,0.14)', border: '1.5px dashed #4f6ef7',
                borderRadius: 8, padding: '7px 16px' }}>
                <span style={{ fontSize: 12, color: '#4f6ef7', fontWeight: 600 }}>Release to place</span>
              </div>
            </div>
          )}
        </div>

        {/* Labels (outside clip so they stay visible) */}
        <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 9.5,
          color: '#b0a888', fontWeight: 700, letterSpacing: '0.1em', pointerEvents: 'none' }}>
          SHELF {shelf.id}
        </div>
        <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 9,
          color: '#b0a888', fontWeight: 600, pointerEvents: 'none' }}>
          {shelf.depth_cm} cm deep
        </div>
      </div>

      {/* Shelf board (front face) */}
      <div style={{
        width: shelfWidthPx,
        height: SHELF_BOARD_H,
        background: 'linear-gradient(180deg, #d0b890 0%, #a88450 100%)',
        borderLeft: '1.5px solid #cfc8b4',
        borderRight: '1.5px solid #cfc8b4',
        borderBottom: '2px solid #806030',
      }} />

      {/* Depth shadow strip */}
      <div style={{
        width: shelfWidthPx,
        height: DEPTH_PANEL_H,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0) 100%)',
      }} />

      {/* Right resize handle (width) */}
      <div
        onMouseDown={e => startResize(e, 'width')}
        title="Drag to resize width"
        style={{
          position: 'absolute', right: -7, top: 0,
          width: 14, height: shelfHeightPx,
          cursor: 'ew-resize', zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{
          width: 5, height: 32, borderRadius: 3,
          background: isSelected || isResizing ? '#4f6ef7' : 'rgba(79,110,247,0)',
          transition: 'background 0.15s',
        }} />
      </div>

      {/* Bottom resize handle (height) */}
      <div
        onMouseDown={e => startResize(e, 'height')}
        title="Drag to resize height"
        style={{
          position: 'absolute',
          bottom: SHELF_BOARD_H + DEPTH_PANEL_H - 5,
          left: 0, width: shelfWidthPx, height: 14,
          cursor: 'ns-resize', zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{
          width: 32, height: 5, borderRadius: 3,
          background: isSelected || isResizing ? '#4f6ef7' : 'rgba(79,110,247,0)',
          transition: 'background 0.15s',
        }} />
      </div>

      {/* Delete-shelf button (shown only when shelf is selected) */}
      {isSelected && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          title="Delete this shelf"
          style={{
            position: 'absolute', top: -2, right: -80,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', fontSize: 11, fontWeight: 600,
            color: '#ef4444', background: 'white',
            border: '1.5px solid #fecaca', borderRadius: 7,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            zIndex: 30, whiteSpace: 'nowrap',
          }}
          className="hover:bg-red-50"
        >
          <Trash2 size={11} />
          Delete Shelf
        </button>
      )}
    </div>
  );
}
