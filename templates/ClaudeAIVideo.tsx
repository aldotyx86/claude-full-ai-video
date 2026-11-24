import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CapWord, GradientText, HookTitle, INTER, KaraokeCaption, SoftVignette, StepPill, T } from "./GlassGuide";
import words from "./data/claude_vo.words.json";

export const CL_FPS = 30;
type W = { text: string; startMs: number; endMs: number };
const WS = words as W[];
const f = (ms: number) => Math.round((ms / 1000) * CL_FPS);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");

// Frame awal kata pertama yang cocok (setelah frame `after`).
const at = (word: string, after = 0, fallback = 0) => {
  const w = WS.find((x) => norm(x.text).startsWith(word) && f(x.startMs) >= after);
  return w ? f(w.startMs) : fallback;
};

const VO_END = f(WS[WS.length - 1].endMs);
export const CL_DURATION = VO_END + 75; // ekor 2.5 dtk untuk penutup

const S_TERM = at("di", 0, 90);
const S_PIPE = at("naskah", S_TERM, 170);
const TILES = [
  { label: "Naskah", icon: "✍", t: S_PIPE },
  { label: "Suara", icon: "🎙", t: at("suara", S_PIPE, S_PIPE + 20) },
  { label: "Gambar", icon: "🖼", t: at("gambar", S_PIPE, S_PIPE + 40) },
  { label: "Video", icon: "🎬", t: at("video", S_PIPE, S_PIPE + 60) },
];
const S_RENDER = at("langsung", S_PIPE, S_PIPE + 90);

// Caption: kelompok ≤5 kata, putus di tanda baca.
const LINES: CapWord[][] = (() => {
  const lines: CapWord[][] = [];
  let cur: CapWord[] = [];
  WS.forEach((w, i) => {
    const next = WS[i + 1];
    cur.push({ text: w.text.trim(), start: f(w.startMs), end: f(next ? Math.min(next.startMs, w.endMs + 300) : w.endMs) });
    if (/[?,!.—]$/.test(w.text.trim()) || cur.length >= 5 || !next) {
      lines.push(cur);
      cur = [];
    }
  });
  return lines;
})();

export const glass: React.CSSProperties = {
  backgroundColor: T.glass,
  backdropFilter: T.blur,
  border: `1.5px solid ${T.glassBorder}`,
  boxShadow: T.shadow,
};

// ---------- Maskot piksel oranye ----------
export const ORANGE = "#E8875B";
const SHAPE = [
  "..XXXXXXXX..",
  "..XXXXXXXX..",
  "XXXEXXXXEXXX",
  "XXXEXXXXEXXX",
  "..XXXXXXXX..",
  "..XXXXXXXX..",
  "..X.X..X.X..",
  "..X.X..X.X..",
];
export const PixelBuddy: React.FC<{ x: number; y: number; px?: number; mood?: "happy" | "think" | "party"; seed?: number }> = ({
  x,
  y,
  px = 22,
  mood = "happy",
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const speed = mood === "party" ? 0.45 : 0.22;
  const hop = Math.abs(Math.sin((frame + seed) * speed));
  const lift = hop * (mood === "party" ? 70 : 26);
  const squash = 1 + (1 - hop) * 0.08;
  const blink = (frame + seed) % 70 < 4;
  const legPhase = Math.floor((frame + seed) / 5) % 2;
  const tilt = mood === "think" ? Math.sin(frame * 0.08) * 6 : mood === "party" ? Math.sin(frame * 0.3) * 10 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x - (12 * px) / 2,
        top: y - 8 * px - lift,
        width: 12 * px,
        height: 8 * px,
        transform: `rotate(${tilt}deg) scale(${1 / squash}, ${squash})`,
        transformOrigin: "50% 100%",
        filter: "drop-shadow(0 14px 22px rgba(232,135,91,0.35))",
      }}
    >
      <svg width={12 * px} height={8 * px} viewBox="0 0 12 8" shapeRendering="crispEdges" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {SHAPE.map((row, r) =>
          row.split("").map((c, i) => {
            if (c === ".") return null;
            const isLeg = r >= 6;
            const shift = isLeg && (i % 4 === 2 ? legPhase : 1 - legPhase) ? -0.3 : 0;
            const eyeClosed = c === "E" && blink;
            return (
              <rect
                key={`${r}-${i}`}
                x={i}
                y={r + shift}
                width={1.02}
                height={1.02}
                fill={c === "E" && !eyeClosed ? "#1A1A1A" : ORANGE}
              />
            );
          })
        )}
      </svg>
      {mood === "party" ? (
        <div style={{ position: "absolute", left: 3 * px, top: -3 * px, width: 6 * px, height: 3 * px }}>
          <div
            style={{
              width: 0,
              height: 0,
              margin: "0 auto",
              borderLeft: `${px * 1.5}px solid transparent`,
              borderRight: `${px * 1.5}px solid transparent`,
              borderBottom: `${px * 3}px solid #B45CFF`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

// ---------- Badge kreator: foto bulat kecil + tangan menunjuk ke video ----------
// Foto 1254×1254, wajah sekitar (640, 430). Ukuran kecil di pojok kiri bawah, di bawah caption.
export const CreatorBadge: React.FC<{ start?: number; label?: string; src?: string }> = ({
  start = 10,
  label = "@username",
  src = "raw/creator.png",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - start;
  if (t < 0) return null;
  const size = 150;
  const k = size / 340; // skala foto supaya wajah mengisi lingkaran
  const pop = spring({ frame: t, fps, config: T.pop });
  const bob = Math.sin(frame * 0.12) * 5;
  // tangan: dorongan menunjuk berulang
  const jab = Math.max(0, Math.sin(frame * 0.25)) * 14;
  // label muncul tiap ±8 dtk selama ±3 dtk
  const cyc = t % 240;
  const lab = interpolate(cyc, [0, 10, 80, 92], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 56, top: 1650 + bob, transform: `scale(${pop})`, transformOrigin: "0% 100%" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          padding: 5,
          backgroundImage: `linear-gradient(135deg, ${ORANGE}, #FF5CA8, #B45CFF)`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", position: "relative", backgroundColor: "#111" }}>
          <Img
            src={staticFile(src)}
            style={{ position: "absolute", width: 1254 * k, height: 1254 * k, left: (size - 10) / 2 - 640 * k, top: (size - 10) / 2 - 430 * k }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: size - 22 + jab,
          top: -12 - jab * 0.6,
          fontSize: 64,
          transform: "rotate(-35deg)",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
        }}
      >
        👉
      </div>
      <div
        style={{
          position: "absolute",
          left: size + 60,
          top: 58,
          ...glass,
          borderRadius: 999,
          padding: "10px 22px",
          whiteSpace: "nowrap",
          fontFamily: INTER,
          fontSize: 28,
          fontWeight: 700,
          color: T.white,
          opacity: lab,
          transform: `translateX(${(1 - lab) * -16}px)`,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// Gelembung kecil di atas maskot
export const Bubble: React.FC<{ text: string; x: number; y: number; start: number; end: number }> = ({ text, x, y, start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start || frame > end) return null;
  const p = spring({ frame: frame - start, fps, config: T.pop });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        ...glass,
        borderRadius: 30,
        padding: "14px 28px",
        fontFamily: INTER,
        fontSize: 44,
        fontWeight: 700,
        color: T.white,
        transform: `translate(-50%, 0) scale(${p})`,
      }}
    >
      {text}
    </div>
  );
};

// ---------- Latar: gelap + blob gradient bergerak + grid piksel ----------
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const a = frame * 0.01;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0B10", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: 300 + Math.sin(a) * 160,
          top: 200 + Math.cos(a * 1.3) * 120,
          background: "radial-gradient(circle, rgba(180,92,255,0.35), transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          left: -250 + Math.cos(a * 0.8) * 140,
          top: 900 + Math.sin(a * 1.1) * 140,
          background: "radial-gradient(circle, rgba(232,135,91,0.28), transparent 65%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
          transform: `translateY(${(frame * 0.6) % 54}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Scene 2: terminal Claude Code ----------
const PROMPT = "bikin video: cara bikin konten full AI";
const Terminal: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start || frame > end) return null;
  const p = spring({ frame: frame - start, fps, config: T.ease, durationInFrames: 14 });
  const out = interpolate(frame, [end - 8, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chars = Math.floor(interpolate(frame, [start + 8, start + 8 + PROMPT.length * 1.4], [0, PROMPT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const done = chars >= PROMPT.length;
  const cursor = Math.floor(frame / 8) % 2 === 0;
  return (
    <div style={{ position: "absolute", top: 720, left: 90, right: 90, opacity: p * out, transform: `translateY(${(1 - p) * 40}px)` }}>
      <div style={{ ...glass, borderRadius: 34, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 14, padding: "22px 28px", borderBottom: "1.5px solid rgba(255,255,255,0.08)", alignItems: "center" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c }} />
          ))}
          <div style={{ marginLeft: 18, fontFamily: INTER, fontSize: 30, fontWeight: 600, color: T.sub }}>Claude Code</div>
        </div>
        <div style={{ padding: "34px 36px 40px", fontFamily: "Consolas, Menlo, monospace", fontSize: 40, lineHeight: 1.5, color: T.white }}>
          <span style={{ color: ORANGE, fontWeight: 700 }}>{">"} </span>
          {PROMPT.slice(0, chars)}
          <span style={{ opacity: cursor ? 1 : 0, color: ORANGE }}>▌</span>
          {done ? (
            <div style={{ marginTop: 18, fontSize: 34, color: T.sub }}>
              <span style={{ color: ORANGE }}>✻</span> Thinking…
            </div>
          ) : null}
        </div>
      </div>
      <PixelBuddy x={760} y={2} px={14} mood="think" />
    </div>
  );
};

// ---------- Scene 3: pipeline 4 tile ----------
const Pipeline: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start - 4 || frame > end) return null;
  const out = interpolate(frame, [end - 8, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let active = 0;
  TILES.forEach((t, i) => {
    if (frame >= t.t - 2) active = i;
  });
  const tileW = 200;
  const gap = 26;
  const left0 = (1080 - (tileW * 4 + gap * 3)) / 2;
  // maskot meloncat antar tile
  const prev = TILES[Math.max(0, active - 1)];
  const jumpP = spring({ frame: frame - TILES[active].t + 2, fps, config: T.pop, durationInFrames: 12 });
  const xFrom = left0 + Math.max(0, active - 1) * (tileW + gap) + tileW / 2;
  const xTo = left0 + active * (tileW + gap) + tileW / 2;
  const bx = active === 0 ? xTo : interpolate(jumpP, [0, 1], [xFrom, xTo]);
  const arc = active === 0 ? 0 : Math.sin(Math.min(1, jumpP) * Math.PI) * 120;
  void prev;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      {TILES.map((t, i) => {
        const p = spring({ frame: frame - (start + i * 3), fps, config: T.ease, durationInFrames: 14 });
        const lit = frame >= t.t - 2;
        const pop = spring({ frame: frame - t.t + 2, fps, config: T.pop });
        return (
          <div
            key={t.label}
            style={{
              position: "absolute",
              top: 860,
              left: left0 + i * (tileW + gap),
              width: tileW,
              textAlign: "center",
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px) scale(${lit ? 1 + 0.06 * Math.sin(Math.min(1, pop) * Math.PI) : 1})`,
            }}
          >
            <div
              style={{
                height: tileW,
                borderRadius: 34,
                ...glass,
                border: `2.5px solid ${lit ? "rgba(180,92,255,0.9)" : "rgba(255,255,255,0.15)"}`,
                backgroundImage: lit ? "linear-gradient(135deg, rgba(232,135,91,0.55), rgba(180,92,255,0.6))" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 84,
              }}
            >
              {t.icon}
            </div>
            <div style={{ marginTop: 18, fontFamily: INTER, fontSize: 36, fontWeight: 700, color: lit ? T.white : T.sub }}>{t.label}</div>
          </div>
        );
      })}
      {TILES.slice(0, 3).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 860 + tileW / 2 - 2,
            left: left0 + (i + 1) * (tileW + gap) - gap + 4,
            width: gap - 8,
            height: 4,
            borderRadius: 2,
            backgroundColor: frame >= TILES[i + 1].t ? "#B45CFF" : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
      <PixelBuddy x={bx} y={850 - arc} px={12} seed={7} />
    </div>
  );
};

// ---------- Scene 4: render + pesta ----------
export const Confetti: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const colors = [ORANGE, "#B45CFF", "#4FA8FF", "#FF5CA8", "#FFFFFF"];
  return (
    <>
      {Array.from({ length: 46 }).map((_, i) => {
        const r1 = Math.sin(i * 12.9898) * 43758.5453;
        const rnd = r1 - Math.floor(r1);
        const r2 = Math.sin(i * 78.233) * 12345.678;
        const rnd2 = r2 - Math.floor(r2);
        const vx = (rnd - 0.5) * 34;
        const vy = -22 - rnd2 * 26;
        const x = 540 + vx * t;
        const y = 1080 + vy * t + 0.9 * t * t;
        if (y > 2000) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 18,
              height: 18,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${t * (rnd * 20)}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

const Render: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const p = spring({ frame: frame - start, fps, config: T.ease, durationInFrames: 14 });
  const fullAt = start + 55;
  const prog = interpolate(frame, [start + 6, fullAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const done = frame >= fullAt;
  const doneP = spring({ frame: frame - fullAt, fps, config: T.pop });
  return (
    <>
      <div style={{ position: "absolute", top: 1130, left: 110, right: 110, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: INTER, fontSize: 36, fontWeight: 600, color: T.sub, marginBottom: 18 }}>
          <span>{done ? "done/video.mp4" : "Rendering…"}</span>
          <span style={{ color: T.white, fontWeight: 700 }}>{Math.round(prog * 100)}%</span>
        </div>
        <div style={{ height: 40, borderRadius: 20, border: "2px solid rgba(255,255,255,0.18)", overflow: "hidden" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", borderRadius: 20, backgroundImage: `linear-gradient(90deg, ${ORANGE}, #B45CFF)` }} />
        </div>
        {done ? (
          <div style={{ marginTop: 26, textAlign: "center", fontFamily: INTER, fontSize: 48, fontWeight: 800, transform: `scale(${doneP})` }}>
            <GradientText gradient={`linear-gradient(90deg, ${ORANGE}, #FF5CA8, #B45CFF)`}>✓ Video jadi!</GradientText>
          </div>
        ) : null}
      </div>
      <PixelBuddy x={540} y={1040} px={22} mood={done ? "party" : "happy"} seed={3} />
      <Confetti start={fullAt} />
      {frame < end ? null : null}
    </>
  );
};

export const ClaudeAIVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const line = LINES.find((l) => frame >= l[0].start - 4 && frame <= l[l.length - 1].end + 6) ?? [];
  const stepIdx = frame >= S_RENDER ? 3 : frame >= S_PIPE ? 2 : frame >= S_TERM ? 1 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0B10" }}>
      <Background />
      <Audio src={staticFile("raw/claude_vo.mp3")} />

      {/* 1. Hook */}
      <HookTitle kicker="Bikin video tanpa" hero="rekam?" end={S_TERM - 2} top={250} />
      {frame < S_TERM ? <PixelBuddy x={540} y={1150} px={26} mood="think" /> : null}
      <Bubble text="🤔 serius?" x={540} y={760} start={18} end={S_TERM - 4} />

      {/* 2. Terminal */}
      <HookTitle kicker="Cukup ketik idemu di" hero="Claude." start={S_TERM} end={S_PIPE - 2} top={300} />
      <Terminal start={S_TERM} end={S_PIPE - 2} />

      {/* 3. Pipeline */}
      <HookTitle kicker="AI yang kerjain" hero="semuanya" start={S_PIPE} end={S_RENDER - 2} top={330} />
      <Pipeline start={S_PIPE} end={S_RENDER - 2} />

      {/* 4. Render */}
      <HookTitle kicker="Render otomatis," hero="beres." start={S_RENDER} end={CL_DURATION + 10} top={330} />
      <Render start={S_RENDER} end={CL_DURATION} />

      <SoftVignette />
      {frame >= S_TERM ? <StepPill label="Video full AI" index={stepIdx} total={3} /> : null}
      <KaraokeCaption line={line} />
      <CreatorBadge />
    </AbsoluteFill>
  );
};
