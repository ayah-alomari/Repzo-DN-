import { useState } from 'react';
import { Plus, X, Trash2, Layout } from 'lucide-react';
import { PlanogramTemplate, ShelfData } from './types';
import { BUILTIN_TEMPLATES } from './catalogData';

// Mini visual of a shelf layout for a template card
function ShelfPreview({ shelves }: { shelves: PlanogramTemplate['shelves'] }) {
  const maxW = Math.max(...shelves.map(s => s.width_cm), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 0 4px' }}>
      {shelves.map((shelf, i) => {
        const pct = (shelf.width_cm / maxW) * 100;
        return (
          <div key={i}>
            {/* Shelf product area */}
            <div style={{
              height: 10,
              width: `${pct}%`,
              background: 'linear-gradient(180deg, #fafaf0 0%, #f0ece0 100%)',
              border: '1px solid #d0c8b0',
              borderBottom: 'none',
              borderRadius: '2px 2px 0 0',
            }} />
            {/* Shelf board */}
            <div style={{
              height: 4,
              width: `${pct}%`,
              background: 'linear-gradient(180deg, #c8a878 0%, #a08050 100%)',
              borderRadius: '0 0 1px 1px',
            }} />
          </div>
        );
      })}
    </div>
  );
}

function TemplateCard({
  template,
  onLoad,
  onDelete,
}: {
  template: PlanogramTemplate;
  onLoad: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      onClick={onLoad}
      style={{
        background: 'white',
        border: '1.5px solid #e8e8ec',
        borderRadius: 9,
        padding: '9px 10px 8px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.1s',
      }}
      className="hover:border-[#4f6ef7] hover:shadow-md"
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3, flex: 1 }}>
          {template.name}
        </span>
        {onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{
              padding: 2, border: 'none', background: 'transparent',
              cursor: 'pointer', borderRadius: 4, flexShrink: 0, lineHeight: 1,
            }}
            title="Delete layout"
            className="hover:bg-red-50"
          >
            <Trash2 size={11} color="#ef4444" />
          </button>
        )}
      </div>

      {/* Preview */}
      <ShelfPreview shelves={template.shelves} />

      {/* Meta pills */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 9.5, color: '#6a6a7a', background: '#f3f3f7',
          padding: '2px 7px', borderRadius: 10, fontWeight: 500,
        }}>
          {template.shelves.length} shelf{template.shelves.length > 1 ? 'ves' : ''}
        </span>
        <span style={{
          fontSize: 9.5, color: '#6a6a7a', background: '#f3f3f7',
          padding: '2px 7px', borderRadius: 10, fontWeight: 500,
        }}>
          {template.shelves[0]?.width_cm ?? '—'} cm
        </span>
      </div>
    </div>
  );
}

interface TemplatesPanelProps {
  userTemplates: PlanogramTemplate[];
  shelves: ShelfData[];
  onLoad: (template: PlanogramTemplate) => void;
  onSave: (name: string) => void;
  onDeleteUser: (index: number) => void;
}

export function TemplatesPanel({
  userTemplates,
  shelves,
  onLoad,
  onSave,
  onDeleteUser,
}: TemplatesPanelProps) {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName('');
    setShowInput(false);
  };

  return (
    <div style={{
      width: 195,
      minWidth: 195,
      height: '100%',
      background: '#fafafa',
      borderLeft: '1px solid #e8e8ec',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Panel header */}
      <div style={{
        padding: '13px 12px 10px',
        borderBottom: '1px solid #e8e8ec',
        background: 'white',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'linear-gradient(135deg, #4f6ef7 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Layout size={14} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>Layouts</div>
            <div style={{ fontSize: 9.5, color: '#a0a0b0', marginTop: 1 }}>Click to apply</div>
          </div>
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 6px' }}>
        {/* Built-in section */}
        <div style={{
          fontSize: 9, fontWeight: 700, color: '#a0a0b8', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 7,
        }}>
          Built-in
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
          {BUILTIN_TEMPLATES.map((tmpl, i) => (
            <TemplateCard key={i} template={tmpl} onLoad={() => onLoad(tmpl)} />
          ))}
        </div>

        {/* User templates section */}
        {userTemplates.length > 0 && (
          <>
            <div style={{
              fontSize: 9, fontWeight: 700, color: '#a0a0b8', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 7,
            }}>
              My Layouts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
              {userTemplates.map((tmpl, i) => (
                <TemplateCard
                  key={i}
                  template={tmpl}
                  onLoad={() => onLoad(tmpl)}
                  onDelete={() => onDeleteUser(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Save current layout footer */}
      <div style={{
        borderTop: '1px solid #e8e8ec',
        padding: '10px 10px 12px',
        background: 'white',
        flexShrink: 0,
      }}>
        {showInput ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4a4a5a' }}>
              Name this layout
            </span>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowInput(false); }}
              placeholder="e.g. My Dairy Section"
              style={{
                width: '100%', padding: '5px 8px', fontSize: 11,
                border: '1.5px solid #4f6ef7', borderRadius: 6, outline: 'none',
                color: '#1a1a2e', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 5 }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1, padding: '5px 0', background: '#4f6ef7', color: 'white',
                  fontSize: 11, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={() => { setShowInput(false); setName(''); }}
                style={{
                  padding: '5px 7px', background: 'transparent', color: '#8b8b9e',
                  fontSize: 12, borderRadius: 6, border: '1px solid #e8e8ec',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                }}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '7px 0', fontSize: 11.5, fontWeight: 600,
              color: '#4f6ef7', background: '#f0f2ff',
              border: '1.5px dashed #b0beff', borderRadius: 8, cursor: 'pointer',
            }}
            className="hover:bg-[#e8ecff]"
          >
            <Plus size={13} />
            Save Current Layout
          </button>
        )}
      </div>
    </div>
  );
}
