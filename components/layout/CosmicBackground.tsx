export function CosmicBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(76, 29, 149, 0.35) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 100% 0%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 45% 35% at 0% 100%, rgba(76, 29, 149, 0.18) 0%, transparent 50%),
            linear-gradient(180deg, var(--bg-deep) 0%, var(--bg-main) 40%, var(--bg-deep) 100%)
          `,
        }}
      />

      {/* star field */}
      <div
        className="cosmic-stars absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 80px 120px, rgba(255,255,255,0.35), transparent),
            radial-gradient(1.5px 1.5px at 160px 60px, rgba(214,181,109,0.4), transparent),
            radial-gradient(1px 1px at 240px 180px, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 320px 40px, rgba(255,255,255,0.45), transparent),
            radial-gradient(1px 1px at 400px 140px, rgba(196,181,253,0.35), transparent)`,
          backgroundSize: "420px 220px",
        }}
      />

      {/* astrolabe ring */}
      <div
        className="cosmic-ring absolute left-1/2 top-[8%] h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 opacity-[0.06]"
        style={{
          background: `conic-gradient(from 0deg, transparent, rgba(214,181,109,0.5), transparent, rgba(139,92,246,0.4), transparent)`,
          borderRadius: "50%",
          mask: "radial-gradient(circle, transparent 58%, black 59%, black 61%, transparent 62%)",
          WebkitMask: "radial-gradient(circle, transparent 58%, black 59%, black 61%, transparent 62%)",
          animation: "wheel-spin 120s linear infinite",
        }}
      />

      {/* ambient orbs */}
      <div
        className="cosmic-orb absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "rgba(139, 92, 246, 0.12)", animation: "cosmic-drift 18s ease-in-out infinite" }}
      />
      <div
        className="cosmic-orb absolute -bottom-32 -left-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgba(76, 29, 149, 0.15)", animation: "cosmic-drift 22s ease-in-out infinite reverse" }}
      />
    </div>
  );
}
