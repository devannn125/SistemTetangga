const paths = {
  home: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z" />,
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  users: <path d="M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m10-10a4 4 0 1 0-8 0 4 4 0 0 0 8 0m8 10v-2a4 4 0 0 0-3-3.87m-2-9.95a4 4 0 0 1 0 7.75" />,
  alert: <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0" />,
  wallet: <path d="M19 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6m15 7h.01" />,
  file: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6M8 13h8M8 17h5" />,
  box: <path d="m21 8-9-5-9 5 9 5 9-5Zm0 0v8l-9 5-9-5V8m9 5v8" />,
  calendar: <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8" />,
  clipboard: <path d="M9 5h6M9 12h6M9 16h4M8 3h8l1 3h3v16H4V6h3z" />,
  megaphone: <path d="m3 11 18-5v12L3 13zm0 0v6a2 2 0 0 0 2 2h1l2 3" />,
  message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />,
  building: <path d="M4 21V7l8-4 8 4v14M8 21v-7h8v7M8 9h.01M12 9h.01M16 9h.01" />,
  scroll: <path d="M8 21h10a3 3 0 0 0 3-3V5a2 2 0 0 0-2-2H7a3 3 0 0 0-3 3v13a2 2 0 0 0 2 2 2 2 0 0 0 2-2V5m0 16v-4h8" />,
  trendingUp: <path d="m3 17 6-6 4 4 7-7m0 0h-5m5 0v5" />,
  trendingDown: <path d="m3 7 6 6 4-4 7 7m0 0h-5m5 0v-5" />,
  receipt: <path d="M5 3h14v18l-2-1-2 1-2-1-2 1-2-1-2 1-2-1zm5 5h4m-4 4h4m-4 4h2" />,
  search: <path d="m21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14" />,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13a2 2 0 0 0 4 0" />,
  settings: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6m8-3a8 8 0 0 0-.14-1.5l2.03-1.58-2-3.46-2.39.96A8 8 0 0 0 15 5L14.65 2h-5.3L9 5a8 8 0 0 0-2.5 1.42l-2.39-.96-2 3.46 2.03 1.58A8 8 0 0 0 4 12c0 .51.05 1.01.14 1.5l-2.03 1.58 2 3.46 2.39-.96A8 8 0 0 0 9 19l.35 3h5.3L15 19a8 8 0 0 0 2.5-1.42l2.39.96 2-3.46-2.03-1.58c.09-.49.14-.99.14-1.5" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  eye: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  eyeOff: <path d="M3 3l18 18M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58M9.88 4.24A10.7 10.7 0 0 1 12 4c5 0 8.5 4 10 8a13.2 13.2 0 0 1-2.22 3.56M6.61 6.61A13.5 13.5 0 0 0 2 12c1.5 4 5 8 10 8a10.8 10.8 0 0 0 4.23-.86" />,
  idCard: <path d="M4 5h16v14H4zM8 9h.01M7 14a3 3 0 0 1 5 0m3-5h3m-3 4h3m-3 4h2M8 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />,
  key: <path d="M14 7a5 5 0 1 0-4.9 6H9l-2 2H5v2H3v2H1v-3.5L7.5 9A5 5 0 0 0 14 7Zm-3 0h.01" />,
  lock: <path d="M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />,
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" />,
  userPlus: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18-11v6m3-3h-6M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />,
  download: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3" />,
  upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m5-7 5-5 5 5m-5 5V3" />,
  filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  clock: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2" />,
}

export function Icon({ name, className = 'h-4 w-4' }) {
  return (
    <svg
      aria-hidden="true"
      className={`shrink-0 fill-none stroke-current stroke-[1.9] [stroke-linecap:round] [stroke-linejoin:round] ${className}`}
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  )
}
