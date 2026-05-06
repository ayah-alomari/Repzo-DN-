/**
 * GondolaUnit — 2D front-view retail gondola cabinet.
 * Supports Wall Rack, Cooler, and FSDU stand types.
 * Supports horizontal facings and vertical stacking on shelves.
 */

import React, { useRef, useState, useCallback, useEffect, forwardRef } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Minus, Plus, X, Trash2, Move } from 'lucide-react';
import { ShelfData, PlacedItem, DRAG_TYPE, SCALE, StandType } from './types';
import { ALL_PRODUCTS } from './catalogData';
import { ProductFace } from './ProductFace';

// ── Cabinet constants ──────────────────────────────────────────────────────────
export const BOARD_CM = 2.2;
export const TOP_CM   = 9;
export const BASE_CM  = 9;
export const WALL_CM  = 2.5;

const BOARD = Math.round(BOARD_CM * SCALE);
const TOP   = Math.round(TOP_CM * SCALE);
const BASE  = Math.round(BASE_CM * SCALE);
const WALL  = Math.round(WALL_CM * SCALE);

const FSDU_BANNER_H = 58; // px, extra banner block above top rail

const DX = 0;
const DY = 0;

// ── Drag payload ──────────────────────────────────────────────────────────────
interface DragPayload {
  productId: string;
  sourceInstanceId?: string;
  sourceShelfId?: number;
  facing_count?: number;
  depth_count?: number;
  vertical_facings?: number;
  width_percent?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcShelfLayout(shelves: ShelfData[]) {
  const positions: Array<{ y: number; height: number }> = [];
  let y = TOP;
  for (const shelf of shelves) {
    positions.push({ y, height: shelf.height_cm * SCALE });
    y += shelf.height_cm * SCALE + BOARD;
  }
  return { positions, totalH: y + BASE };
}

// ── Placed product (draggable, supports vertical stacking) ────────────────────
function PlacedProductItem({
  item, shelfId, innerW, shelfH,
  isSelected, isCapturing, onClickItem,
  onFacingChange, onVerticalFacingChange, onRemove,
}: {
  item: PlacedItem;
  shelfId: number;
  innerW: number;
  shelfH: number;
  isSelected: boolean;
  isCapturing: boolean;
  onClickItem: (e: React.MouseEvent) => void;
  onFacingChange: (d: number) => void;
  onVerticalFacingChange: (d: number) => void;
  onRemove: () => void;
}) {
  const product = ALL_PRODUCTS.find(p => p.id === item.productId);
  const [hovered, setHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag<DragPayload, unknown, { isDragging: boolean }>({
    type: DRAG_TYPE,
    item: () => ({
      productId: item.productId,
      sourceInstanceId: item.instanceId,
      sourceShelfId: shelfId,
      facing_count: item.facing_count,
      depth_count: item.depth_count,
      vertical_facings: item.vertical_facings ?? 1,
      width_percent: item.width_percent,
    }),
    collect: m => ({ isDragging: m.isDragging() }),
  });

  if (!product) return null;

  const isBanner   = product.posType === 'banner';
  const pixelW     = Math.round(product.width_cm * SCALE);
  const pixelH     = Math.round(product.height_cm * SCALE);
  const vFacings   = item.vertical_facings ?? 1;
  const totalItemH = isBanner ? pixelH : pixelH * vFacings;
  const totalW     = isBanner ? innerW : pixelW * item.facing_count;
  const doesNotFit = totalItemH > shelfH;
  const left       = isBanner ? 0 : item.position_x * SCALE;
  const top        = shelfH - totalItemH - 2;

  const baseShadow = isSelected
    ? 'drop-shadow(0 0 0 2px #4f6ef7) drop-shadow(0 6px 18px rgba(0,0,0,0.45)) drop-shadow(0 2px 5px rgba(0,0,0,0.3))'
    : hovered
    ? 'drop-shadow(0 5px 14px rgba(0,0,0,0.38)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
    : 'drop-shadow(0 4px 10px rgba(0,0,0,0.32)) drop-shadow(0 1px 3px rgba(0,0,0,0.2))';

  const boxShadow = isSelected
    ? '0 0 0 2px #4f6ef7, 0 6px 18px rgba(0,0,0,0.45), 0 2px 5px rgba(0,0,0,0.3)'
    : hovered
    ? '0 5px 14px rgba(0,0,0,0.38), 0 2px 4px rgba(0,0,0,0.25)'
    : '0 4px 10px rgba(0,0,0,0.32), 0 1px 3px rgba(0,0,0,0.2)';

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClickItem}
      style={{
        position: 'absolute', left, top,
        width: totalW, height: totalItemH,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.2 : 1,
        zIndex: isSelected ? 10 : hovered ? 5 : 1,
        userSelect: 'none',
        filter: doesNotFit
          ? 'drop-shadow(0 0 6px rgba(239,68,68,0.85)) drop-shadow(0 0 2px rgba(239,68,68,0.5))'
          : baseShadow,
        transition: 'filter 0.12s, opacity 0.12s',
      }}
    >
      {/* Product face grid: vFacings rows × facing_count columns */}
      <div style={{
        width: totalW, height: totalItemH,
        display: 'flex', flexDirection: 'column',
        border: isSelected ? '2px solid #4f6ef7' : hovered ? '1.5px solid rgba(79,110,247,0.55)' : 'none',
        borderRadius: 3, overflow: 'hidden',
        boxShadow, transition: 'box-shadow 0.12s, border-color 0.12s',
      }}>
        {isBanner ? (
          <ProductFace productId={product.id} w={totalW} h={pixelH} />
        ) : (
          Array.from({ length: vFacings }).map((_, row) => (
            <div key={row} style={{
              display: 'flex', flexShrink: 0,
              borderTop: row > 0 ? '1px solid rgba(255,255,255,0.18)' : 'none',
            }}>
              {Array.from({ length: item.facing_count }).map((_, col) => (
                <div key={col} style={{
                  width: pixelW, height: pixelH, flexShrink: 0,
                  borderLeft: col > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                }}>
                  <ProductFace productId={product.id} w={pixelW} h={pixelH} />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Does not fit */}
      {doesNotFit && !isCapturing && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(239,68,68,0.15)',
          border: '2px solid rgba(239,68,68,0.7)',
          borderRadius: 3, zIndex: 20, pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#ef4444',
            background: 'white', padding: '2px 5px', borderRadius: 4,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>Does not fit</span>
        </div>
      )}

      {/* Depth badge */}
      {!isBanner && (
        <div style={{
          position: 'absolute', bottom: 3, right: 3,
          background: 'rgba(0,0,0,0.65)', color: 'white',
          fontSize: 7.5, fontWeight: 700, padding: '1px 4px', borderRadius: 3, lineHeight: 1.2,
          pointerEvents: 'none',
        }}>
          ×{item.depth_count}
        </div>
      )}

      {/* Quick-delete */}
      {!isCapturing && (hovered || isSelected) && !isDragging && (
        <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{
          position: 'absolute', top: -9, right: -9,
          width: 20, height: 20, borderRadius: '50%', border: '2px solid white',
          background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', padding: 0,
        }}>
          <X size={9} color="white" strokeWidth={3} />
        </button>
      )}

      {/* Drag handle */}
      {!isCapturing && hovered && !isDragging && !isSelected && (
        <div style={{
          position: 'absolute', top: 3, left: 3,
          background: 'rgba(0,0,0,0.55)', borderRadius: 3, padding: '2px 3px', pointerEvents: 'none',
        }}>
          <Move size={8} color="white" />
        </div>
      )}

      {/* Selection controls — horizontal + vertical facings */}
      {isSelected && !isDragging && (
        <div onClick={e => e.stopPropagation()} style={{
          position: 'absolute', top: -38, left: 0,
          display: 'flex', alignItems: 'center', gap: 2,
          background: 'white', border: '1px solid #dde0f0', borderRadius: 8,
          padding: '3px 6px', boxShadow: '0 4px 18px rgba(0,0,0,0.18)', zIndex: 50, whiteSpace: 'nowrap',
        }}>
          {/* Horizontal */}
          <button onClick={() => onFacingChange(-1)} style={{ padding: '2px 4px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }} className="hover:bg-[#f0f0f3]">
            <Minus size={10} color="#4a4a5a" />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e', padding: '0 3px', minWidth: 22, textAlign: 'center' }}>{item.facing_count}F</span>
          <button onClick={() => onFacingChange(1)} style={{ padding: '2px 4px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }} className="hover:bg-[#f0f0f3]">
            <Plus size={10} color="#4a4a5a" />
          </button>

          {/* Vertical (not for banners) */}
          {!isBanner && (
            <>
              <div style={{ width: 1, height: 14, background: '#e0e0ea', margin: '0 3px' }} />
              <button onClick={() => onVerticalFacingChange(-1)} style={{ padding: '2px 4px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }} className="hover:bg-[#f0f0f3]">
                <Minus size={10} color="#4a4a5a" />
              </button>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4f6ef7', padding: '0 3px', minWidth: 22, textAlign: 'center' }}>{vFacings}V</span>
              <button onClick={() => onVerticalFacingChange(1)} style={{ padding: '2px 4px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }} className="hover:bg-[#f0f0f3]">
                <Plus size={10} color="#4a4a5a" />
              </button>
            </>
          )}

          <div style={{ width: 1, height: 14, background: '#e0e0ea', margin: '0 3px' }} />
          <span style={{ fontSize: 10, color: '#6a6a7a' }}>×{item.depth_count} deep</span>
        </div>
      )}
    </div>
  );
}

// ── Per-shelf drop zone ───────────────────────────────────────────────────────
function ShelfDropZone({
  shelf, innerW, shelfH, gondolaDepth,
  selectedItemId, onSelectItem, onUpdate, onTransferBetweenShelves, isCapturing,
}: {
  shelf: ShelfData;
  innerW: number;
  shelfH: number;
  gondolaDepth: number;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdate: (updated: ShelfData) => void;
  onTransferBetweenShelves: (fromShelfId: number, instanceId: string) => void;
  isCapturing: boolean;
}) {
  const zoneRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop<DragPayload, unknown, { isOver: boolean }>({
    accept: DRAG_TYPE,
    drop: (dragItem, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset || !zoneRef.current) return;
      const rect = zoneRef.current.getBoundingClientRect();
      const x_cm = Math.max(0, parseFloat(((offset.x - rect.left) / SCALE).toFixed(1)));

      if (dragItem.sourceInstanceId) {
        if (dragItem.sourceShelfId === shelf.id) {
          // Same shelf — reposition
          onUpdate({ ...shelf, items: shelf.items.map(i =>
            i.instanceId === dragItem.sourceInstanceId ? { ...i, position_x: x_cm } : i
          )});
        } else {
          // Cross-shelf transfer
          const newItem: PlacedItem = {
            instanceId: dragItem.sourceInstanceId,
            productId: dragItem.productId,
            position_x: x_cm,
            facing_count: dragItem.facing_count ?? 1,
            depth_count: dragItem.depth_count ?? 1,
            vertical_facings: dragItem.vertical_facings ?? 1,
            ...(dragItem.width_percent !== undefined ? { width_percent: dragItem.width_percent } : {}),
          };
          onUpdate({ ...shelf, items: [...shelf.items, newItem] });
          if (dragItem.sourceShelfId !== undefined) onTransferBetweenShelves(dragItem.sourceShelfId, dragItem.sourceInstanceId);
        }
      } else {
        // New from catalog
        const product = ALL_PRODUCTS.find(p => p.id === dragItem.productId);
        if (!product) return;
        const depth_count = product.depth_cm > 0 ? Math.max(1, Math.floor(gondolaDepth / product.depth_cm)) : 1;
        const newItem: PlacedItem = {
          instanceId: `${dragItem.productId}_${Date.now()}`,
          productId: dragItem.productId,
          position_x: x_cm,
          facing_count: 1,
          depth_count,
          vertical_facings: 1,
          ...(product.posType === 'banner' ? { width_percent: 100 } : {}),
        };
        onUpdate({ ...shelf, items: [...shelf.items, newItem] });
      }
    },
    collect: m => ({ isOver: m.isOver() }),
  });

  const setRef = useCallback((el: HTMLDivElement | null) => {
    (zoneRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    drop(el);
  }, [drop]);

  const removePlacer = (instanceId: string) => {
    onUpdate({ ...shelf, items: shelf.items.filter(i => i.instanceId !== instanceId) });
    if (selectedItemId === instanceId) onSelectItem(null);
  };

  const updateFacing = (instanceId: string, delta: number) => {
    onUpdate({ ...shelf, items: shelf.items.map(i =>
      i.instanceId === instanceId ? { ...i, facing_count: Math.max(1, i.facing_count + delta) } : i
    )});
  };

  const updateVerticalFacing = (instanceId: string, delta: number) => {
    onUpdate({ ...shelf, items: shelf.items.map(i =>
      i.instanceId === instanceId ? { ...i, vertical_facings: Math.max(1, (i.vertical_facings ?? 1) + delta) } : i
    )});
  };

  return (
    <div
      ref={setRef}
      style={{
        position: 'relative', width: innerW, height: shelfH, overflow: 'visible',
        backgroundImage: isOver
          ? 'linear-gradient(rgba(79,110,247,0.12) 0%, transparent 40%)'
          : `
            linear-gradient(rgba(79,110,247,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,110,247,0.055) 1px, transparent 1px),
            linear-gradient(rgba(79,110,247,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,110,247,0.025) 1px, transparent 1px),
            linear-gradient(180deg, rgba(0,0,0,0.04) 0px, transparent 24px)
          `,
        backgroundSize: isOver ? 'auto' : `${SCALE * 10}px ${SCALE * 10}px, ${SCALE * 10}px ${SCALE * 10}px, ${SCALE}px ${SCALE}px, ${SCALE}px ${SCALE}px, auto`,
        cursor: 'default', transition: 'background 0.12s',
      }}
      onClick={e => { e.stopPropagation(); onSelectItem(null); }}
    >
      {shelf.items.map(item => (
        <PlacedProductItem
          key={item.instanceId}
          item={item}
          shelfId={shelf.id}
          innerW={innerW}
          shelfH={shelfH}
          isSelected={!isCapturing && selectedItemId === item.instanceId}
          isCapturing={isCapturing}
          onClickItem={e => { e.stopPropagation(); onSelectItem(selectedItemId === item.instanceId ? null : item.instanceId); }}
          onFacingChange={d => updateFacing(item.instanceId, d)}
          onVerticalFacingChange={d => updateVerticalFacing(item.instanceId, d)}
          onRemove={() => removePlacer(item.instanceId)}
        />
      ))}

      {/* ── Price tags — 1 per unique product variant ── */}
      {!isCapturing && (() => {
        const seen = new Set<string>();
        return shelf.items
          .slice()
          .sort((a, b) => a.position_x - b.position_x)
          .filter(item => {
            const product = ALL_PRODUCTS.find(p => p.id === item.productId);
            if (!product || product.type !== 'product' || product.price == null) return false;
            if (seen.has(item.productId)) return false;
            seen.add(item.productId);
            return true;
          })
          .map(item => {
            const product = ALL_PRODUCTS.find(p => p.id === item.productId)!;
            const tagW = Math.round(product.width_cm * SCALE * item.facing_count);
            return (
              <div key={`pt_${item.productId}`} style={{
                position: 'absolute',
                bottom: 1,
                left: Math.round(item.position_x * SCALE),
                width: tagW,
                height: 13,
                background: 'white',
                borderTop: '1.5px solid #e8e8ec',
                borderLeft: '2.5px solid #E31837',
                borderRight: '1px solid #e8e8ec',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingLeft: 3, paddingRight: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                zIndex: 4, pointerEvents: 'none', overflow: 'hidden',
              }}>
                <span style={{ fontSize: 6.5, fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                  {product.shortName}
                </span>
                <span style={{ fontSize: 7, fontWeight: 800, color: '#E31837', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 2 }}>
                  {product.price!.toFixed(2)} SAR
                </span>
              </div>
            );
          });
      })()}

      {!isCapturing && shelf.items.length === 0 && !isOver && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ fontSize: 11, color: 'rgba(160,150,130,0.7)', fontWeight: 500 }}>drop products here</span>
        </div>
      )}
      {isOver && (
        <div style={{ position: 'absolute', inset: 2, border: '1.5px dashed #4f6ef7', borderRadius: 3, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: '#4f6ef7', fontWeight: 600 }}>Release to place</span>
        </div>
      )}
    </div>
  );
}

// ── Dimension line helpers (click-to-edit) ────────────────────────────────────
function HorizDimLine({ x1, x2, y, label, onEdit }: {
  x1: number; x2: number; y: number; label: string; onEdit?: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const cx = (x1 + x2) / 2;

  const commit = () => {
    const n = parseFloat(val);
    if (!isNaN(n) && onEdit) onEdit(n);
    setEditing(false);
  };

  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#4f6ef7" strokeWidth={0.8} />
      <line x1={x1} y1={y - 7} x2={x1} y2={y + 7} stroke="#4f6ef7" strokeWidth={1} />
      <line x1={x2} y1={y - 7} x2={x2} y2={y + 7} stroke="#4f6ef7" strokeWidth={1} />
      <polygon points={`${x1},${y} ${x1 + 10},${y - 3.5} ${x1 + 10},${y + 3.5}`} fill="#4f6ef7" />
      <polygon points={`${x2},${y} ${x2 - 10},${y - 3.5} ${x2 - 10},${y + 3.5}`} fill="#4f6ef7" />

      {editing ? (
        <foreignObject x={cx - 34} y={y - 12} width={68} height={24}>
          <input
            autoFocus type="number"
            value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
            onBlur={commit}
            style={{ width: '100%', height: '100%', textAlign: 'center', fontSize: 10, border: '1.5px solid #4f6ef7', borderRadius: 3, outline: 'none', fontFamily: 'monospace', fontWeight: 700, color: '#4f6ef7', background: 'white', padding: 0, boxSizing: 'border-box' }}
          />
        </foreignObject>
      ) : (
        <g
          onClick={() => { if (onEdit) { setVal(label.replace(' cm', '')); setEditing(true); } }}
          style={{ cursor: onEdit ? 'text' : 'default' }}
        >
          <rect x={cx - 28} y={y - 9} width={56} height={18} fill="white" rx={3} stroke="#4f6ef7" strokeWidth={0.7} />
          <text x={cx} y={y + 4} textAnchor="middle" fill="#4f6ef7" fontSize={10} fontFamily="monospace" fontWeight="600">{label}</text>
          {onEdit && <text x={cx + 30} y={y + 3} fill="#4f6ef7" fontSize={8} opacity={0.45}>✎</text>}
        </g>
      )}
    </g>
  );
}

function VertDimLine({ x, y1, y2, label, onEdit }: {
  x: number; y1: number; y2: number; label: string; onEdit?: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const cy = (y1 + y2) / 2;

  const commit = () => {
    const n = parseFloat(val);
    if (!isNaN(n) && onEdit) onEdit(n);
    setEditing(false);
  };

  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke="#4f6ef7" strokeWidth={0.8} />
      <line x1={x - 7} y1={y1} x2={x + 7} y2={y1} stroke="#4f6ef7" strokeWidth={1} />
      <line x1={x - 7} y1={y2} x2={x + 7} y2={y2} stroke="#4f6ef7" strokeWidth={1} />
      <polygon points={`${x},${y1} ${x - 3.5},${y1 + 10} ${x + 3.5},${y1 + 10}`} fill="#4f6ef7" />
      <polygon points={`${x},${y2} ${x - 3.5},${y2 - 10} ${x + 3.5},${y2 - 10}`} fill="#4f6ef7" />

      {editing ? (
        <foreignObject x={x + 8} y={cy - 12} width={68} height={24}>
          <input
            autoFocus type="number"
            value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
            onBlur={commit}
            style={{ width: '100%', height: '100%', textAlign: 'center', fontSize: 10, border: '1.5px solid #4f6ef7', borderRadius: 3, outline: 'none', fontFamily: 'monospace', fontWeight: 700, color: '#4f6ef7', background: 'white', padding: 0, boxSizing: 'border-box' }}
          />
        </foreignObject>
      ) : (
        <g
          onClick={() => { if (onEdit) { setVal(label.replace(' cm', '')); setEditing(true); } }}
          style={{ cursor: onEdit ? 'text' : 'default' }}
        >
          <rect x={x + 8} y={cy - 9} width={52} height={18} fill="white" rx={3} stroke="#4f6ef7" strokeWidth={0.7} />
          <text x={x + 34} y={cy + 4} textAnchor="middle" fill="#4f6ef7" fontSize={10} fontFamily="monospace" fontWeight="600">{label}</text>
          {onEdit && <text x={x + 62} y={cy + 3} fill="#4f6ef7" fontSize={8} opacity={0.45}>✎</text>}
        </g>
      )}
    </g>
  );
}

// ── GondolaUnit props ─────────────────────────────────────────────────────────
export interface GondolaUnitProps {
  shelves: ShelfData[];
  gondolaWidthCm: number;
  depth_cm: number;
  selectedShelfId: number | null;
  onSelectShelf: (id: number | null) => void;
  onUpdateShelf: (id: number, updated: ShelfData) => void;
  onDeleteShelf: (id: number) => void;
  isCapturing?: boolean;
  onWidthChange?: (newWidthCm: number) => void;
  onTotalHeightChange?: (newTotalH: number) => void;
  standType?: StandType;
}

// ── GondolaUnit ───────────────────────────────────────────────────────────────
export const GondolaUnit = forwardRef<HTMLDivElement, GondolaUnitProps>(function GondolaUnit(
  { shelves, gondolaWidthCm, depth_cm, selectedShelfId, onSelectShelf, onUpdateShelf, onDeleteShelf,
    isCapturing = false, onWidthChange, onTotalHeightChange, standType = 'wall' },
  captureRef
) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<number | null>(null);
  const [localHeights, setLocalHeights] = useState<Record<number, number>>({});
  const localHeightsRef = useRef(localHeights);
  useEffect(() => { localHeightsRef.current = localHeights; }, [localHeights]);

  // Shelf height click-to-edit
  const [editingShelfId, setEditingShelfId] = useState<number | null>(null);
  const [shelfHeightInput, setShelfHeightInput] = useState('');

  const [localW, setLocalW] = useState(gondolaWidthCm);
  const localWRef = useRef(localW);
  useEffect(() => { localWRef.current = localW; }, [localW]);
  useEffect(() => { setLocalW(gondolaWidthCm); }, [gondolaWidthCm]);

  const W = localW * SCALE;
  const innerW = W - WALL * 2;
  const { positions, totalH } = calcShelfLayout(
    shelves.map(s => ({ ...s, height_cm: localHeights[s.id] ?? s.height_cm }))
  );

  const isCooler = standType === 'cooler';
  const isFSDU   = standType === 'fsdu';

  const handleTransfer = useCallback((fromShelfId: number, instanceId: string) => {
    const src = shelves.find(s => s.id === fromShelfId);
    if (!src) return;
    onUpdateShelf(fromShelfId, { ...src, items: src.items.filter(i => i.instanceId !== instanceId) });
  }, [shelves, onUpdateShelf]);

  // Shelf height click-to-edit: commit
  const applyShelfHeight = (shelfId: number) => {
    const newH = parseFloat(shelfHeightInput);
    if (!isNaN(newH) && newH >= 10 && newH <= 300) {
      setLocalHeights(prev => ({ ...prev, [shelfId]: newH }));
      const s = shelves.find(sh => sh.id === shelfId);
      if (s) onUpdateShelf(shelfId, { ...s, height_cm: newH });
    }
    setEditingShelfId(null);
  };

  // Shelf height resize (drag)
  const startShelfResize = (e: React.MouseEvent, shelfId: number) => {
    e.preventDefault(); e.stopPropagation();
    const startY = e.clientY;
    const shelf = shelves.find(s => s.id === shelfId)!;
    const startH = shelf.height_cm;
    setResizingId(shelfId);
    const onMove = (ev: MouseEvent) => {
      const delta = (ev.clientY - startY) / SCALE;
      setLocalHeights(prev => ({ ...prev, [shelfId]: Math.max(15, Math.round(startH + delta)) }));
    };
    const onUp = () => {
      const cur = localHeightsRef.current[shelfId] ?? startH;
      onUpdateShelf(shelfId, { ...shelves.find(sh => sh.id === shelfId)!, height_cm: cur });
      setResizingId(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Gondola width resize
  const startWidthResize = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startW = localWRef.current;
    const onMove = (ev: MouseEvent) => {
      setLocalW(Math.round(Math.max(40, Math.min(300, startW + (ev.clientX - startX) / SCALE))));
    };
    const onUp = () => {
      onWidthChange?.(localWRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const Y_OFF = isCapturing ? 4 : 60;
  const svgW  = isCapturing ? W + DX + 8 : W + DX + 80;
  const svgH  = totalH + DY + Y_OFF + 8;

  // ── Stand-type styling ─────────────────────────────────────────────────────
  const gondolaBorderColor = isCooler ? '#1565c0' : '#c0c4c8';
  const gondolaBorderWidth = isCooler ? 4 : 1.5;
  const gondolaBoxShadow   = isCooler ? '0 0 0 2px #0d47a1, 0 8px 32px rgba(13,71,161,0.25)' : undefined;
  const gondolaBg          = isCooler
    ? `radial-gradient(ellipse 2.5px 2px at 11px 11px, rgba(30,80,160,0.18) 50%, transparent 50%), radial-gradient(ellipse 2.5px 2px at 0 0, rgba(30,80,160,0.18) 50%, transparent 50%), #eef3fa`
    : `radial-gradient(ellipse 2.5px 2px at 11px 11px, rgba(100,100,120,0.22) 50%, transparent 50%), radial-gradient(ellipse 2.5px 2px at 0 0, rgba(100,100,120,0.22) 50%, transparent 50%), #f3f4f6`;

  const topRailBg = isCooler
    ? 'linear-gradient(180deg, #1565c0 0%, #0d47a1 40%, #0a3580 60%, #1565c0 100%)'
    : 'linear-gradient(180deg, #e0e4e8 0%, #d0d4d8 40%, #c8ccd2 60%, #d8dce0 100%)';
  const topRailBorder = isCooler ? '2px solid #0a3580' : '2px solid #b0b4b8';
  const baseBg = isCooler
    ? 'linear-gradient(180deg, #0d47a1 0%, #1565c0 30%, #0a3580 100%)'
    : 'linear-gradient(180deg, #c8ccd0 0%, #d4d8dc 30%, #c0c4c8 100%)';
  const baseBorder = isCooler ? '2px solid #0a3580' : '2px solid #a8acb0';
  const wallBg = isCooler
    ? 'linear-gradient(90deg, #1565c0 0%, #1976d2 60%, #1565c0 100%)'
    : 'linear-gradient(90deg, #c4c8cc 0%, #d8dce0 60%, #ccd0d4 100%)';

  return (
    <div
      ref={captureRef}
      style={{ display: 'inline-block', transform: 'none' }}
      onClick={() => { onSelectShelf(null); setSelectedItemId(null); }}
    >
      {/* ── FSDU Banner ─────────────────────────────────────────────────── */}
      {isFSDU && (
        <div style={{
          width: W,
          height: FSDU_BANNER_H,
          background: 'linear-gradient(135deg, #b83200 0%, #e04000 30%, #ff6b35 55%, #ff8040 70%, #e04000 100%)',
          borderRadius: '6px 6px 0 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 5, position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(200,64,0,0.4)',
        }}>
          {/* Glare */}
          <div style={{
            position: 'absolute', top: 0, left: '4%', width: '28%', height: '100%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          <span style={{
            fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'monospace',
          }}>
            {isCapturing ? 'FSDU DISPLAY' : 'FSDU · Promotional Banner Area'}
          </span>
          <span style={{
            fontSize: isCapturing ? 18 : 13, fontWeight: 900, color: 'white',
            letterSpacing: '0.06em', textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}>
            {isCapturing ? 'BRAND / OFFER DISPLAY' : '[ BRAND / OFFER BANNER ]'}
          </span>
        </div>
      )}

      {/* ── Gondola container ───────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: svgW, height: svgH }}>

        {/* SVG dim lines */}
        <svg style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 10 }}
          width={svgW} height={svgH}>
          {!isCapturing && (() => {
            const Y = Y_OFF;
            const totalHeightCm = Math.round(
              ((positions[positions.length - 1]?.y ?? 0) +
                (localHeights[shelves[shelves.length - 1]?.id] ?? shelves[shelves.length - 1]?.height_cm ?? 40) * SCALE +
                BOARD + BASE) / SCALE
            );
            return (
              <g>
                <HorizDimLine
                  x1={0} x2={W} y={Y - 28} label={`${localW} cm`}
                  onEdit={v => {
                    const clamped = Math.round(Math.max(40, Math.min(300, v)));
                    setLocalW(clamped);
                    onWidthChange?.(clamped);
                  }}
                />
                <VertDimLine
                  x={W + 18} y1={Y} y2={Y + totalH} label={`${totalHeightCm} cm`}
                  onEdit={onTotalHeightChange}
                />
              </g>
            );
          })()}
        </svg>

        {/* ── Front face ──────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute', top: Y_OFF, left: 0, width: W, height: totalH, zIndex: 1,
            background: gondolaBg, backgroundSize: '22px 22px, 22px 22px, auto',
            border: `${gondolaBorderWidth}px solid ${gondolaBorderColor}`,
            boxShadow: gondolaBoxShadow,
            borderRadius: isFSDU ? '0 0 4px 4px' : isCooler ? '4px' : 0,
            overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top rail */}
          <div style={{
            height: TOP, width: '100%',
            background: topRailBg,
            borderBottom: topRailBorder,
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.22), inset 0 -2px 4px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', paddingLeft: WALL + 4, flexShrink: 0,
          }}>
            {!isCapturing && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', fontFamily: 'monospace',
                color: isCooler ? 'rgba(180,220,255,0.8)' : '#909498',
              }}>
                {isCooler ? `COOLER · ${localW} × ${depth_cm} cm` :
                 isFSDU  ? `FSDU · ${localW} × ${depth_cm} cm` :
                           `GONDOLA · ${localW} × ${depth_cm} cm`}
              </span>
            )}
          </div>

          {/* Left wall */}
          <div style={{
            position: 'absolute', top: TOP, left: 0, width: WALL, height: totalH - TOP - BASE,
            background: wallBg, borderRight: `1px solid ${isCooler ? '#0d47a1' : '#b0b4b8'}`,
            boxShadow: 'inset 2px 0 4px rgba(255,255,255,0.2)',
          }} />
          {/* Right wall */}
          <div style={{
            position: 'absolute', top: TOP, right: 0, width: WALL, height: totalH - TOP - BASE,
            background: wallBg, borderLeft: `1px solid ${isCooler ? '#0d47a1' : '#b0b4b8'}`,
          }} />

          {/* Shelves */}
          <div style={{ position: 'absolute', top: TOP, left: WALL, width: innerW, height: totalH - TOP - BASE }}>
            {shelves.map((shelf, i) => {
              const pos = positions[i];
              const shH = (localHeights[shelf.id] ?? shelf.height_cm) * SCALE;
              const isShelfSelected = selectedShelfId === shelf.id;
              const isResizingThis  = resizingId === shelf.id;

              return (
                <div key={shelf.id} style={{ position: 'absolute', top: pos.y - TOP, left: 0, width: innerW }}>
                  <ShelfDropZone
                    shelf={shelf} innerW={innerW} shelfH={shH} gondolaDepth={depth_cm}
                    selectedItemId={selectedItemId} onSelectItem={setSelectedItemId}
                    onUpdate={updated => onUpdateShelf(shelf.id, updated)}
                    onTransferBetweenShelves={handleTransfer}
                    isCapturing={isCapturing}
                  />

                  {/* Shelf board */}
                  <div
                    onClick={e => { e.stopPropagation(); if (editingShelfId === shelf.id) return; onSelectShelf(isShelfSelected ? null : shelf.id); }}
                    style={{
                      position: 'absolute', top: shH, left: 0, width: innerW, height: BOARD,
                      background: isShelfSelected
                        ? 'linear-gradient(180deg, #7090f0 0%, #4f6ef7 50%, #3a5ae0 100%)'
                        : isCooler
                        ? 'linear-gradient(180deg, #1565c0 0%, #0d47a1 50%, #0a3080 100%)'
                        : 'linear-gradient(180deg, #d8dce0 0%, #c4c8cc 40%, #b8bcc0 60%, #c8ccd0 100%)',
                      borderTop: isShelfSelected ? '1px solid #6080ee' : `1px solid ${isCooler ? '#1976d2' : 'rgba(255,255,255,0.6)'}`,
                      borderBottom: isShelfSelected ? '2px solid #2a40c0' : `2px solid ${isCooler ? '#0a3080' : '#a0a4a8'}`,
                      cursor: 'pointer',
                      boxShadow: isShelfSelected ? '0 2px 8px rgba(79,110,247,0.5)' : 'inset 0 1px 2px rgba(255,255,255,0.4)',
                      display: 'flex', alignItems: 'center', paddingLeft: 6, gap: 5,
                      transition: 'background 0.15s, box-shadow 0.15s', overflow: 'visible',
                    }}
                  >
                    {isShelfSelected && !isCapturing && (
                      editingShelfId === shelf.id ? (
                        <input
                          autoFocus type="number"
                          value={shelfHeightInput}
                          onChange={e => setShelfHeightInput(e.target.value)}
                          onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') applyShelfHeight(shelf.id); if (e.key === 'Escape') setEditingShelfId(null); }}
                          onBlur={() => applyShelfHeight(shelf.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ width: 52, height: BOARD - 2, fontSize: 8.5, fontWeight: 700, fontFamily: 'monospace', color: '#1a1a2e', background: 'white', border: '1px solid #4f6ef7', borderRadius: 3, outline: 'none', textAlign: 'center', padding: 0 }}
                        />
                      ) : (
                        <span
                          style={{ fontSize: 8.5, color: 'white', fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'monospace', cursor: 'text', display: 'flex', alignItems: 'center', gap: 3 }}
                          onClick={e => { e.stopPropagation(); setShelfHeightInput(String(localHeights[shelf.id] ?? shelf.height_cm)); setEditingShelfId(shelf.id); }}
                          title="Click to edit height"
                        >
                          SHELF · H:<u style={{ textDecorationStyle: 'dotted' }}>{localHeights[shelf.id] ?? shelf.height_cm}</u> cm ✎
                        </span>
                      )
                    )}
                  </div>

                  {/* Height resize handle */}
                  {!isCapturing && (
                    <div onMouseDown={e => startShelfResize(e, shelf.id)} style={{
                      position: 'absolute', top: shH + BOARD, left: 0,
                      width: innerW, height: 8, cursor: 'ns-resize', zIndex: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} title="Drag to resize shelf height">
                      <div style={{
                        width: 28, height: 3, borderRadius: 2,
                        background: (isShelfSelected || isResizingThis) ? '#4f6ef7' : 'transparent',
                        transition: 'background 0.15s',
                      }} />
                    </div>
                  )}

                  {/* Delete shelf */}
                  {isShelfSelected && !isCapturing && (
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteShelf(shelf.id); onSelectShelf(null); }}
                      style={{
                        position: 'absolute', top: shH - 2, right: -90,
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '3px 9px', fontSize: 10.5, fontWeight: 600,
                        color: '#ef4444', background: 'white',
                        border: '1.5px solid #fecaca', borderRadius: 6,
                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 30, whiteSpace: 'nowrap',
                      }}
                      className="hover:bg-red-50"
                    >
                      <Trash2 size={10} /> Delete Shelf
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Base */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: W, height: BASE,
            background: baseBg, borderTop: baseBorder,
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.18), 0 4px 12px rgba(0,0,0,0.22)',
          }} />

          {/* Top ambient shadow */}
          <div style={{
            position: 'absolute', top: TOP, left: WALL, right: WALL, height: 28,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.07) 0%, transparent 100%)',
            pointerEvents: 'none', zIndex: 2,
          }} />

          {/* Cooler: glass door overlay */}
          {isCooler && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(180,220,255,0.06) 45%, transparent 70%)',
            }}>
              {/* Left glare streak */}
              <div style={{
                position: 'absolute', top: 0, left: '9%', width: '10%', height: '100%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.06) 55%, transparent 100%)',
                transform: 'skewX(-5deg)',
              }} />
            </div>
          )}
        </div>

        {/* Width resize handle */}
        {!isCapturing && (
          <div onMouseDown={startWidthResize} style={{
            position: 'absolute', top: Y_OFF, right: -14, width: 14, height: totalH,
            cursor: 'ew-resize', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} title="Drag to resize gondola width">
            <div style={{ width: 4, height: 44, borderRadius: 2, background: '#b0b4c0' }} />
          </div>
        )}
      </div>
    </div>
  );
});
