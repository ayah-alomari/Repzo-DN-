import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { StandType } from './types';

// ── Stand-type card icons ──────────────────────────────────────────────────────

function WallRackIcon() {
  return (
    <svg width="64" height="72" viewBox="0 0 64 72" style={{ display: 'block', margin: '0 auto 12px' }}>
      {/* Left post */}
      <rect x="4" y="4" width="6" height="64" rx="2" fill="#b0b8c4" />
      {/* Right post */}
      <rect x="54" y="4" width="6" height="64" rx="2" fill="#b0b8c4" />
      {/* Back panel */}
      <rect x="10" y="4" width="44" height="64" fill="#dde0e6" rx="1" />
      {/* Peg holes */}
      {[14, 22, 30, 38, 46, 54].map(y => (
        <g key={y}>
          <circle cx="18" cy={y} r="1.5" fill="#b0b8c4" />
          <circle cx="46" cy={y} r="1.5" fill="#b0b8c4" />
        </g>
      ))}
      {/* Shelf 1 */}
      <rect x="10" y="19" width="44" height="4" rx="1" fill="#8d9aaa" />
      <rect x="10" y="23" width="44" height="2" fill="#6a7585" />
      {/* Shelf 2 */}
      <rect x="10" y="36" width="44" height="4" rx="1" fill="#8d9aaa" />
      <rect x="10" y="40" width="44" height="2" fill="#6a7585" />
      {/* Shelf 3 */}
      <rect x="10" y="53" width="44" height="4" rx="1" fill="#8d9aaa" />
      <rect x="10" y="57" width="44" height="2" fill="#6a7585" />
      {/* Base */}
      <rect x="2" y="66" width="60" height="6" rx="2" fill="#8d9aaa" />
    </svg>
  );
}

function CoolerIcon() {
  return (
    <svg width="64" height="72" viewBox="0 0 64 72" style={{ display: 'block', margin: '0 auto 12px' }}>
      <defs>
        <linearGradient id="coo-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e3f2fd" />
          <stop offset="100%" stopColor="#bbdefb" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* Frame */}
      <rect x="2" y="2" width="60" height="68" rx="5" fill="#1565c0" />
      {/* Inner bezel */}
      <rect x="6" y="6" width="52" height="54" rx="3" fill="#0d47a1" />
      {/* Glass door */}
      <rect x="8" y="8" width="48" height="50" rx="2" fill="url(#coo-glass)" opacity="0.85" />
      {/* Glass glare streak */}
      <path d="M11,10 Q16,18 14,54" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.3" fill="none" />
      {/* Shelf lines */}
      <line x1="10" y1="25" x2="54" y2="25" stroke="#64b5f6" strokeWidth="1.2" opacity="0.7" />
      <line x1="10" y1="40" x2="54" y2="40" stroke="#64b5f6" strokeWidth="1.2" opacity="0.7" />
      {/* Door handle */}
      <rect x="27" y="33" width="10" height="2.5" rx="1.2" fill="#90caf9" />
      {/* Base / compressor */}
      <rect x="6" y="62" width="52" height="8" rx="3" fill="#0a3580" />
      {/* Vents */}
      {[14, 22, 30, 38, 46].map(x => (
        <line key={x} x1={x} y1="64" x2={x} y2="68" stroke="#1976d2" strokeWidth="1" opacity="0.5" />
      ))}
    </svg>
  );
}

function FSDUIcon() {
  return (
    <svg width="52" height="72" viewBox="0 0 52 72" style={{ display: 'block', margin: '0 auto 12px' }}>
      {/* Banner top */}
      <rect x="1" y="1" width="50" height="15" rx="3" fill="#e04000" />
      <rect x="1" y="1" width="50" height="7" rx="3" fill="#ff6b35" opacity="0.5" />
      <text x="26" y="12" textAnchor="middle" fontSize="6" fontFamily="Arial" fontWeight="900" fill="white" letterSpacing="0.5">BANNER</text>
      {/* Left post */}
      <rect x="1" y="16" width="5" height="55" rx="1" fill="#9aabb8" />
      {/* Right post */}
      <rect x="46" y="16" width="5" height="55" rx="1" fill="#9aabb8" />
      {/* Back */}
      <rect x="6" y="16" width="40" height="55" fill="#dde0e6" />
      {/* Shelf 1 */}
      <rect x="6" y="29" width="40" height="3.5" rx="1" fill="#8d9aaa" />
      {/* Shelf 2 */}
      <rect x="6" y="43" width="40" height="3.5" rx="1" fill="#8d9aaa" />
      {/* Shelf 3 */}
      <rect x="6" y="57" width="40" height="3.5" rx="1" fill="#8d9aaa" />
      {/* Feet/wheels */}
      <circle cx="12" cy="71" r="3" fill="#707880" />
      <circle cx="40" cy="71" r="3" fill="#707880" />
    </svg>
  );
}

// ── Stand type config ──────────────────────────────────────────────────────────
const STAND_TYPES: Array<{
  type: StandType;
  label: string;
  description: string;
  accentColor: string;
  icon: JSX.Element;
}> = [
  {
    type: 'wall',
    label: 'Wall Rack',
    description: 'Standard open metal shelving unit with adjustable shelves',
    accentColor: '#546e7a',
    icon: <WallRackIcon />,
  },
  {
    type: 'cooler',
    label: 'Cooler',
    description: 'Refrigerated display unit with glass door and blue-lit interior',
    accentColor: '#1565c0',
    icon: <CoolerIcon />,
  },
  {
    type: 'fsdu',
    label: 'FSDU',
    description: 'Free Standing Display Unit with promotional banner at the top',
    accentColor: '#e04000',
    icon: <FSDUIcon />,
  },
];

// ── Props ──────────────────────────────────────────────────────────────────────
interface SetupPageProps {
  onBack: () => void;
  onStart: (name: string, standType: StandType) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SetupPage({ onBack, onStart }: SetupPageProps) {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<StandType | null>(null);
  const [triedStart, setTriedStart] = useState(false);

  const nameInvalid = triedStart && !name.trim();
  const typeInvalid = triedStart && !selectedType;

  const handleStart = () => {
    setTriedStart(true);
    if (!name.trim() || !selectedType) return;
    onStart(name.trim(), selectedType);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: '#f5f5f7' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e8e8ec',
        padding: '13px 24px', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 11px', background: '#f5f5f7',
            border: '1.5px solid #e8e8ec', borderRadius: 8,
            fontSize: 12.5, fontWeight: 500, color: '#4a4a5a', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} /> Templates
        </button>
        <span style={{ color: '#c0c0cc', fontSize: 14 }}>/</span>
        <span style={{ fontSize: 13, color: '#6a6a7a', fontWeight: 500 }}>New Template</span>
      </div>

      {/* ── Scrollable content ──────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '48px 28px 60px' }}>
        <div style={{ width: '100%', maxWidth: 700 }}>

          {/* Heading */}
          <div style={{ marginBottom: 36, textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
              background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>
              Set up your planogram
            </h1>
            <p style={{ fontSize: 13.5, color: '#6a6a7a', margin: 0, lineHeight: 1.6 }}>
              Choose a stand type and name your template before you start designing.
            </p>
          </div>

          {/* ── Step 1: Name ────────────────────────────────────────── */}
          <div style={{
            background: 'white', borderRadius: 14, border: '1px solid #e8e8ec',
            padding: '22px 24px', marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#4f6ef7', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>1</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Template Name</span>
              <span style={{ fontSize: 11, color: '#e04444', fontWeight: 600 }}>Required</span>
            </div>
            <input
              autoFocus
              value={name}
              onChange={e => { setName(e.target.value); setTriedStart(false); }}
              onKeyDown={e => { if (e.key === 'Enter') handleStart(); }}
              placeholder="e.g. Beverages Section A, Dairy Cooler Unit…"
              style={{
                width: '100%', height: 44,
                padding: '0 14px',
                fontSize: 14, color: '#1a1a2e',
                background: nameInvalid ? '#fff5f5' : '#f8f8fb',
                border: `1.5px solid ${nameInvalid ? '#ef4444' : name.trim() ? '#4f6ef7' : '#e0e0ea'}`,
                borderRadius: 9, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onFocus={e => { if (!nameInvalid) e.currentTarget.style.borderColor = '#4f6ef7'; }}
              onBlur={e => { if (!name.trim() && !nameInvalid) e.currentTarget.style.borderColor = '#e0e0ea'; }}
            />
            {nameInvalid && (
              <p style={{ fontSize: 11, color: '#ef4444', margin: '5px 0 0', fontWeight: 500 }}>
                Template name is required
              </p>
            )}
          </div>

          {/* ── Step 2: Stand Type ──────────────────────────────────── */}
          <div style={{
            background: 'white', borderRadius: 14, border: `1px solid ${typeInvalid ? '#fca5a5' : '#e8e8ec'}`,
            padding: '22px 24px', marginBottom: 28,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: selectedType ? '#4f6ef7' : typeInvalid ? '#ef4444' : '#9090a8',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                transition: 'background 0.15s',
              }}>2</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Stand Type</span>
              <span style={{ fontSize: 11, color: '#e04444', fontWeight: 600 }}>Required</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              {STAND_TYPES.map(({ type, label, description, accentColor, icon }) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); setTriedStart(false); }}
                    style={{
                      position: 'relative',
                      padding: '20px 14px 18px',
                      background: isSelected ? `${accentColor}0d` : 'white',
                      border: `2px solid ${isSelected ? accentColor : '#e8e8ec'}`,
                      borderRadius: 12,
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.14s',
                      boxShadow: isSelected ? `0 0 0 3px ${accentColor}22` : '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = accentColor + '80'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#e8e8ec'; }}
                  >
                    {/* Checkmark */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 20, height: 20, borderRadius: '50%',
                        background: accentColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check size={11} color="white" strokeWidth={3} />
                      </div>
                    )}
                    {icon}
                    <div style={{
                      fontSize: 14, fontWeight: 700,
                      color: isSelected ? accentColor : '#1a1a2e',
                      marginBottom: 6, transition: 'color 0.14s',
                    }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#7a7a8a', lineHeight: 1.5 }}>
                      {description}
                    </div>
                  </button>
                );
              })}
            </div>

            {typeInvalid && (
              <p style={{ fontSize: 11, color: '#ef4444', margin: '12px 0 0', fontWeight: 500 }}>
                Please select a stand type to continue
              </p>
            )}
          </div>

          {/* ── Start button ────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleStart}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '12px 28px',
                background: name.trim() && selectedType
                  ? 'linear-gradient(135deg, #4f6ef7, #7c3aed)'
                  : '#e0e0ea',
                color: name.trim() && selectedType ? 'white' : '#a0a0b0',
                border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: name.trim() && selectedType ? 'pointer' : 'default',
                boxShadow: name.trim() && selectedType ? '0 4px 16px rgba(79,110,247,0.4)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              Start Designing
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
