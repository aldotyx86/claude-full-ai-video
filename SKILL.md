---
name: claude-full-ai-video
description: Bikin video vertikal 9:16 (TikTok/Reels/Shorts) 100% AI tanpa rekaman — naskah ditulis Claude, voiceover dari ElevenLabs, caption karaoke per kata dari whisper.cpp, animasi Remotion gaya "Glass Guide" dengan maskot piksel oranye yang lucu, lalu render ke MP4. Pakai saat user minta "bikin video full AI", "video tanpa rekam", "video AI pakai maskot", "video tutorial pakai voiceover AI", atau mengetik "video full ai <topik>".
---

# Video Full AI (Claude Code + ElevenLabs + Remotion)

Hasil: MP4 1080×1920, 30 fps, latar gelap + blob gradient, judul gradient raksasa, kartu langkah bernomor
(glassmorphism), pill progres `01/06`, caption karaoke, maskot piksel oranye yang melompat/berpikir/berpesta,
dan CTA di akhir.

## Prasyarat
- Proyek Remotion (`remotion`, `@remotion/cli`, `@remotion/google-fonts`) dengan entry `src/remotion/index.ts`.
- Konektor **ElevenLabs** tersambung di Claude (tool `creative_generate_speech`, `creative_list_voices`).
- `ffmpeg` di PATH dan `whisper.cpp` (`main.exe` + `ggml-small.bin`) untuk transkripsi.
- Salin `templates/GlassGuide.tsx` dan `templates/ClaudeAIVideo.tsx` (berisi `PixelBuddy`, `Bubble`,
  `Background`, `Confetti`) ke `src/remotion/` bila belum ada.

## Alur kerja

### 1. Naskah
Tulis naskah Bahasa Indonesia santai, 30–60 dtk (±80–150 kata):
- **Hook** (≤3 dtk): pertanyaan yang memancing, mis. "Mau bikin video full AI tanpa rekam sama sekali?"
- **Isi**: langkah bernomor yang diucapkan "Satu, … Dua, … " — kata angka ini dipakai sebagai penanda scene.
- **CTA**: mis. `Komen "Claude", nanti aku kirimin linknya di DM!`
Tunjukkan naskah ke user bila topiknya belum jelas; kalau sudah jelas, langsung lanjut.

### 2. Voiceover (ElevenLabs)
- `creative_list_voices` dengan `languages: ["id"]`. Default yang terbukti bagus: **Lucky Adrian**
  (`Bwqn6cc0SdnxwdEP80mf`) — jelas, ekspresif, cocok short-form.
- `creative_generate_speech` dengan `model_id: "eleven_v4"`, `generations_count: 1`.
  Biaya ≈ 1 kredit per karakter (45 dtk ≈ 600 kredit). Sebutkan biayanya ke user.
- **Jangan pernah mengulang panggilan generate saat timeout** — itu memotong kredit dua kali. Cek
  `account_get_usage` / `creative_get_flow_run_status` dulu, lalu tanya user.
- Tunggu `all_completed`, ambil `media[0].url`, unduh ke `public/raw/<nama>.mp3` (salin juga ke `raw/`).

### 3. Caption per kata
```powershell
powershell -ExecutionPolicy Bypass -Command "& '.claude\skills\claude-full-ai-video\scripts\transcribe.ps1' -Audio 'public\raw\<nama>.mp3' -Out 'src\remotion\data\<nama>.words.json' -Replace @{ 'SalahDengar'='Benar' }"
```
Skrip sudah otomatis memperbaiki: angka→kata (`1`→`Satu`), `Cloud`→`Claude`, `11 Labs`→`ElevenLabs`,
`Comment`→`Komen`, `remote`→`Remotion`. Baca hasilnya, lalu tambah `-Replace` untuk salah dengar lain
(contoh nyata: `Nama`→`Enam`, `perkata`→`per kata`) dan jalankan ulang. Penanda scene (`satu`…`enam`, `mau`)
WAJIB benar, karena timing scene dihitung dari situ.

### 4. Komposisi Remotion
- Video pendek 1 adegan per kalimat → mulai dari `templates/ClaudeAIVideo.tsx`.
- Tutorial bernomor + CTA → mulai dari `templates/ClaudeTutorial.tsx`.
Salin ke `src/remotion/<NamaBaru>.tsx`, ganti import JSON kata + `staticFile("raw/<nama>.mp3")`, lalu sesuaikan:
- `STEPS` (judul & subjudul kartu), isi tiap `*Scene`, teks `HookTitle` intro & CTA.
- Timing otomatis: `at("dua", S[0] + 1)` mencari kata pertama yang cocok setelah frame tertentu; durasi =
  akhir VO + ekor 3 dtk.
- Caption dipotong per ≤5 kata / ≤24 karakter agar tidak keluar layar.
- `PixelBuddy` props: `x`, `y` (titik kaki), `px` (ukuran piksel), `mood`: `"happy" | "think" | "party"`.
Daftarkan `<Composition id=... width={1080} height={1920} fps={30} durationInFrames={..._DURATION} />` di `Root.tsx`.

### 5. Cek & render
```powershell
npx remotion still src/remotion/index.ts <Id> <scratch>\f.png --frame=<n> --scale=0.4
npx remotion render src/remotion/index.ts <Id> done/<nama>.mp4
```
Cek 6–9 frame (gabungkan dengan `ffmpeg ... xstack` jadi satu lembar) sebelum render penuh. Hal yang biasa
perlu dibetulkan: judul raksasa terlalu lebar (maks ±8 karakter untuk `hero`), elemen CTA bertumpuk,
caption terpotong. Kirim hasilnya ke user.

## Gaya alternatif: Creator Sticker
Bila user minta video "pakai mukaku", "gaya algo trading", atau ada foto kreator, ikuti
`references/README.md` dan contoh `references/algo_trading.mp4`: latar cokelat hangat, label bagian
monospace `• 01 / 05 — JUDUL`, panel konten di atas, caption di tengah, dan stiker kreator di bawah dengan
maskot di kepala. Pilih pose dari `references/creator-poses/` sesuai isi kalimat (tabel di README referensi).

## Catatan
- Maskot piksel adalah karakter orisinal bergaya retro, bukan aset resmi Anthropic.
- Foto di `references/creator-poses/` adalah foto pemilik repo; jangan dipakai untuk kreator lain.
- Jangan pakai footage/suara orang lain tanpa izin; semua aset di alur ini dihasilkan AI atau kode.
