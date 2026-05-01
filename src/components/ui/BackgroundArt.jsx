/*
   BackgroundArt — subtle abstract texture + faint torii watermark.
*/

export function BackgroundArt() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Soft atmospheric washes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(72% 44% at 8% 8%, rgba(121, 101, 73, 0.11) 0%, transparent 100%), radial-gradient(56% 34% at 88% 10%, rgba(98, 118, 82, 0.09) 0%, transparent 100%), radial-gradient(88% 50% at 52% 100%, rgba(92, 74, 55, 0.08) 0%, transparent 100%)',
        }}
      />

      {/* Abstract brush sweeps */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '-8%',
          width: '42%',
          height: '18px',
          borderRadius: '999px',
          background: 'linear-gradient(to right, rgba(82, 69, 50, 0.16), rgba(82, 69, 50, 0.06), transparent)',
          transform: 'rotate(-7deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '65%',
          right: '-6%',
          width: '36%',
          height: '14px',
          borderRadius: '999px',
          background: 'linear-gradient(to left, rgba(70, 84, 52, 0.14), rgba(70, 84, 52, 0.05), transparent)',
          transform: 'rotate(6deg)',
        }}
      />

      {/* Faint bamboo edge hints */}
      <div
        style={{
          position: 'absolute',
          left: '1.6%',
          bottom: '-2%',
          width: '12px',
          height: '72%',
          opacity: 0.07,
          borderRadius: '4px 4px 0 0',
          background: 'linear-gradient(to right, #49682e, #6d9740 55%, #49682e)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '1.8%',
          bottom: '-2%',
          width: '12px',
          height: '68%',
          opacity: 0.07,
          borderRadius: '4px 4px 0 0',
          background: 'linear-gradient(to right, #49682e, #6d9740 55%, #49682e)',
        }}
      />

      {/* Torii watermark (very subtle) */}
      <div
        style={{
          position: 'absolute',
          right: '4.5%',
          bottom: '7.5%',
          width: '170px',
          height: '170px',
          opacity: 0.11,
        }}
      >
        <svg viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg" fill="none">
          <defs>
            <linearGradient id="toriiStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a14539" />
              <stop offset="100%" stopColor="#7e3028" />
            </linearGradient>
          </defs>
          <path d="M28 60 H142" stroke="url(#toriiStroke)" strokeWidth="7" strokeLinecap="round" />
          <path d="M18 50 H152" stroke="url(#toriiStroke)" strokeWidth="8" strokeLinecap="round" />
          <path d="M45 60 V144" stroke="url(#toriiStroke)" strokeWidth="8" strokeLinecap="round" />
          <path d="M125 60 V144" stroke="url(#toriiStroke)" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </div>

      {/* Fine grain lines for texture depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.055,
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(84, 70, 53, 0.22) 0 1px, transparent 1px 76px), repeating-linear-gradient(0deg, rgba(80, 67, 49, 0.16) 0 1px, transparent 1px 112px)',
        }}
      />
    </div>
  )
}
