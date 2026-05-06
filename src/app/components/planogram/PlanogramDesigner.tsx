import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, Camera, LayoutGrid, ArrowLeft, Check, Lock, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { DragLayerPreview } from './DragLayerPreview';
import { ShelfData, PlanogramTemplate, SavedPlanogram, StandType } from './types';
import { ProductCatalog } from './ProductCatalog';
import { TemplatesPanel } from './TemplatesPanel';
import { GondolaUnit, TOP_CM, BASE_CM, BOARD_CM } from './GondolaUnit';
import { RenderModal } from './RenderModal';

const DEFAULT_GONDOLA_WIDTH_CM = 120;
let nextId = 100;

function makeDefaultShelves(widthCm = DEFAULT_GONDOLA_WIDTH_CM): ShelfData[] {
  return [
    { id: nextId++, width_cm: widthCm, height_cm: 42, depth_cm: 60, items: [] },
    { id: nextId++, width_cm: widthCm, height_cm: 42, depth_cm: 60, items: [] },
    { id: nextId++, width_cm: widthCm, height_cm: 42, depth_cm: 60, items: [] },
  ];
}

// ── Stand type config ──────────────────────────────────────────────────────────
const STAND_LABELS: Record<StandType, string> = {
  wall: 'Wall Rack',
  cooler: 'Cooler',
  fsdu: 'FSDU',
};
const STAND_COLORS: Record<StandType, { color: string; bg: string }> = {
  wall: { color: '#546e7a', bg: '#eceff1' },
  cooler: { color: '#1565c0', bg: '#e3f2fd' },
  fsdu: { color: '#e04000', bg: '#fff3e0' },
};

// ── Undo / Redo ────────────────────────────────────────────────────────────────
interface HistoryEntry { shelves: ShelfData[]; gondolaWidthCm: number; }

function useUndoRedo(initial: HistoryEntry) {
  const stackRef = useRef<HistoryEntry[]>([initial]);
  const indexRef = useRef(0);

  const push = useCallback((entry: HistoryEntry) => {
    stackRef.current = stackRef.current.slice(0, indexRef.current + 1);
    stackRef.current.push(entry);
    indexRef.current = stackRef.current.length - 1;
  }, []);

  const undo = useCallback((
    setShelves: React.Dispatch<React.SetStateAction<ShelfData[]>>,
    setWidth: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    if (indexRef.current > 0) {
      indexRef.current--;
      const e = stackRef.current[indexRef.current];
      setShelves(e.shelves);
      setWidth(e.gondolaWidthCm);
    }
  }, []);

  const redo = useCallback((
    setShelves: React.Dispatch<React.SetStateAction<ShelfData[]>>,
    setWidth: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    if (indexRef.current < stackRef.current.length - 1) {
      indexRef.current++;
      const e = stackRef.current[indexRef.current];
      setShelves(e.shelves);
      setWidth(e.gondolaWidthCm);
    }
  }, []);

  return { push, undo, redo };
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label, sublabel }: {
  value: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string;
}) {
  return (
    <div role="switch" aria-checked={value} onClick={() => onChange(!value)}
      style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }}>
      <div style={{
        width: 36, height: 20, borderRadius: 10, flexShrink: 0,
        background: value ? '#4f6ef7' : '#d4d4de', position: 'relative', transition: 'background 0.18s',
        boxShadow: value ? 'inset 0 1px 3px rgba(0,0,0,0.15)' : 'inset 0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%', background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.22)', transition: 'left 0.18s',
        }} />
      </div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: value ? '#1a1a2e' : '#6a6a7a', lineHeight: 1.2 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 10.5, color: '#9090a8', marginTop: 1 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface PlanogramDesignerProps {
  initialTemplate?: SavedPlanogram | null;
  prefill?: { name: string; standType: StandType };
  confirmOnBack?: boolean;
  onBack: () => void;
  onSave: (
    name: string,
    shelves: ShelfData[],
    gondolaWidthCm: number,
    ignoreFacing: boolean,
    ignorePosition: boolean,
    ignorePriceTags: boolean,
    ignoreShelfTalker: boolean,
    standType: StandType,
  ) => void;
}

export function PlanogramDesigner({ initialTemplate, prefill, confirmOnBack = false, onBack, onSave }: PlanogramDesignerProps) {
  const initWidthCm = initialTemplate?.gondolaWidthCm ?? DEFAULT_GONDOLA_WIDTH_CM;
  const initShelves = initialTemplate?.shelves ?? makeDefaultShelves(initWidthCm);
  const initStandType: StandType = initialTemplate?.standType ?? prefill?.standType ?? 'wall';

  const [shelves, setShelves] = useState<ShelfData[]>(initShelves);
  const [gondolaWidthCm, setGondolaWidthCm] = useState(initWidthCm);
  const [standType] = useState<StandType>(initStandType); // LOCKED after init
  const [templateName, setTemplateName] = useState(initialTemplate?.name ?? prefill?.name ?? '');
  const [ignoreFacing, setIgnoreFacing] = useState(initialTemplate?.ignoreFacing ?? false);
  const [ignorePosition, setIgnorePosition] = useState(initialTemplate?.ignorePosition ?? false);
  const [ignorePriceTags, setIgnorePriceTags] = useState(initialTemplate?.ignorePriceTags ?? false);
  const [ignoreShelfTalker, setIgnoreShelfTalker] = useState(initialTemplate?.ignoreShelfTalker ?? false);
  const [selectedShelfId, setSelectedShelfId] = useState<number | null>(null);
  const [userTemplates, setUserTemplates] = useState<PlanogramTemplate[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showRenderModal, setShowRenderModal] = useState(false);
  const [triedSave, setTriedSave] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const gondolaRef = useRef<HTMLDivElement>(null);
  const renderStageRef = useRef<HTMLDivElement>(null);

  // Sync ref for closures
  const gondolaWidthCmRef = useRef(initWidthCm);
  useEffect(() => { gondolaWidthCmRef.current = gondolaWidthCm; }, [gondolaWidthCm]);

  const { push: pushHistory, undo, redo } = useUndoRedo({ shelves: initShelves, gondolaWidthCm: initWidthCm });

  // Keyboard undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(setShelves, setGondolaWidthCm); }
        else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(setShelves, setGondolaWidthCm); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // ── Computed total height ─────────────────────────────────────────────────
  const totalHeightCm = useMemo(() => {
    return Math.round(TOP_CM + BASE_CM + shelves.length * BOARD_CM + shelves.reduce((s, sh) => s + sh.height_cm, 0));
  }, [shelves]);

  // ── Shelf mutations ───────────────────────────────────────────────────────
  const addShelf = () => {
    setShelves(prev => {
      const next = [...prev, { id: nextId++, width_cm: gondolaWidthCmRef.current, height_cm: 42, depth_cm: 60, items: [] }];
      pushHistory({ shelves: next, gondolaWidthCm: gondolaWidthCmRef.current });
      return next;
    });
  };

  const updateShelf = useCallback((id: number, updated: ShelfData) => {
    setShelves(prev => {
      const next = prev.map(s => s.id === id ? updated : s);
      pushHistory({ shelves: next, gondolaWidthCm: gondolaWidthCmRef.current });
      return next;
    });
  }, [pushHistory]);

  const deleteShelf = useCallback((id: number) => {
    setShelves(prev => {
      const next = prev.filter(s => s.id !== id);
      pushHistory({ shelves: next, gondolaWidthCm: gondolaWidthCmRef.current });
      return next;
    });
    setSelectedShelfId(prev => prev === id ? null : prev);
  }, [pushHistory]);

  const handleWidthChange = useCallback((newWidthCm: number) => {
    setGondolaWidthCm(newWidthCm);
    setShelves(prev => { pushHistory({ shelves: prev, gondolaWidthCm: newWidthCm }); return prev; });
  }, [pushHistory]);

  // ── Settings panel handlers ───────────────────────────────────────────────
  const applyTotalHeight = (newTotal: number) => {
    if (!shelves.length || newTotal < 30) return;
    const available = newTotal - TOP_CM - BASE_CM - shelves.length * BOARD_CM;
    if (available < shelves.length * 15) return;
    const each = Math.max(15, Math.round((available / shelves.length) * 10) / 10);
    setShelves(prev => {
      const next = prev.map(s => ({ ...s, height_cm: each }));
      pushHistory({ shelves: next, gondolaWidthCm: gondolaWidthCmRef.current });
      return next;
    });
  };

  const handleShelfCountChange = (delta: number) => {
    if (delta > 0) {
      addShelf();
    } else if (delta < 0 && shelves.length > 1) {
      deleteShelf(shelves[shelves.length - 1].id);
    }
  };

  // ── Template-panel helpers ────────────────────────────────────────────────
  const loadTemplate = useCallback((template: PlanogramTemplate) => {
    setShelves(prev => {
      const next = template.shelves.map(t => ({ id: nextId++, width_cm: gondolaWidthCmRef.current, height_cm: t.height_cm, depth_cm: t.depth_cm, items: [] }));
      pushHistory({ shelves: next, gondolaWidthCm: gondolaWidthCmRef.current });
      return next;
    });
    setSelectedShelfId(null);
  }, [pushHistory]);

  const saveUserTemplate = useCallback((name: string) => {
    setUserTemplates(prev => [...prev, { name, shelves: shelves.map(s => ({ width_cm: s.width_cm, height_cm: s.height_cm, depth_cm: s.depth_cm })) }]);
  }, [shelves]);

  const deleteUserTemplate = useCallback((index: number) => {
    setUserTemplates(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ── Save / render / back ──────────────────────────────────────────────────
  const handleSaveTemplate = () => {
    setTriedSave(true);
    if (!templateName.trim()) return;
    onSave(templateName.trim(), shelves, gondolaWidthCm, ignoreFacing, ignorePosition, ignorePriceTags, ignoreShelfTalker, standType);
  };

  const handleProRender = async () => {
    setIsCapturing(true);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    setShowRenderModal(true);
  };

  const handleModalClose = () => { setShowRenderModal(false); setIsCapturing(false); };

  const handleBackClick = () => {
    if (confirmOnBack) { setShowBackConfirm(true); } else { onBack(); }
  };

  const nameInvalid = triedSave && !templateName.trim();
  const stCfg = STAND_COLORS[standType];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: '#f5f5f7' }}
        onClick={() => setSelectedShelfId(null)}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ background: 'white', borderBottom: '1px solid #e8e8ec', flexShrink: 0, zIndex: 50 }}>

          {/* Row 1: back + name + actions */}
          <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #f0f0f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              <button onClick={handleBackClick} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', background: '#f5f5f7', border: '1.5px solid #e8e8ec', borderRadius: 8, fontSize: 12.5, fontWeight: 500, color: '#4a4a5a', cursor: 'pointer', flexShrink: 0 }}>
                <ArrowLeft size={14} /> Templates
              </button>
              <div style={{ width: 1, height: 28, background: '#e8e8ec', flexShrink: 0 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutGrid size={14} color="white" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e' }}>
                  {initialTemplate ? 'Edit Template' : 'New Template'}
                </span>
              </div>
              <div style={{ flex: 1, maxWidth: 340, minWidth: 0 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    value={templateName}
                    onChange={e => { setTemplateName(e.target.value); setTriedSave(false); }}
                    placeholder="Template name (required)"
                    style={{
                      width: '100%', height: 36, padding: '0 12px',
                      fontSize: 13.5, fontWeight: 500, color: '#1a1a2e',
                      background: nameInvalid ? '#fff5f5' : '#f8f8fb',
                      border: `1.5px solid ${nameInvalid ? '#ef4444' : templateName.trim() ? '#4f6ef7' : '#e0e0ea'}`,
                      borderRadius: 8, outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
                    }}
                    onFocus={e => { if (!nameInvalid) e.currentTarget.style.borderColor = '#4f6ef7'; }}
                    onBlur={e => { if (!templateName.trim() && !nameInvalid) e.currentTarget.style.borderColor = '#e0e0ea'; }}
                  />
                  {nameInvalid && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, fontSize: 10.5, color: '#ef4444', marginTop: 3, fontWeight: 500 }}>
                      Template name is required
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#b0b0c8', flexShrink: 0 }}>
                {shelves.length} shelf{shelves.length !== 1 ? 'ves' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button onClick={e => { e.stopPropagation(); addShelf(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', background: 'white', border: '1.5px solid #e8e8ec', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#4a4a5a', cursor: 'pointer' }}>
                <Plus size={14} /> Add Shelf
              </button>
              <button onClick={e => { e.stopPropagation(); handleProRender(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d50 100%)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                <Camera size={14} /> Pro Render
              </button>
              <button onClick={e => { e.stopPropagation(); handleSaveTemplate(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#4f6ef7', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,110,247,0.35)' }}>
                <Check size={14} strokeWidth={2.5} />
                {initialTemplate ? 'Update Template' : 'Save Template'}
              </button>
            </div>
          </div>

          {/* Row 2: Gondola Settings */}
          <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0f0f5' }}>
            <SlidersHorizontal size={13} color="#9090a8" />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#a0a0b8', textTransform: 'uppercase', letterSpacing: '0.09em', marginRight: 2 }}>
              Gondola Settings
            </span>

            {/* Stand type (locked) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: stCfg.bg, borderRadius: 20, border: `1.5px solid ${stCfg.color}30` }}>
              <Lock size={10} color={stCfg.color} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: stCfg.color }}>
                {STAND_LABELS[standType]}
              </span>
            </div>

            <div style={{ width: 1, height: 18, background: '#e8e8ec' }} />

            {/* Width */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11.5, color: '#6a6a7a', fontWeight: 500 }}>Width</span>
              <input
                type="number" min={40} max={300}
                value={gondolaWidthCm}
                onChange={e => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 40 && v <= 300) handleWidthChange(v);
                }}
                style={{ width: 58, height: 28, padding: '0 7px', fontSize: 12, fontWeight: 600, color: '#1a1a2e', border: '1.5px solid #e0e0ea', borderRadius: 7, outline: 'none', textAlign: 'center' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#4f6ef7')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e0e0ea')}
              />
              <span style={{ fontSize: 11, color: '#a0a0b0' }}>cm</span>
            </div>

            <div style={{ width: 1, height: 18, background: '#e8e8ec' }} />

            {/* Height */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11.5, color: '#6a6a7a', fontWeight: 500 }}>Height</span>
              <input
                type="number" min={50} max={400}
                value={totalHeightCm}
                onChange={e => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) applyTotalHeight(v);
                }}
                style={{ width: 58, height: 28, padding: '0 7px', fontSize: 12, fontWeight: 600, color: '#1a1a2e', border: '1.5px solid #e0e0ea', borderRadius: 7, outline: 'none', textAlign: 'center' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#4f6ef7')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e0e0ea')}
              />
              <span style={{ fontSize: 11, color: '#a0a0b0' }}>cm</span>
            </div>

            <div style={{ width: 1, height: 18, background: '#e8e8ec' }} />

            {/* Shelf count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11.5, color: '#6a6a7a', fontWeight: 500 }}>Shelves</span>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f7', border: '1.5px solid #e0e0ea', borderRadius: 7, overflow: 'hidden' }}>
                <button
                  onClick={() => handleShelfCountChange(-1)}
                  disabled={shelves.length <= 1}
                  style={{ width: 26, height: 28, border: 'none', background: 'transparent', cursor: shelves.length > 1 ? 'pointer' : 'not-allowed', fontSize: 16, color: shelves.length > 1 ? '#4a4a5a' : '#c0c0cc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  −
                </button>
                <span style={{ minWidth: 24, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#1a1a2e' }}>
                  {shelves.length}
                </span>
                <button
                  onClick={() => handleShelfCountChange(1)}
                  style={{ width: 26, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#4a4a5a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Analysis exception toggles */}
          <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#a0a0b8', textTransform: 'uppercase', letterSpacing: '0.09em', marginRight: 6, flexShrink: 0 }}>
              Analysis Exceptions
            </span>
            <div style={{ display: 'flex', alignItems: 'center', padding: '5px 12px', background: ignoreFacing ? '#f0f2ff' : '#f8f8fb', border: `1.5px solid ${ignoreFacing ? '#c0caff' : '#e8e8ec'}`, borderRadius: 20, transition: 'all 0.15s' }}>
              <Toggle value={ignoreFacing} onChange={setIgnoreFacing} label="Ignore Facing %" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '5px 12px', background: ignorePosition ? '#f0f2ff' : '#f8f8fb', border: `1.5px solid ${ignorePosition ? '#c0caff' : '#e8e8ec'}`, borderRadius: 20, transition: 'all 0.15s' }}>
              <Toggle value={ignorePosition} onChange={setIgnorePosition} label="Ignore Position %" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '5px 12px', background: ignorePriceTags ? '#f0f2ff' : '#f8f8fb', border: `1.5px solid ${ignorePriceTags ? '#c0caff' : '#e8e8ec'}`, borderRadius: 20, transition: 'all 0.15s' }}>
              <Toggle value={ignorePriceTags} onChange={setIgnorePriceTags} label="Ignore Price Tags" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '5px 12px', background: ignoreShelfTalker ? '#f0f2ff' : '#f8f8fb', border: `1.5px solid ${ignoreShelfTalker ? '#c0caff' : '#e8e8ec'}`, borderRadius: 20, transition: 'all 0.15s' }}>
              <Toggle value={ignoreShelfTalker} onChange={setIgnoreShelfTalker} label="Ignore Shelf Talker" />
            </div>
            {(ignoreFacing || ignorePosition || ignorePriceTags || ignoreShelfTalker) && (
              <span style={{ fontSize: 11, color: '#7070c0', marginLeft: 4, fontStyle: 'italic' }}>
                Compliance score will exclude {[ignoreFacing && 'facing', ignorePosition && 'position', ignorePriceTags && 'price tags', ignoreShelfTalker && 'shelf talker'].filter(Boolean).join(' & ')} metrics
              </span>
            )}
          </div>
        </div>

        {/* ── Main 3-column layout ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <ProductCatalog />

          {/* CENTER */}
          <div
            style={{ flex: 1, overflow: 'auto', padding: '60px 80px 100px', background: '#f0f1f5', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', position: 'relative' }}
            onClick={() => setSelectedShelfId(null)}
          >
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'radial-gradient(circle, rgba(79,110,247,0.10) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

            {shelves.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, position: 'relative', zIndex: 1 }}>
                <LayoutGrid size={52} color="#d0d0e0" strokeWidth={1} />
                <p style={{ fontSize: 15, color: '#a0a0b8', fontWeight: 500 }}>No shelves yet</p>
                <button onClick={e => { e.stopPropagation(); addShelf(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', background: '#4f6ef7', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <Plus size={14} /> Add First Shelf
                </button>
              </div>
            ) : (
              <div ref={renderStageRef} style={{ position: 'relative', zIndex: 1, display: 'inline-block', ...(isCapturing ? { padding: '52px 68px 0', background: 'linear-gradient(175deg, #ece8df 0%, #f4f1ea 45%, #ede9e1 100%)' } : {}) }}>
                {isCapturing && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110, background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)', pointerEvents: 'none' }} />
                )}
                <GondolaUnit
                  ref={gondolaRef}
                  shelves={shelves}
                  gondolaWidthCm={gondolaWidthCm}
                  depth_cm={60}
                  selectedShelfId={selectedShelfId}
                  onSelectShelf={setSelectedShelfId}
                  onUpdateShelf={updateShelf}
                  onDeleteShelf={deleteShelf}
                  onWidthChange={handleWidthChange}
                  onTotalHeightChange={applyTotalHeight}
                  isCapturing={isCapturing}
                  standType={standType}
                />
                {isCapturing && (
                  <div style={{ width: '100%', height: 44, background: 'linear-gradient(180deg, #ccc8c0 0%, #c2beb6 60%, #b8b4ac 100%)', borderTop: '2px solid #a8a49c', boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.18)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: '100%', background: 'radial-gradient(ellipse 80% 120% at 50% 0%, rgba(0,0,0,0.28) 0%, transparent 70%)' }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Settings + Templates */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <TemplatesPanel
              userTemplates={userTemplates}
              shelves={shelves}
              onLoad={loadTemplate}
              onSave={saveUserTemplate}
              onDeleteUser={deleteUserTemplate}
            />
          </div>
        </div>

        {showRenderModal && (
          <RenderModal targetRef={renderStageRef} onClose={handleModalClose} />
        )}

        <DragLayerPreview />

        {/* ── Back confirmation dialog ─────────────────────────────────── */}
        {showBackConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
            onClick={() => setShowBackConfirm(false)}>
            <div
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 16, padding: '28px 32px', maxWidth: 420, width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}
            >
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', border: '1.5px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={20} color="#f97316" strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 5 }}>Leave designer?</div>
                  <div style={{ fontSize: 13, color: '#5a5a6a', lineHeight: 1.6 }}>
                    Your current progress will be lost. Are you sure you want to go back and change the stand type?
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowBackConfirm(false)}
                  style={{ padding: '8px 18px', background: '#f5f5f7', border: '1.5px solid #e8e8ec', borderRadius: 9, fontSize: 13, fontWeight: 500, color: '#4a4a5a', cursor: 'pointer' }}
                >
                  Stay
                </button>
                <button
                  onClick={() => { setShowBackConfirm(false); onBack(); }}
                  style={{ padding: '8px 18px', background: '#ef4444', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}
                >
                  Leave &amp; Change Type
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
