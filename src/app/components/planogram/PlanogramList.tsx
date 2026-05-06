import { useState, useMemo } from 'react';
import { Plus, Search, LayoutGrid, Pencil, Trash2, Layers, Copy } from 'lucide-react';
import { SavedPlanogram, StandType } from './types';

const STAND_BADGE: Record<StandType, { label: string; color: string; bg: string }> = {
  wall:   { label: 'Wall',   color: '#546e7a', bg: '#eceff1' },
  cooler: { label: 'Cooler', color: '#1565c0', bg: '#e3f2fd' },
  fsdu:   { label: 'FSDU',   color: '#e04000', bg: '#fff3e0' },
};
import { BOARD_CM, TOP_CM, BASE_CM } from './GondolaUnit';

function totalHeightCm(t: SavedPlanogram): number {
  const shelvesH = t.shelves.reduce((s, sh) => s + sh.height_cm, 0);
  return Math.round(TOP_CM + shelvesH + t.shelves.length * BOARD_CM + BASE_CM);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function getCloneName(name: string, templates: SavedPlanogram[]): string {
  const base = name.replace(/ - clone #\d+$/, '');
  const existing = templates
    .map(t => t.name)
    .filter(n => n === `${base} - clone #1` || /^.+ - clone #\d+$/.test(n))
    .map(n => {
      const m = n.match(/ - clone #(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    });
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${base} - clone #${next}`;
}

interface Props {
  templates: SavedPlanogram[];
  onCreate: () => void;
  onEdit: (t: SavedPlanogram) => void;
  onDelete: (id: string) => void;
  onClone: (t: SavedPlanogram) => void;
}

export function PlanogramList({ templates, onCreate, onEdit, onDelete, onClone }: Props) {
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return templates;
    return templates.filter(t => {
      const h = totalHeightCm(t);
      return (
        t.name.toLowerCase().includes(q) ||
        formatDate(t.createdAt).toLowerCase().includes(q) ||
        `${t.gondolaWidthCm}`.includes(q) ||
        `${h}`.includes(q) ||
        `${t.shelves.length}`.includes(q) ||
        'shelf shelves'.includes(q)
      );
    });
  }, [templates, search]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: '#f5f5f7' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e8e8ec',
        padding: '18px 28px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <LayoutGrid size={18} color="white" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }}>
              Planogram Templates
            </div>
            <div style={{ fontSize: 11.5, color: '#8b8b9e', marginTop: 2 }}>
              Design and manage shelf layouts for your retail locations
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14} color="#9090a8"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates…"
              style={{
                paddingLeft: 32, paddingRight: 12, height: 36,
                border: '1.5px solid #e8e8ec', borderRadius: 9,
                fontSize: 13, color: '#1a1a2e', background: '#f9f9fb',
                outline: 'none', width: 220,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#4f6ef7')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e8e8ec')}
            />
          </div>

          {/* Create button */}
          <button
            onClick={onCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '0 18px', height: 36,
              background: '#4f6ef7', color: 'white',
              border: 'none', borderRadius: 9,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79,110,247,0.35)',
              transition: 'background 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#3d5de8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#4f6ef7')}
          >
            <Plus size={15} strokeWidth={2.5} />
            Create Template
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px' }}>

        {templates.length === 0 ? (
          /* Empty state */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 14, paddingBottom: 60,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: 'linear-gradient(135deg, #eef0ff, #f3f0ff)',
              border: '1.5px solid #e0e0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Layers size={30} color="#9090c8" strokeWidth={1.5} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2a2a4a', marginBottom: 6 }}>
                No templates yet
              </div>
              <div style={{ fontSize: 13, color: '#9090a8', lineHeight: 1.6, maxWidth: 300 }}>
                Create your first planogram template to design shelf layouts for your team.
              </div>
            </div>
            <button
              onClick={onCreate}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 22px', background: '#4f6ef7', color: 'white',
                border: 'none', borderRadius: 9,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(79,110,247,0.35)',
                marginTop: 4,
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Create First Template
            </button>
          </div>
        ) : (
          <div style={{
            background: 'white', borderRadius: 14,
            border: '1px solid #e8e8ec',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            {/* Search results count */}
            {search && (
              <div style={{
                padding: '10px 20px', background: '#f9f9fb',
                borderBottom: '1px solid #e8e8ec',
                fontSize: 12, color: '#6a6a7a',
              }}>
                {filtered.length === 0
                  ? 'No templates match your search'
                  : `${filtered.length} of ${templates.length} template${templates.length !== 1 ? 's' : ''}`}
              </div>
            )}

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 150px 160px 200px 112px',
              padding: '11px 20px',
              background: '#f9f9fb',
              borderBottom: '1px solid #e8e8ec',
            }}>
              {['Template Name', 'Created', 'Dimensions', 'Analysis Exceptions', ''].map((col, i) => (
                <div key={i} style={{
                  fontSize: 11, fontWeight: 700, color: '#8b8b9e',
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  textAlign: i === 4 ? 'right' : 'left',
                }}>
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9090a8', fontSize: 13 }}>
                No templates match "{search}"
              </div>
            ) : (
              filtered.map((t, idx) => {
                const h = totalHeightCm(t);
                const isLast = idx === filtered.length - 1;
                const isDeleting = deleteConfirm === t.id;

                return (
                  <div
                    key={t.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 150px 160px 200px 112px',
                      padding: '14px 20px',
                      borderBottom: isLast ? 'none' : '1px solid #f0f0f5',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                      background: isDeleting ? '#fff5f5' : 'white',
                      alignItems: 'center',
                    }}
                    onClick={() => !isDeleting && onEdit(t)}
                    onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = '#f8f8fc'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isDeleting ? '#fff5f5' : 'white'; }}
                  >
                    {/* Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg, #eef0ff 0%, #e8e4ff 100%)',
                        border: '1px solid #dddaff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <LayoutGrid size={15} color="#6060c8" strokeWidth={2} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.name}
                          </div>
                          {t.standType && (() => {
                            const b = STAND_BADGE[t.standType];
                            return (
                              <span style={{ fontSize: 10, fontWeight: 700, color: b.color, background: b.bg, padding: '1px 7px', borderRadius: 10, flexShrink: 0 }}>
                                {b.label}
                              </span>
                            );
                          })()}
                        </div>
                        <div style={{ fontSize: 11, color: '#9090a8', marginTop: 2 }}>
                          {t.shelves.length} shelf{t.shelves.length !== 1 ? 'ves' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Created */}
                    <div style={{ fontSize: 13, color: '#5a5a6a' }}>
                      {formatDate(t.createdAt)}
                    </div>

                    {/* Dimensions */}
                    <div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 12.5, fontWeight: 500, color: '#4a4a6a',
                        background: '#f3f3f9', border: '1px solid #e4e4f0',
                        padding: '3px 10px', borderRadius: 20,
                      }}>
                        {t.gondolaWidthCm} × {h} cm
                      </span>
                    </div>

                    {/* Analysis Exceptions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      {!t.ignoreFacing && !t.ignorePosition ? (
                        <span style={{
                          fontSize: 11.5, color: '#22c55e', fontWeight: 500,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#22c55e', display: 'inline-block',
                          }} />
                          Full analysis
                        </span>
                      ) : (
                        <>
                          {t.ignoreFacing && (
                            <span style={{
                              fontSize: 11, fontWeight: 600, color: '#d97706',
                              background: '#fffbeb', border: '1px solid #fde68a',
                              padding: '2px 8px', borderRadius: 20,
                            }}>
                              Ignore Facing
                            </span>
                          )}
                          {t.ignorePosition && (
                            <span style={{
                              fontSize: 11, fontWeight: 600, color: '#d97706',
                              background: '#fffbeb', border: '1px solid #fde68a',
                              padding: '2px 8px', borderRadius: 20,
                            }}>
                              Ignore Position
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}
                      onClick={e => e.stopPropagation()}
                    >
                      {isDeleting ? (
                        <>
                          <button
                            onClick={() => { onDelete(t.id); setDeleteConfirm(null); }}
                            style={{
                              fontSize: 11.5, fontWeight: 600, color: 'white',
                              background: '#ef4444', border: 'none', borderRadius: 6,
                              padding: '4px 10px', cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              fontSize: 11.5, color: '#6a6a7a',
                              background: '#f0f0f5', border: 'none', borderRadius: 6,
                              padding: '4px 10px', cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onClone(t)}
                            title="Clone template"
                            style={{
                              width: 30, height: 30, borderRadius: 7,
                              border: '1.5px solid #e4e4f0', background: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'border-color 0.12s, background 0.12s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#22c55e';
                              e.currentTarget.style.background = '#f0fdf4';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#e4e4f0';
                              e.currentTarget.style.background = 'white';
                            }}
                          >
                            <Copy size={13} color="#22c55e" />
                          </button>
                          <button
                            onClick={() => onEdit(t)}
                            title="Edit template"
                            style={{
                              width: 30, height: 30, borderRadius: 7,
                              border: '1.5px solid #e4e4f0', background: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'border-color 0.12s, background 0.12s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#4f6ef7';
                              e.currentTarget.style.background = '#f0f2ff';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#e4e4f0';
                              e.currentTarget.style.background = 'white';
                            }}
                          >
                            <Pencil size={13} color="#4f6ef7" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(t.id)}
                            title="Delete template"
                            style={{
                              width: 30, height: 30, borderRadius: 7,
                              border: '1.5px solid #e4e4f0', background: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'border-color 0.12s, background 0.12s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#fca5a5';
                              e.currentTarget.style.background = '#fff5f5';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#e4e4f0';
                              e.currentTarget.style.background = 'white';
                            }}
                          >
                            <Trash2 size={13} color="#ef4444" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
