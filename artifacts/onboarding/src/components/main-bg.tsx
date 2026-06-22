/* ── Admin Dashboard background — CSS injected via style tag ── */
const css = `
.adm-root {
  background-color: var(--adm-bg);
  background-image: radial-gradient(circle at 50% 0%, #2A2D3A 0%, #1E2028 100%);
}
`;

/* MainBg — injects dashboard background styles */
export function MainBg() {
  return <style>{css}</style>;
}
