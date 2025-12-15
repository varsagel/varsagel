import { ImageResponse } from 'next/og';

export const alt = 'Varsagel - Alıcı İlanı Ver, Hızlı Teklif Al';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: '#f8fafc',
          color: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Logo Icon */}
          <svg
            width="250"
            height="250"
            viewBox="0 0 100 100"
            fill="none"
            style={{ marginRight: 20 }}
          >
            {/* Speed Lines */}
            <path d="M12 30 H 32" stroke="#1e293b" strokeWidth="6" strokeLinecap="round"/>
            <path d="M4 48 H 28" stroke="#1e293b" strokeWidth="6" strokeLinecap="round"/>
            <path d="M12 66 H 32" stroke="#1e293b" strokeWidth="6" strokeLinecap="round"/>

            {/* Handle */}
            <line x1="76" y1="70" x2="90" y2="84" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
            
            {/* Rim */}
            <circle cx="58" cy="48" r="30" stroke="#1e293b" strokeWidth="6" fill="#ffffff"/>

            {/* Inner Icons */}
            <g fill="#0891b2">
              {/* Motorcycle */}
              <path d="M46 36 C46 36 48 32 52 32 H54 L52 36 M46 38 A3 3 0 1 0 46 44 A3 3 0 1 0 46 38 M58 38 A3 3 0 1 0 58 44 A3 3 0 1 0 58 38" stroke="#0891b2" strokeWidth="2" fill="none"/>
              <path d="M46 38 L58 38" stroke="#0891b2" strokeWidth="2"/>

              {/* Phone */}
              <rect x="66" y="28" width="10" height="16" rx="2" fill="#0891b2"/>
              <rect x="68" y="30" width="6" height="10" fill="#ffffff"/>
              <circle cx="71" cy="42" r="1" fill="#ffffff"/>

              {/* Building */}
              <rect x="42" y="50" width="10" height="14" fill="#0891b2"/>
              <rect x="44" y="52" width="2" height="2" fill="#ffffff"/>
              <rect x="48" y="52" width="2" height="2" fill="#ffffff"/>
              <rect x="44" y="56" width="2" height="2" fill="#ffffff"/>
              <rect x="48" y="56" width="2" height="2" fill="#ffffff"/>
              <rect x="44" y="60" width="2" height="2" fill="#ffffff"/>
              <rect x="48" y="60" width="2" height="2" fill="#ffffff"/>

              {/* Car */}
              <path d="M64 54 L66 50 H76 L78 54 V60 H64 V54 Z" fill="#0891b2"/>
              <circle cx="68" cy="60" r="2.5" fill="#0891b2"/>
              <circle cx="74" cy="60" r="2.5" fill="#0891b2"/>

              {/* Wrench */}
              <path d="M54 64 L56 62 L64 70 L62 72 Z" fill="#0891b2"/>
              <path d="M52 60 A4 4 0 1 0 58 66" fill="none" stroke="#0891b2" strokeWidth="3"/>
            </g>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', fontSize: 140, color: '#0f172a', letterSpacing: '-0.05em' }}>Varsagel</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
