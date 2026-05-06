// Realistic SVG front-face illustrations for each FMCG product

export function PepsiCanFace({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 46 86" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="pc-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00205e" />
          <stop offset="18%" stopColor="#003087" />
          <stop offset="50%" stopColor="#0042b0" />
          <stop offset="82%" stopColor="#003087" />
          <stop offset="100%" stopColor="#00205e" />
        </linearGradient>
        <linearGradient id="pc-red" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b0010" />
          <stop offset="18%" stopColor="#c8001a" />
          <stop offset="50%" stopColor="#e81830" />
          <stop offset="82%" stopColor="#c8001a" />
          <stop offset="100%" stopColor="#8b0010" />
        </linearGradient>
        <linearGradient id="pc-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b0b8d0" />
          <stop offset="100%" stopColor="#7888aa" />
        </linearGradient>
        <clipPath id="pc-clip">
          <rect x="2" y="5" width="42" height="76" rx="2" />
        </clipPath>
      </defs>

      {/* Can body - blue */}
      <rect x="2" y="5" width="42" height="76" rx="2" fill="url(#pc-body)" />

      {/* Red top section */}
      <rect x="2" y="5" width="42" height="34" fill="url(#pc-red)" clipPath="url(#pc-clip)" />

      {/* White wave divider between red and blue */}
      <path d="M2,32 Q14,24 23,28 Q32,32 44,24 L44,38 Q32,44 23,40 Q14,36 2,44 Z"
        fill="white" clipPath="url(#pc-clip)" />

      {/* Pepsi globe (circle logo) */}
      <circle cx="23" cy="58" r="14" fill="white" />
      {/* Top half of globe - red wave */}
      <path d="M9,58 A14,14 0 0 1 37,58 Q28,47 14,50 Z" fill="#E31837" />
      {/* Bottom half of globe - blue wave */}
      <path d="M9,58 A14,14 0 0 0 37,58 Q28,69 14,66 Z" fill="#003087" />
      {/* Globe outline */}
      <circle cx="23" cy="58" r="14" fill="none" stroke="rgba(200,200,200,0.5)" strokeWidth="0.5" />

      {/* "pepsi" wordmark */}
      <text x="23" y="80" textAnchor="middle" fontSize="7" fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold" fill="white" letterSpacing="0.5">pepsi</text>

      {/* Can top lid */}
      <ellipse cx="23" cy="5" rx="21" ry="5.5" fill="url(#pc-lid)" />
      {/* Pull tab */}
      <ellipse cx="23" cy="3.5" rx="5" ry="1.5" fill="#9098b0" />
      <rect x="21" y="1" width="4" height="3" rx="1" fill="#808898" />

      {/* Can bottom */}
      <ellipse cx="23" cy="81" rx="21" ry="5" fill="#223060" />

      {/* Highlight stripe (left edge cylinder effect) */}
      <path d="M4,8 Q3.5,43 4,78" stroke="white" strokeWidth="2.5" opacity="0.12"
        fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function CokeCanFace({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 46 86" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="cc-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#800010" />
          <stop offset="18%" stopColor="#bb0018" />
          <stop offset="50%" stopColor="#e31837" />
          <stop offset="82%" stopColor="#bb0018" />
          <stop offset="100%" stopColor="#800010" />
        </linearGradient>
        <linearGradient id="cc-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b0b8c8" />
          <stop offset="100%" stopColor="#788090" />
        </linearGradient>
        <clipPath id="cc-clip">
          <rect x="2" y="5" width="42" height="76" rx="2" />
        </clipPath>
      </defs>

      {/* Can body - red */}
      <rect x="2" y="5" width="42" height="76" rx="2" fill="url(#cc-body)" />

      {/* Bottom darker wave */}
      <path d="M2,56 Q14,48 23,54 Q32,60 44,52 L44,81 L2,81 Z"
        fill="#a00016" clipPath="url(#cc-clip)" />

      {/* White horizontal ribbon band */}
      <path d="M2,25 L44,25 L44,29 Q32,32 23,30 Q14,32 2,29 Z"
        fill="rgba(255,255,255,0.15)" clipPath="url(#cc-clip)" />

      {/* Coca-Cola script text */}
      <text x="23" y="40" textAnchor="middle" fontSize="8.5"
        fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic"
        fontWeight="bold" fill="white" letterSpacing="0.2">Coca-Cola</text>

      {/* Underline swoosh */}
      <path d="M8,44 Q23,40 38,44" fill="none" stroke="white" strokeWidth="0.9" opacity="0.55" />

      {/* "ORIGINAL TASTE" sub-text */}
      <text x="23" y="54" textAnchor="middle" fontSize="4.5" fontFamily="Arial"
        fontWeight="600" fill="white" opacity="0.85" letterSpacing="0.6">ORIGINAL TASTE</text>

      {/* Can top */}
      <ellipse cx="23" cy="5" rx="21" ry="5.5" fill="url(#cc-lid)" />
      <ellipse cx="23" cy="3.5" rx="5" ry="1.5" fill="#8890a0" />
      <rect x="21" y="1" width="4" height="3" rx="1" fill="#787880" />

      {/* Can bottom */}
      <ellipse cx="23" cy="81" rx="21" ry="5" fill="#780012" />

      {/* Highlight */}
      <path d="M4,8 Q3.5,43 4,78" stroke="white" strokeWidth="2.5" opacity="0.1"
        fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function LaysChipsFace({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 98 140" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="lays-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fad900" />
          <stop offset="100%" stopColor="#e8b800" />
        </linearGradient>
        <linearGradient id="lays-chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8a800" />
          <stop offset="50%" stopColor="#f5c830" />
          <stop offset="100%" stopColor="#d09000" />
        </linearGradient>
        <filter id="lays-shadow">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2" />
        </filter>
        <clipPath id="lays-clip">
          <path d="M15,3 Q49,0 83,3 L95,128 Q88,140 49,140 Q10,140 3,128 Z" />
        </clipPath>
      </defs>

      {/* Bag body */}
      <path d="M15,3 Q49,0 83,3 L95,128 Q88,140 49,140 Q10,140 3,128 Z"
        fill="url(#lays-bg)" filter="url(#lays-shadow)" />

      {/* Red header band */}
      <path d="M15,3 Q49,0 83,3 L80,48 Q49,54 18,48 Z"
        fill="#E31837" clipPath="url(#lays-clip)" />

      {/* LAY'S text */}
      <text x="49" y="37" textAnchor="middle" fontSize="22"
        fontFamily="'Arial Black', Impact, 'Helvetica Neue', sans-serif"
        fontWeight="900" fill="white" letterSpacing="0.5">LAY'S</text>

      {/* Chip oval */}
      <ellipse cx="49" cy="88" rx="27" ry="22" fill="url(#lays-chip)" />

      {/* Chip ridges (wavy texture) */}
      <path d="M28,82 Q38,77 49,80 Q60,77 70,82" fill="none" stroke="#c08000" strokeWidth="1.5" opacity="0.7" />
      <path d="M26,89 Q38,84 49,87 Q60,84 72,89" fill="none" stroke="#c08000" strokeWidth="1.5" opacity="0.7" />
      <path d="M28,96 Q38,91 49,94 Q60,91 70,96" fill="none" stroke="#c08000" strokeWidth="1.5" opacity="0.7" />

      {/* Chip gloss highlight */}
      <ellipse cx="40" cy="80" rx="8" ry="5" fill="white" opacity="0.2" transform="rotate(-20,40,80)" />

      {/* CLASSIC text at bottom */}
      <text x="49" y="125" textAnchor="middle" fontSize="9.5"
        fontFamily="Arial, sans-serif" fontWeight="bold" fill="#E31837" letterSpacing="1">CLASSIC</text>

      {/* Bag left highlight (light reflection) */}
      <path d="M20,14 Q26,8 30,55 Q26,57 22,52 Z" fill="white" opacity="0.14" />

      {/* Bag top crimp fold */}
      <path d="M15,3 Q32,7 49,5 Q66,7 83,3 Q80,9 49,8 Q18,9 15,3 Z"
        fill="rgba(0,0,0,0.1)" />
    </svg>
  );
}

export function ArwaWaterFace({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 45 147" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="arwa-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a9cc0" />
          <stop offset="22%" stopColor="#96d0ea" />
          <stop offset="50%" stopColor="#c8eaf8" stopOpacity="0.92" />
          <stop offset="78%" stopColor="#96d0ea" />
          <stop offset="100%" stopColor="#4a9cc0" />
        </linearGradient>
        <linearGradient id="arwa-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#005fa0" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0077be" stopOpacity="0.5" />
        </linearGradient>
        <clipPath id="arwa-clip">
          <path d="M15,10 L30,10 L33,18 Q41,24 41,34 L41,136 Q41,147 22.5,147 Q4,147 4,136 L4,34 Q4,24 12,18 Z" />
        </clipPath>
      </defs>

      {/* Bottle body */}
      <path d="M15,10 L30,10 L33,18 Q41,24 41,34 L41,136 Q41,147 22.5,147 Q4,147 4,136 L4,34 Q4,24 12,18 Z"
        fill="url(#arwa-body)" stroke="#3a8aac" strokeWidth="0.8" />

      {/* Water fill inside bottle */}
      <rect x="4" y="65" width="37" height="82" fill="url(#arwa-fill)" clipPath="url(#arwa-clip)" />

      {/* Water surface wave */}
      <path d="M4,65 Q14,60 22.5,63 Q31,60 41,65"
        fill="none" stroke="#0077be" strokeWidth="0.8" opacity="0.4" />

      {/* White label */}
      <rect x="5" y="72" width="35" height="60" fill="white" rx="2" opacity="0.97" />

      {/* Label - blue top stripe */}
      <rect x="5" y="72" width="35" height="16" fill="#0077be" rx="2" />
      <text x="22.5" y="84" textAnchor="middle" fontSize="9" fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold" fill="white" letterSpacing="0.5">arwa</text>

      {/* Label - wave divider line */}
      <path d="M5,90 Q14,86 22.5,89 Q31,86 40,90"
        fill="none" stroke="#0077be" strokeWidth="0.8" opacity="0.35" />

      {/* Label body text */}
      <text x="22.5" y="102" textAnchor="middle" fontSize="7.5" fontFamily="Arial"
        fontWeight="600" fill="#0077be">Natural Water</text>

      {/* Water drop icon */}
      <path d="M22.5,108 Q18.5,114 18.5,118 Q18.5,123 22.5,123 Q26.5,123 26.5,118 Q26.5,114 22.5,108 Z"
        fill="#0077be" opacity="0.65" />

      {/* 500ml label */}
      <text x="22.5" y="133" textAnchor="middle" fontSize="7" fontFamily="Arial"
        fill="#555">500 ml</text>

      {/* Bottle cap */}
      <rect x="14" y="1" width="17" height="11" fill="#0092cc" rx="2" />
      <rect x="12" y="9" width="21" height="4" fill="#007aaa" />

      {/* Cap thread rings */}
      <line x1="13" y1="4" x2="32" y2="4" stroke="#00aae0" strokeWidth="0.5" opacity="0.5" />
      <line x1="13" y1="7" x2="32" y2="7" stroke="#00aae0" strokeWidth="0.5" opacity="0.5" />

      {/* Bottle left highlight */}
      <path d="M7,34 Q6,90 7,136" stroke="white" strokeWidth="3" opacity="0.18"
        fill="none" strokeLinecap="round" />

      {/* Bottle neck highlight */}
      <path d="M14,12 Q13,20 13,30" stroke="white" strokeWidth="2" opacity="0.15"
        fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function MocitosCanFace({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 72 80" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="mo-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a7a38" />
          <stop offset="18%" stopColor="#5aaa4a" />
          <stop offset="50%" stopColor="#72c060" />
          <stop offset="82%" stopColor="#5aaa4a" />
          <stop offset="100%" stopColor="#3a7a38" />
        </linearGradient>
        <linearGradient id="mo-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1b4d1a" />
          <stop offset="20%" stopColor="#2a6628" />
          <stop offset="50%" stopColor="#2e7030" />
          <stop offset="80%" stopColor="#2a6628" />
          <stop offset="100%" stopColor="#1b4d1a" />
        </linearGradient>
        <linearGradient id="mo-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8bdb8" />
          <stop offset="100%" stopColor="#888d88" />
        </linearGradient>
        <clipPath id="mo-clip">
          <rect x="3" y="6" width="66" height="68" rx="3" />
        </clipPath>
      </defs>

      {/* Can body */}
      <rect x="3" y="6" width="66" height="68" rx="3" fill="url(#mo-body)" />

      {/* Dark green band at bottom ~25% */}
      <rect x="3" y="55" width="66" height="19" fill="url(#mo-band)" clipPath="url(#mo-clip)" />

      {/* Thin separator line */}
      <line x1="3" y1="55" x2="69" y2="55" stroke="#1b4d1a" strokeWidth="1" opacity="0.7" />

      {/* "mocitos®" brand at top */}
      <text x="36" y="22" textAnchor="middle" fontSize="12"
        fontFamily="'Arial Black', Impact, sans-serif"
        fontWeight="900" fill="#1b3018" letterSpacing="0.3">mocitos</text>
      <text x="56" y="17" textAnchor="middle" fontSize="5" fontFamily="Arial" fill="#1b3018" opacity="0.7">®</text>

      {/* "DESDE 1958" tagline */}
      <text x="36" y="28" textAnchor="middle" fontSize="5"
        fontFamily="Arial, sans-serif" fontWeight="600"
        fill="#1b4d1a" letterSpacing="1.2" opacity="0.85">DESDE 1958</text>

      {/* Decorative lines around tagline */}
      <line x1="8" y1="26.5" x2="18" y2="26.5" stroke="#1b4d1a" strokeWidth="0.8" opacity="0.6" />
      <line x1="54" y1="26.5" x2="64" y2="26.5" stroke="#1b4d1a" strokeWidth="0.6" opacity="0.6" />

      {/* Fruit imagery - pineapple */}
      <ellipse cx="22" cy="42" rx="7" ry="8" fill="#e8a800" opacity="0.9" />
      <path d="M22,34 Q20,30 21,28 Q22,26 23,28 Q24,26 25,28 Q26,30 24,34 Z" fill="#3a8c28" opacity="0.8" />
      {/* Pineapple diamond pattern */}
      <path d="M16,38 Q22,34 28,38 Q22,42 16,38 Z" fill="#d09000" opacity="0.4" />
      <path d="M16,42 Q22,38 28,42 Q22,46 16,42 Z" fill="#d09000" opacity="0.4" />
      <path d="M16,46 Q22,42 28,46 Q22,50 16,46 Z" fill="#d09000" opacity="0.4" />

      {/* Peach */}
      <circle cx="38" cy="42" r="7" fill="#f4a070" opacity="0.9" />
      <path d="M35,36 Q38,33 41,36" fill="none" stroke="#c87040" strokeWidth="0.8" opacity="0.6" />
      <path d="M34,38 Q38,44 42,38" fill="#e07050" opacity="0.2" />

      {/* Cherry */}
      <circle cx="53" cy="38" r="4.5" fill="#c0102a" opacity="0.9" />
      <circle cx="57" cy="43" r="4" fill="#a00020" opacity="0.85" />
      <path d="M55,34 Q57,28 56,26" fill="none" stroke="#3a8c28" strokeWidth="1" opacity="0.8" />

      {/* "CÓCTEL DE FRUTAS" text on dark band */}
      <text x="36" y="64" textAnchor="middle" fontSize="6.5"
        fontFamily="Arial, sans-serif" fontWeight="700"
        fill="white" letterSpacing="0.5">CÓCTEL DE FRUTAS</text>
      <text x="36" y="71" textAnchor="middle" fontSize="4.5"
        fontFamily="Arial, sans-serif"
        fill="rgba(255,255,255,0.65)" letterSpacing="0.3">EN ALMÍBAR LIGERO</text>

      {/* Can top lid */}
      <ellipse cx="36" cy="6" rx="33" ry="7" fill="url(#mo-lid)" />
      {/* Rim ring */}
      <ellipse cx="36" cy="7.5" rx="30" ry="4.5" fill="none" stroke="#909890" strokeWidth="1" opacity="0.5" />

      {/* Can bottom */}
      <ellipse cx="36" cy="74" rx="33" ry="6.5" fill="#2a6028" />

      {/* Highlight stripe */}
      <path d="M6,9 Q5.5,40 6,71" stroke="white" strokeWidth="3.5" opacity="0.10"
        fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function PromoBannerFace({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 300 35" preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="banner-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e04000" />
          <stop offset="40%" stopColor="#ff6b35" />
          <stop offset="60%" stopColor="#ff6b35" />
          <stop offset="100%" stopColor="#e04000" />
        </linearGradient>
      </defs>
      <rect width="300" height="35" fill="url(#banner-grad)" />
      <rect y="0" width="300" height="3.5" fill="rgba(255,255,255,0.28)" />
      <rect y="31.5" width="300" height="3.5" fill="rgba(0,0,0,0.2)" />
      {/* Star decorations */}
      <text x="18" y="23" fontSize="13" fill="rgba(255,255,255,0.6)">★</text>
      <text x="274" y="23" fontSize="13" fill="rgba(255,255,255,0.6)">★</text>
      <text x="150" y="23" textAnchor="middle" fontSize="13"
        fontFamily="'Arial Black', Impact, sans-serif" fontWeight="900"
        fill="white" letterSpacing="1.5">SPECIAL OFFER</text>
    </svg>
  );
}

export function PriceTagFace({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 35 21" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <rect width="35" height="21" fill="white" stroke="#e31837" strokeWidth="1.5" rx="2" />
      <rect width="35" height="9" fill="#e31837" rx="2" />
      <text x="17.5" y="7.5" textAnchor="middle" fontSize="5.5" fontFamily="Arial"
        fontWeight="bold" fill="white" letterSpacing="0.3">PRICE</text>
      <text x="17.5" y="17" textAnchor="middle" fontSize="7.5" fontFamily="Arial"
        fontWeight="bold" fill="#e31837">JD 0.99</text>
    </svg>
  );
}

/** Renders the front face of a product at given pixel dimensions */
export function ProductFace({ productId, w, h }: { productId: string; w: number; h: number }) {
  switch (productId) {
    case 'pepsi_can':    return <PepsiCanFace w={w} h={h} />;
    case 'coke_can':     return <CokeCanFace w={w} h={h} />;
    case 'lays_chips':   return <LaysChipsFace w={w} h={h} />;
    case 'arwa_water':   return <ArwaWaterFace w={w} h={h} />;
    case 'mocitos_can':  return <MocitosCanFace w={w} h={h} />;
    case 'promo_banner': return <PromoBannerFace w={w} h={h} />;
    case 'price_tag':    return <PriceTagFace w={w} h={h} />;
    default:
      return (
        <div style={{ width: w, height: h, background: '#e0e0e8', borderRadius: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 8, color: '#888' }}>?</span>
        </div>
      );
  }
}

/** Catalog display sizes (proportional, for sidebar cards) */
export const CATALOG_DISPLAY_SIZE: Record<string, { w: number; h: number }> = {
  pepsi_can:    { w: 26, h: 48 },
  coke_can:     { w: 26, h: 48 },
  lays_chips:   { w: 42, h: 60 },
  arwa_water:   { w: 20, h: 65 },
  mocitos_can:  { w: 44, h: 50 },
  promo_banner: { w: 58, h: 14 },
  price_tag:    { w: 40, h: 24 },
};
