# Referensi gaya

## 1. Glass Guide (default)
Gaya bawaan `templates/`: latar gelap ungu/oranye, kartu langkah bernomor (glassmorphism), pill progres
`01/06`, caption karaoke di sepertiga bawah, maskot piksel oranye yang berdiri sendiri.

## 2. Creator Sticker — `algo_trading.mp4`
Contoh jadi: [`algo_trading.mp4`](algo_trading.mp4) (1080×1920, 30 fps, ±46 dtk).
Lembar frame: [`algo_trading_frames.png`](algo_trading_frames.png).

Ciri khas:
- **Latar** cokelat gelap hangat (±`#120A06`) dengan glow oranye lembut di tengah bawah, bukan ungu.
- **Label bagian di atas**: garis tipis oranye + teks monospace kapital, mis. `• 01 / 05 — STRATEGI`,
  `• 04 / 05 — VPS 24 JAM`, `• ✓ — JALAN OTOMATIS`, `• — FOLLOW`.
- **Panel konten** (sepertiga atas): kartu gelap rounded dengan font monospace — jendela chat,
  editor kode yang diketik, grafik backtest, status `ONLINE`, angka besar `24/7`, grid 2×2 kartu
  dengan badge (`MANUAL` merah → `ALGO` hijau, ✅).
- **Caption** satu baris di tengah layar (±y 720 dari 1920), putih tebal, kata berikutnya redup.
- **Kreator di bawah** sebagai stiker potongan (outline putih tebal) dengan **maskot piksel oranye
  bertengger di kepala**. Pose berganti mengikuti isi kalimat.
- **Penutup**: kartu `@username` + tombol `Following ✓`, konfeti, maskot pakai topi pesta.
- Disclaimer kecil bila topiknya berisiko (mis. `⚠ Trading berisiko · bukan ajakan investasi`).

## Pose kreator — `creator-poses/`
Sumber: [`pose-sheet.png`](creator-poses/pose-sheet.png) (grid 3×3, 1536×1024), dipotong jadi 9 file
512×341. [`pose-sheet-in-video.png`](creator-poses/pose-sheet-in-video.png) menunjukkan ukuran & posisi
seperti di video jadi.

| File | Pose | Pakai saat |
|---|---|---|
| `1-think.png`, `4-think-2.png` | tangan di dagu + `?` | hook / pertanyaan, "Dua," "Tiga," sebelum jawaban |
| `2-neutral.png` | tangan di saku + `!` | menjelaskan, kalimat datar |
| `3-point.png`, `8-point-2.png` | menunjuk ke kanan | merujuk panel/kode/alat di layar |
| `5-shocked.png` | tutup mulut + `!!` | fakta mengejutkan, masalah |
| `6-thumbs-up.png`, `7-thumbs-up-2.png` | jempol | solusi, langkah beres, CTA |
| `9-celebrate.png` | tangan terbuka + konfeti | penutup / hasil akhir |

Catatan teknis:
- Latar pose masih cokelat gelap (bukan transparan). Pakai latar video yang senada (±`#120A06`)
  atau hapus latarnya dulu (mis. `remove-background`) sebelum ditaruh di atas warna lain.
- Salin pose yang dipakai ke `public/raw/poses/` proyek Remotion, lalu `staticFile("raw/poses/3-point.png")`.
- Ganti pose dengan potongan keras (tanpa crossfade) + sedikit "pop" skala 0.96→1 agar terasa hidup.
