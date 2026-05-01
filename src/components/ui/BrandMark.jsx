export function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg className="brand-mark-emblem" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect className="brand-mark-badge" x="5" y="5" width="54" height="54" rx="13" />
        <rect className="brand-mark-badge-ring" x="5" y="5" width="54" height="54" rx="13" />
        <ellipse className="brand-mark-hill" cx="32" cy="46" rx="15" ry="5.5" />

        <circle className="brand-mark-canopy-back" cx="32" cy="24" r="11" />
        <circle className="brand-mark-canopy-main" cx="22" cy="27" r="8.5" />
        <circle className="brand-mark-canopy-main" cx="42" cy="27" r="8.5" />
        <circle className="brand-mark-canopy-main" cx="26" cy="19" r="7.5" />
        <circle className="brand-mark-canopy-main" cx="38" cy="19" r="7.5" />
        <circle className="brand-mark-canopy-main" cx="32" cy="31" r="9.5" />

        <circle className="brand-mark-blossom-dot" cx="18.5" cy="26" r="1.5" />
        <circle className="brand-mark-blossom-dot" cx="24" cy="16" r="1.3" />
        <circle className="brand-mark-blossom-dot" cx="31" cy="14.8" r="1.4" />
        <circle className="brand-mark-blossom-dot" cx="40.5" cy="17" r="1.5" />
        <circle className="brand-mark-blossom-dot" cx="45.5" cy="24.5" r="1.35" />
        <circle className="brand-mark-blossom-dot" cx="36.5" cy="30.5" r="1.2" />

        <path className="brand-mark-trunk" d="M28.8 47 C28.7 41.2, 29.6 36.8, 31.3 33.2 C28.9 31.5, 27.5 28.6, 27.5 25.2 C29.8 26.5, 31.6 28, 33 29.9 C34.3 27.6, 36.3 26, 38.8 25 C38.7 28.4, 37.5 31.3, 35.5 33.4 C37 37, 37.7 41.5, 37.6 47 Z" />
        <path className="brand-mark-trunk-shadow" d="M33 30.4 C34.8 34.2, 35.5 39.7, 35.1 47 L37.6 47 C37.7 41.5, 37 37, 35.5 33.4 Z" />

        <circle className="brand-mark-face" cx="31" cy="40.5" r="0.85" />
        <circle className="brand-mark-face" cx="35" cy="40.5" r="0.85" />
        <path className="brand-mark-smile" d="M30.8 43 C31.8 44.1, 34.2 44.1, 35.2 43" />
      </svg>
    </div>
  )
}