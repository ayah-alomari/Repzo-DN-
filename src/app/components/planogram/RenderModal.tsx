import { useEffect, useRef, useState } from 'react';
import { X, Download } from 'lucide-react';

interface RenderModalProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export function RenderModal({ targetRef, onClose }: RenderModalProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const el = targetRef.current;
    if (!el) {
      setError('Capture target not found.');
      return;
    }

    // html-to-image uses the browser's own rendering engine (foreignObject SVG),
    // so it natively handles oklch, CSS variables, and modern CSS — no custom
    // color parser means no Tailwind v4 compatibility issues.
    import('html-to-image').then(({ toPng }) => {
      toPng(el, {
        pixelRatio: 2,
        backgroundColor: '#f5f5f7',
        // Skip the backdrop modal itself (not part of gondola)
        filter: (node: Element) => {
          // Remove any fixed/absolute overlays that aren't part of the gondola
          if (node.nodeType === 1) {
            const el = node as HTMLElement;
            const pos = el.style?.position;
            if (pos === 'fixed') return false;
          }
          return true;
        },
      })
        .then(url => setDataUrl(url))
        .catch(err => {
          console.error('[RenderModal] capture error:', err);
          setError(`Capture failed: ${err?.message ?? String(err)}`);
        });
    }).catch(err => {
      setError(`Failed to load renderer: ${err?.message ?? String(err)}`);
    });
  }, [targetRef]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `planogram-render-${Date.now()}.png`;
    a.click();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,10,20,0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 420,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Pro Render</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>
              High-resolution PNG · 2×
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflow: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: dataUrl ? 0 : 60,
          background: dataUrl ? '#12121c' : 'white',
          minHeight: 200,
        }}>
          {!dataUrl && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                border: '3px solid #e8e8ec',
                borderTopColor: '#4f6ef7',
                animation: 'gu-spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes gu-spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4a4a5a' }}>Generating Render…</div>
              <div style={{ fontSize: 11, color: '#9090a8' }}>Capturing gondola at 2× resolution</div>
            </div>
          )}
          {error && (
            <div style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', padding: 24, maxWidth: 360 }}>
              {error}
            </div>
          )}
          {dataUrl && (
            <img
              src={dataUrl}
              alt="Planogram render"
              style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 130px)', display: 'block' }}
            />
          )}
        </div>

        {/* Footer */}
        {dataUrl && (
          <div style={{
            padding: '12px 18px', background: 'white', borderTop: '1px solid #e8e8ec',
            display: 'flex', gap: 8, justifyContent: 'flex-end',
          }}>
            <button onClick={onClose} style={{
              padding: '7px 14px', fontSize: 12.5, fontWeight: 500,
              color: '#6a6a7a', background: '#f5f5f7',
              border: '1px solid #e8e8ec', borderRadius: 8, cursor: 'pointer',
            }}>Close</button>
            <button onClick={download} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', fontSize: 12.5, fontWeight: 600,
              color: 'white', background: '#4f6ef7',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79,110,247,0.4)',
            }}>
              <Download size={14} />
              Download PNG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
