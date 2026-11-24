# claude-full-ai-video

Skill [Claude Code](https://claude.com/claude-code) untuk bikin **video vertikal 9:16 (TikTok / Reels / Shorts) 100% AI**,
tanpa rekam sama sekali:

1. **Naskah** ditulis Claude dari idemu.
2. **Voiceover** dari ElevenLabs (banyak suara Bahasa Indonesia).
3. **Caption karaoke per kata** dari whisper.cpp.
4. **Animasi** Remotion gaya "Glass Guide": judul gradient, kartu langkah bernomor, pill progres,
   dan maskot piksel oranye yang melompat, berpikir, dan berpesta.
5. **Render** ke MP4 1080×1920.

## Instalasi

Salin folder ini ke folder skill Claude Code:

```bash
git clone https://github.com/<username>/claude-full-ai-video.git ~/.claude/skills/claude-full-ai-video
```

(atau ke `.claude/skills/claude-full-ai-video` di dalam proyek Remotion-mu)

### Prasyarat
- Proyek Remotion (`npm i remotion @remotion/cli @remotion/google-fonts`)
- Konektor **ElevenLabs** tersambung di Claude
- `ffmpeg` dan [whisper.cpp](https://github.com/ggerganov/whisper.cpp) (`main.exe` + model `ggml-small.bin`)

## Pemakaian

Di Claude Code, ketik misalnya:

> bikin video full AI tentang cara hemat belanja online, ada CTA komen "HEMAT"

Claude akan menulis naskah, membuat voiceover, mentranskrip caption, merakit komposisi dari
`templates/`, lalu merender ke `done/`.

## Isi repo

| Path | Isi |
|---|---|
| `SKILL.md` | Instruksi alur kerja untuk Claude |
| `scripts/transcribe.ps1` | Audio → JSON kata `{text,startMs,endMs}` + koreksi salah dengar |
| `templates/GlassGuide.tsx` | Komponen gaya Glass Guide (judul, kartu, pill, caption karaoke) |
| `templates/ClaudeAIVideo.tsx` | Video pendek + komponen maskot (`PixelBuddy`, `Bubble`, `Background`, `Confetti`) |
| `templates/ClaudeTutorial.tsx` | Tutorial 6 langkah + CTA "Komen …" |

Maskot piksel adalah karakter orisinal bergaya retro, bukan aset resmi Anthropic.

## Lisensi
MIT
