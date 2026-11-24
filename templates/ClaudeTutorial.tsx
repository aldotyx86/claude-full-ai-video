import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CapWord, GradientText, HookTitle, INTER, KaraokeCaption, SoftVignette, StepCard, StepPill, T, Waveform } from "./GlassGuide";
import { Background, Bubble, Confetti, ORANGE, PixelBuddy, glass } from "./ClaudeAIVideo";
import words from "./data/claude_tutorial.words.json";

export const TUT_FPS = 30;
type W = { text: string; startMs: number; endMs: number };
const WS = words as W[];
const f = (ms: number) => Math.round((ms / 1000) * TUT_FPS);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const at = (word: string, after = 0, fallback = 0) => {
  const w = WS.find((x) => norm(x.text) === word && f(x.startMs) >= after);
  return w ? f(w.startMs) : fallback;
};

const VO_END = f(WS[WS.length - 1].endMs);
export const TUT_DURATION = VO_END + 90;

const S = [at("satu", 0, 120)];
["dua", "tiga", "empat", "lima", "enam"].forEach((w, i) => S.push(at(w, S[i] + 1, S[i] + 150)));
const CTA = at("mau", S[5] + 1, S[5] + 200);
const STEPS = [
  { title: "Sambungkan konektor", sub: "ElevenLabs di Claude Code", g: T.gradBlue },
  { title: "Ketik idemu", sub: "Claude nulis naskahnya", g: T.gradPink },
  { title: "Voiceover AI", sub: "pilih suara bahasa Indonesia", g: T.gradBlue },
  { title: "Caption otomatis", sub: "transkrip per kata", g: T.gradPink },
  { title: "Rakit di Remotion", sub: "animasi dari kode", g: T.gradBlue },
  { title: "Render & upload", sub: "siap TikTok / Reels", g: T.gradPink },
].map((s, i) => ({ ...s, n: i + 1, start: S[i], end: (S[i + 1] ?? CTA) - 1 }));

const LINES: CapWord[][] = (() => {
  const lines: CapWord[][] = [];
  let cur: CapWord[] = [];
  WS.forEach((w, i) => {
    const next = WS[i + 1];
    cur.push({ text: w.text.trim(), start: f(w.startMs), end: f(next ? Math.min(next.startMs, w.endMs + 300) : w.endMs) });
    const chars = cur.reduce((a, c) => a + c.text.length + 1, 0);
    if (/[?,!.:]$/.test(w.text.trim()) || cur.length >= 5 || chars >= 24 || !next) {
      lines.push(cur);
      cur = [];
    }
  });
  return lines;
})();

// Wrapper scene: muncul/hilang halus
const Scene: React.FC<{ start: number; end: number; children: React.ReactNode }> = ({ start, end, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start || frame > end) return null;
  const p = spring({ frame: frame - start - 6, fps, config: T.ease, durationInFrames: 16 });
  const o = interpolate(frame, [end - 8, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: p * o, transform: `translateY(${(1 - p) * 40}px)` }}>{children}</AbsoluteFill>;
};

const useLocal = (start: number) => useCurrentFrame() - start;
const typed = (text: string, t: number, cps = 0.8) => text.slice(0, Math.max(0, Math.floor(t * cps)));
const Cursor: React.FC = () => <span style={{ opacity: Math.floor(useCurrentFrame() / 8) % 2 ? 0 : 1, color: ORANGE }}>▌</span>;

const AppTile: React.FC<{ label: string; x: number; children: React.ReactNode }> = ({ label, x, children }) => (
  <div style={{ position: "absolute", top: 760, left: x, width: 300, textAlign: "center" }}>
    <div style={{ ...glass, height: 300, borderRadius: 60, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>{children}</div>
    <div style={{ marginTop: 22, fontFamily: INTER, fontSize: 40, fontWeight: 700, color: T.white }}>{label}</div>
  </div>
);

// 01 — konektor
const ConnectScene: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const t = useLocal(start);
  const line = interpolate(t, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ok = spring({ frame: t - 52, fps: 30, config: T.pop });
  return (
    <Scene start={start} end={end}>
      <AppTile label="Claude Code" x={110}>
        <PixelBuddy x={150} y={200} px={16} />
      </AppTile>
      <AppTile label="ElevenLabs" x={670}>
        <div style={{ display: "flex", gap: 22 }}>
          <div style={{ width: 26, height: 130, borderRadius: 6, backgroundColor: T.white }} />
          <div style={{ width: 26, height: 130, borderRadius: 6, backgroundColor: T.white }} />
        </div>
      </AppTile>
      <div style={{ position: "absolute", top: 905, left: 420, width: 240 * line, height: 8, borderRadius: 4, backgroundImage: `linear-gradient(90deg, ${ORANGE}, #B45CFF)` }} />
      <div
        style={{
          position: "absolute",
          top: 1180,
          left: 0,
          right: 0,
          textAlign: "center",
          transform: `scale(${ok})`,
          fontFamily: INTER,
          fontSize: 44,
          fontWeight: 700,
          color: "#28C840",
        }}
      >
        ● Terhubung
      </div>
    </Scene>
  );
};

// 02 — ide -> naskah
const SCRIPT = ["Hook: Mau bikin video tanpa rekam?", "Isi: 6 langkah praktis", "CTA: Komen “Claude”"];
const ScriptScene: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const t = useLocal(start);
  const prompt = "bikin video tutorial full AI";
  return (
    <Scene start={start} end={end}>
      <div style={{ position: "absolute", top: 700, left: 90, right: 90, ...glass, borderRadius: 34, padding: "36px 40px", fontFamily: "Consolas, Menlo, monospace", fontSize: 38, lineHeight: 1.6, color: T.white }}>
        <div>
          <span style={{ color: ORANGE, fontWeight: 700 }}>{">"} </span>
          {typed(prompt, t - 8)}
          {t < 50 ? <Cursor /> : null}
        </div>
        {SCRIPT.map((l, i) => {
          const p = interpolate(t, [50 + i * 16, 62 + i * 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={l} style={{ opacity: p, marginTop: 14, fontSize: 34, color: T.sub, transform: `translateX(${(1 - p) * 20}px)` }}>
              <span style={{ color: ORANGE }}>✻ </span>
              {l}
            </div>
          );
        })}
      </div>
      <PixelBuddy x={850} y={705} px={13} mood="think" />
    </Scene>
  );
};

// 03 — voiceover
const VOICES = ["Lucky Adrian", "Mona", "Reyy", "Indah"];
const VoiceScene: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const t = useLocal(start);
  const active = Math.min(VOICES.length - 1, Math.floor(Math.max(0, t - 20) / 22)) ;
  return (
    <Scene start={start} end={end}>
      <Waveform start={start} end={end} y={720} />
      <div style={{ position: "absolute", top: 1030, left: 90, right: 90, display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
        {VOICES.map((v, i) => (
          <div
            key={v}
            style={{
              ...glass,
              borderRadius: 999,
              padding: "16px 32px",
              fontFamily: INTER,
              fontSize: 36,
              fontWeight: 700,
              color: T.white,
              border: `2px solid ${i === active ? "#B45CFF" : "rgba(255,255,255,0.12)"}`,
              backgroundImage: i === active ? "linear-gradient(135deg, rgba(232,135,91,0.5), rgba(180,92,255,0.55))" : "none",
            }}
          >
            🎙 {v}
          </div>
        ))}
      </div>
      <PixelBuddy x={540} y={700} px={12} seed={5} />
    </Scene>
  );
};

// 04 — caption per kata
const DEMO = WS.slice(0, 5);
const CaptionScene: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const t = useLocal(start);
  return (
    <Scene start={start} end={end}>
      <div style={{ position: "absolute", top: 700, left: 110, right: 110, display: "flex", flexDirection: "column", gap: 18 }}>
        {DEMO.map((w, i) => {
          const lit = t >= 14 + i * 12;
          return (
            <div key={i} style={{ ...glass, borderRadius: 26, padding: "18px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: INTER, opacity: lit ? 1 : 0.35 }}>
              <span style={{ fontSize: 46, fontWeight: 800, color: lit ? T.white : T.sub }}>{w.text.replace(/[?,!.]/g, "")}</span>
              <span style={{ fontFamily: "Consolas, Menlo, monospace", fontSize: 30, color: lit ? ORANGE : T.sub }}>{(w.startMs / 1000).toFixed(2)}s</span>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// 05 — kode Remotion
const CODE = ['<HookTitle hero="tanpa rekam." />', '<PixelBuddy mood="party" />', "<KaraokeCaption line={line} />"];
const CodeScene: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const t = useLocal(start);
  let used = 0;
  return (
    <Scene start={start} end={end}>
      <div style={{ position: "absolute", top: 700, left: 80, right: 80, ...glass, borderRadius: 34, padding: "34px 36px", fontFamily: "Consolas, Menlo, monospace", fontSize: 33, lineHeight: 1.7 }}>
        <div style={{ color: T.sub, fontSize: 28, marginBottom: 10 }}>ClaudeTutorial.tsx</div>
        {CODE.map((l) => {
          const s = used;
          used += l.length / 1.4 + 4;
          return (
            <div key={l} style={{ color: "#9CDCFE", whiteSpace: "pre" }}>
              {typed(l, t - 8 - s, 1.4)}
            </div>
          );
        })}
      </div>
      <PixelBuddy x={540} y={1240} px={18} mood={t > 70 ? "party" : "happy"} seed={2} />
    </Scene>
  );
};

// 06 — render
const RenderScene: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const t = useLocal(start);
  const prog = interpolate(t, [8, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const done = prog >= 1;
  return (
    <Scene start={start} end={end}>
      <div style={{ position: "absolute", top: 780, left: 110, right: 110, fontFamily: INTER }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 36, fontWeight: 600, color: T.sub, marginBottom: 18 }}>
          <span>{done ? "done/video.mp4 ✓" : "Rendering…"}</span>
          <span style={{ color: T.white, fontWeight: 700 }}>{Math.round(prog * 100)}%</span>
        </div>
        <div style={{ height: 40, borderRadius: 20, border: "2px solid rgba(255,255,255,0.18)", overflow: "hidden" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", backgroundImage: `linear-gradient(90deg, ${ORANGE}, #B45CFF)` }} />
        </div>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 50, opacity: done ? 1 : 0.3 }}>
          {["TikTok", "Reels", "Shorts"].map((p) => (
            <div key={p} style={{ ...glass, borderRadius: 999, padding: "16px 34px", fontSize: 38, fontWeight: 700, color: T.white }}>
              {p}
            </div>
          ))}
        </div>
      </div>
      <PixelBuddy x={540} y={1260} px={20} mood={done ? "party" : "happy"} seed={9} />
      {done ? <Confetti start={start + 60} /> : null}
    </Scene>
  );
};

// CTA — komen "Claude"
const CtaScene: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const t = useLocal(start);
  const word = "Claude";
  const sent = t > 34 + word.length * 4;
  const heart = spring({ frame: t - 34 - word.length * 4, fps: 30, config: T.pop });
  return (
    <Scene start={start} end={end}>
      <HookTitle kicker="Mau skill-nya? Komen" hero="“Claude”" start={start} end={end + 10} top={300} />
      <div style={{ position: "absolute", top: 760, left: 90, right: 90, ...glass, borderRadius: 999, padding: "26px 30px 26px 40px", display: "flex", alignItems: "center", gap: 20, fontFamily: INTER }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, backgroundImage: `linear-gradient(135deg, ${ORANGE}, #B45CFF)` }} />
        <div style={{ flex: 1, fontSize: 46, fontWeight: 700, color: T.white }}>
          {sent ? word : typed(word, t - 30, 0.25)}
          {!sent ? <Cursor /> : null}
        </div>
        <div style={{ fontSize: 56, transform: `scale(${sent ? 1 + 0.4 * Math.sin(Math.min(1, heart) * Math.PI) : 1})` }}>{sent ? "❤️" : "➤"}</div>
      </div>
      <div style={{ position: "absolute", top: 940, left: 0, right: 0, textAlign: "center", fontFamily: INTER, fontSize: 44, fontWeight: 700, opacity: sent ? 1 : 0 }}>
        <GradientText gradient={`linear-gradient(90deg, ${ORANGE}, #FF5CA8, #B45CFF)`}>📩 link kukirim via DM</GradientText>
      </div>
      <PixelBuddy x={540} y={1400} px={22} mood={sent ? "party" : "happy"} seed={4} />
      <Bubble text="aku tunggu ya!" x={540} y={1060} start={start + 70} end={end} />
      {sent ? <Confetti start={start + 34 + word.length * 4} /> : null}
    </Scene>
  );
};

export const ClaudeTutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const line = LINES.find((l) => frame >= l[0].start - 4 && frame <= l[l.length - 1].end + 6) ?? [];
  const step = STEPS.find((s) => frame >= s.start && frame <= s.end);
  const scenes = [ConnectScene, ScriptScene, VoiceScene, CaptionScene, CodeScene, RenderScene];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0B10" }}>
      <Background />
      <Audio src={staticFile("raw/claude_tutorial.mp3")} />

      {/* Intro */}
      <HookTitle kicker="Video full AI," hero="tanpa rekam." end={S[0] - 2} top={280} />
      {frame < S[0] ? <PixelBuddy x={540} y={1150} px={26} mood="think" /> : null}
      <Bubble text="🤔 bisa gitu?" x={540} y={760} start={20} end={S[0] - 4} />

      {STEPS.map((s, i) => {
        const C = scenes[i];
        return <C key={s.n} start={s.start} end={s.end} />;
      })}
      <CtaScene start={CTA} end={TUT_DURATION} />

      <SoftVignette />
      {STEPS.map((s) => (
        <StepCard key={s.n} n={s.n} title={s.title} subtitle={s.sub} start={s.start} end={s.end} gradient={s.g} />
      ))}
      {step ? <StepPill label="Video full AI" index={step.n} total={STEPS.length} /> : null}
      <KaraokeCaption line={line} />
    </AbsoluteFill>
  );
};
