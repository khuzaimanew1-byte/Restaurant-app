/* ── Welcome background — CSS + HTML in one file ── */
const css = `
.ob::before {
  content: '';
  position: absolute; inset: 0;
  background: var(--bg-mesh);
  pointer-events: none;
}
.ob__bg-glow {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 90% 52% at 50% -5%,
      rgba(196,130,10,.11) 0%, transparent 65%),
    radial-gradient(ellipse 60% 38% at 50%  0%,
      rgba(232,176,96,.07) 0%, transparent 55%);
  pointer-events: none;
}
.illus__glow {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: var(--glow-circle);
  animation: glow-breathe 5s ease-in-out infinite;
  will-change: transform, opacity;
}
@keyframes glow-breathe {
  0%,100% { opacity:.75; transform:scale(1);    }
  50%     { opacity:1;   transform:scale(1.05); }
}
`;

/* WelcomeBg — injects bg styles + renders full-page amber spotlight */
export function WelcomeBg() {
  return (
    <>
      <style>{css}</style>
      <div className="ob__bg-glow" />
    </>
  );
}

/* IllusGlow — circular breathing glow behind each illustration */
export function IllusGlow() {
  return <div className="illus__glow" />;
}
