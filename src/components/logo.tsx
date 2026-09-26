export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#1E54E8" />
      <path d="M9 16.5l4.6 4.6L23 11.2" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <LogoMark />
      <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.04em" }}>
        vouch{" "}
        <span className="serif" style={{ fontWeight: 400, color: "var(--muted)", fontSize: 19 }}>
          by Insyd
        </span>
      </span>
    </span>
  );
}
