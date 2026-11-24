// Template komponen skill "editkan-ftg" gaya Glass Guide Reels (lihat ../SKILL.md).
// Salin ke src/remotion/ lalu pakai di komposisi 1080x1920.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily: INTER } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

// ---------- Design tokens ----------
export const T = {
  W: 1080,
  H: 1920,
  sideGutter: 110,
  pillTop: 195,
  cardTop: 265,
  captionY: 1490, // tengah baris caption
  white: "#FFFFFF",
  dim: "rgba(255,255,255,0.28)",
  sub: "rgba(255,255,255,0.62)",
  glass: "rgba(28,28,32,0.55)",
  glassBorder: "rgba(255,255,255,0.10)",
  blur: "blur(24px) saturate(140%)",
  shadow: "0 18px 50px rgba(0,0,0,0.35)",
  red: "#FF3B4E",
  // Gradient utama (pink -> ungu -> biru)
  gradHero: "linear-gradient(90deg, #B45CFF 0%, #FF5CA8 55%, #FF8A5C 100%)",
  gradBlue: "linear-gradient(90deg, #4FA8FF 0%, #7B6CFF 60%, #B45CFF 100%)",
  gradPink: "linear-gradient(90deg, #FF5CA8 0%, #B45CFF 100%)",
  ease: { damping: 200 } as const,
  pop: { damping: 14, stiffness: 180 } as const,
};

const useIn = (start: number, durationInFrames = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - start, fps, durationInFrames, config: T.ease });
};

// Muncul: fade + naik 24px + blur 12px -> 0
export const revealStyle = (p: number): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px)`,
  filter: `blur(${interpolate(p, [0, 1], [12, 0])}px)`,
});

const outAt = (frame: number, end: number, len = 10) =>
  interpolate(frame, [end - len, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ---------- Gradient text ----------
export const GradientText: React.FC<{
  children: React.ReactNode;
  gradient?: string;
  style?: React.CSSProperties;
}> = ({ children, gradient = T.gradHero, style }) => (
  <span
    style={{
      backgroundImage: gradient,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      WebkitTextFillColor: "transparent",
      ...style,
    }}
  >
    {children}
  </span>
);

const glassPanel: React.CSSProperties = {
  backgroundColor: T.glass,
  backdropFilter: T.blur,
  WebkitBackdropFilter: T.blur,
  border: `1.5px solid ${T.glassBorder}`,
  boxShadow: T.shadow,
};

// ---------- Hook: baris kecil putih + kata raksasa gradient ----------
export const HookTitle: React.FC<{
  kicker: string;
  hero: string;
  start?: number;
  end: number;
  top?: number;
}> = ({ kicker, hero, start = 0, end, top = 210 }) => {
  const frame = useCurrentFrame();
  const a = useIn(start + 2);
  const b = useIn(start + 10, 18);
  if (frame > end) return null;
  const o = outAt(frame, end);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: INTER, opacity: o }}>
      <div style={{ fontSize: 62, fontWeight: 700, color: T.white, letterSpacing: -1, ...revealStyle(a) }}>
        {kicker}
      </div>
      <div style={{ fontSize: 178, fontWeight: 800, letterSpacing: -6, lineHeight: 1.05, ...revealStyle(b) }}>
        <GradientText>{hero}</GradientText>
      </div>
    </div>
  );
};

// ---------- Pill progres kanan atas: "• Prompt untuk AI 03/11" ----------
export const StepPill: React.FC<{ label: string; index: number; total: number }> = ({ label, index, total }) => (
  <div
    style={{
      position: "absolute",
      top: T.pillTop,
      right: T.sideGutter + 10,
      ...glassPanel,
      boxShadow: "none",
      borderRadius: 999,
      padding: "10px 22px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontFamily: INTER,
      fontSize: 27,
      fontWeight: 600,
      color: T.white,
    }}
  >
    <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: T.red }} />
    {label}
    <span style={{ color: T.sub, fontWeight: 500 }}>
      {String(index).padStart(2, "0")}/{String(total).padStart(2, "0")}
    </span>
  </div>
);

// ---------- Kartu langkah bernomor (glass) ----------
export const StepCard: React.FC<{
  n: number;
  title: string;
  subtitle: string;
  start: number;
  end: number;
  gradient?: string;
}> = ({ n, title, subtitle, start, end, gradient = T.gradBlue }) => {
  const frame = useCurrentFrame();
  const p = useIn(start, 16);
  if (frame < start || frame > end) return null;
  const o = outAt(frame, end, 8);
  return (
    <div
      style={{
        position: "absolute",
        top: T.cardTop,
        left: T.sideGutter,
        right: T.sideGutter,
        ...glassPanel,
        borderRadius: 40,
        padding: "34px 40px",
        display: "flex",
        alignItems: "center",
        gap: 34,
        fontFamily: INTER,
        opacity: p * o,
        transform: `translateY(${interpolate(p, [0, 1], [-30, 0])}px) scale(${interpolate(p, [0, 1], [0.96, 1])})`,
      }}
    >
      <div style={{ fontSize: 108, fontWeight: 600, letterSpacing: -4, lineHeight: 1 }}>
        <GradientText gradient={gradient}>{String(n).padStart(2, "0")}</GradientText>
      </div>
      <div>
        <div style={{ fontSize: 54, fontWeight: 700, color: T.white, letterSpacing: -1 }}>{title}</div>
        <div style={{ fontSize: 31, fontWeight: 500, color: T.sub, marginTop: 6 }}>{subtitle}</div>
      </div>
    </div>
  );
};

// ---------- Caption karaoke: kata terucap putih, kata berikutnya redup ----------
export type CapWord = { text: string; start: number; end: number }; // dalam frame
export const KaraokeCaption: React.FC<{ line: CapWord[] }> = ({ line }) => {
  const frame = useCurrentFrame();
  if (!line.length) return null;
  const lineStart = line[0].start;
  const lineEnd = line[line.length - 1].end;
  if (frame < lineStart - 4 || frame > lineEnd + 6) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: T.captionY - 40,
        left: 70,
        right: 70,
        textAlign: "center",
        fontFamily: INTER,
        fontSize: 56,
        fontWeight: 600,
        letterSpacing: -0.5,
        textShadow: "0 2px 18px rgba(0,0,0,0.45)",
      }}
    >
      {line.map((w, i) => {
        const p = interpolate(frame, [w.start - 2, w.start + 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              color: p > 0.5 ? T.white : T.dim,
              filter: `blur(${interpolate(p, [0, 1], [3, 0])}px)`,
              marginRight: 14,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ---------- Tipografi kinetik di badan frame ----------
export const KineticWords: React.FC<{ hero: string; line2: string; start: number; end: number; top?: number }> = ({
  hero,
  line2,
  start,
  end,
  top = 1100,
}) => {
  const frame = useCurrentFrame();
  const a = useIn(start, 12);
  const b = useIn(start + 8, 12);
  if (frame < start || frame > end) return null;
  const o = outAt(frame, end, 8);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: INTER, opacity: o, textShadow: "0 4px 34px rgba(0,0,0,0.65)" }}>
      <div style={{ fontSize: 138, fontWeight: 800, letterSpacing: -5, lineHeight: 1, ...revealStyle(a) }}>
        <GradientText gradient={T.gradBlue}>{hero}</GradientText>
      </div>
      <div style={{ fontSize: 96, fontWeight: 700, color: T.white, letterSpacing: -3, ...revealStyle(b) }}>{line2}</div>
    </div>
  );
};

// ---------- Label melayang di sekitar subjek ----------
export const FloatingTag: React.FC<{ text: string; x: number; y: number; start: number; end: number }> = ({
  text,
  x,
  y,
  start,
  end,
}) => {
  const frame = useCurrentFrame();
  const p = useIn(start, 12);
  if (frame < start || frame > end) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + Math.sin(frame / 18) * 6,
        ...glassPanel,
        borderRadius: 999,
        padding: "10px 24px",
        fontFamily: INTER,
        fontSize: 30,
        fontWeight: 600,
        color: T.white,
        opacity: p * outAt(frame, end, 8),
        transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`,
      }}
    >
      {text}
    </div>
  );
};

// ---------- Ring hitung mundur ----------
export const CountdownRing: React.FC<{ from: number; start: number; x: number; y: number; size?: number }> = ({
  from,
  start,
  x,
  y,
  size = 190,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = (frame - start) / fps;
  if (elapsed < 0 || elapsed > from) return null;
  const value = Math.max(1, Math.ceil(from - elapsed));
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const frac = (elapsed % 1);
  return (
    <svg style={{ position: "absolute", left: x, top: y }} width={size} height={size}>
      <defs>
        <linearGradient id="ring" x1="0" x2="1">
          <stop offset="0%" stopColor="#4FA8FF" />
          <stop offset="100%" stopColor="#B45CFF" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(20,20,24,0.45)" stroke="rgba(255,255,255,0.15)" strokeWidth={8} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#ring)"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * frac}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fill="white" fontFamily={INTER} fontWeight={700} fontSize={size * 0.42}>
        {value}
      </text>
    </svg>
  );
};

// ---------- Waveform gradient (untuk SFX / audio) ----------
export const Waveform: React.FC<{ start: number; end: number; y?: number; bars?: number }> = ({
  start,
  end,
  y = 1300,
  bars = 26,
}) => {
  const frame = useCurrentFrame();
  const p = useIn(start, 12);
  if (frame < start || frame > end) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 150,
        right: 150,
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: p * outAt(frame, end, 8),
      }}
    >
      {new Array(bars).fill(0).map((_, i) => {
        const h = 40 + Math.abs(Math.sin(frame / 4 + i * 0.7)) * 140 * (0.5 + 0.5 * Math.sin(i * 1.3));
        return (
          <div
            key={i}
            style={{ width: 12, height: h, borderRadius: 6, backgroundImage: "linear-gradient(180deg, #B45CFF, #4FA8FF)" }}
          />
        );
      })}
    </div>
  );
};

// ---------- Kotak pilihan (Style / Warna / Font) ----------
export const GlassTiles: React.FC<{ items: { icon: React.ReactNode; label: string }[]; start: number; end: number; y?: number }> = ({
  items,
  start,
  end,
  y = 1230,
}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 120, right: 120, display: "flex", gap: 22, justifyContent: "center" }}>
      {items.map((it, i) => {
        const p = spring({ frame: frame - start - i * 5, fps: 30, config: T.pop });
        return (
          <div
            key={i}
            style={{
              ...glassPanel,
              width: 250,
              height: 230,
              borderRadius: 32,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              fontFamily: INTER,
              color: T.white,
              fontSize: 34,
              fontWeight: 600,
              opacity: p * outAt(frame, end, 8),
              transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
            }}
          >
            <div style={{ fontSize: 70, lineHeight: 1 }}>{it.icon}</div>
            {it.label}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Panggung B-roll gelap (ilustrasi penuh layar) ----------
export const BrollStage: React.FC<{ start: number; end: number; children: React.ReactNode }> = ({ start, end, children }) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end) return null;
  const o = Math.min(
    interpolate(frame, [start, start + 6], [0, 1], { extrapolateRight: "clamp" }),
    outAt(frame, end, 6),
  );
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        background: "radial-gradient(120% 80% at 50% 30%, #1B1B24 0%, #0B0B10 70%)",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------- Pill penutup: "Screen record → kirim ke Claude" ----------
export const ChipLine: React.FC<{ parts: React.ReactNode[]; start: number; y?: number }> = ({ parts, start, y = 1430 }) => {
  const p = useIn(start, 14);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          ...glassPanel,
          backgroundColor: "rgba(10,10,12,0.75)",
          borderRadius: 999,
          padding: "18px 38px",
          display: "flex",
          gap: 20,
          alignItems: "center",
          fontFamily: INTER,
          fontSize: 38,
          fontWeight: 500,
          color: T.white,
          ...revealStyle(p),
        }}
      >
        {parts.map((pt, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: T.sub, fontSize: 28 }}>→</span>}
            {pt}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ---------- Vignette lembut agar teks terbaca ----------
export const SoftVignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.45) 100%)",
      pointerEvents: "none",
    }}
  />
);
