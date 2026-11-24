# Transkrip voiceover -> JSON kata [{text,startMs,endMs}] untuk caption karaoke Remotion.
# Butuh: ffmpeg di PATH, whisper.cpp (main.exe + model ggml-*.bin).
# Contoh:
#   .\transcribe.ps1 -Audio public\raw\vo.mp3 -Out src\remotion\data\vo.words.json
param(
  [Parameter(Mandatory = $true)][string]$Audio,
  [Parameter(Mandatory = $true)][string]$Out,
  [string]$Whisper = "whisper.cpp\main.exe",
  [string]$Model = "whisper.cpp\ggml-small.bin",
  [string]$Lang = "id",
  # Koreksi tambahan khusus naskah ini, mis. @{ "Nama" = "Enam" }
  [hashtable]$Replace = @{}
)
$ErrorActionPreference = "Stop"
$tmp = Join-Path $env:TEMP ("vo_" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tmp | Out-Null
ffmpeg -y -loglevel error -i $Audio -ar 16000 -ac 1 "$tmp\vo.wav"
# whisper menulis log ke stderr; jalankan via cmd agar PowerShell 5.1 tidak menganggapnya error.
cmd /c "`"$Whisper`" -m `"$Model`" -f `"$tmp\vo.wav`" -l $Lang -ml 1 -sow -oj -of `"$tmp\vo`" >nul 2>nul"
if (-not (Test-Path "$tmp\vo.json")) { throw "Whisper gagal membuat transkrip." }

# Whisper sering salah dengar istilah teknis & menulis angka sebagai digit.
$fix = @{
  "Cloud" = "Claude"; "Clod" = "Claude"; "Klod" = "Claude"
  "1" = "Satu"; "2" = "Dua"; "3" = "Tiga"; "4" = "Empat"; "5" = "Lima"; "6" = "Enam"; "7" = "Tujuh"; "8" = "Delapan"; "9" = "Sembilan"
  "Comment" = "Komen"; "remote" = "Remotion";"connector" = "konektor"; "mascot" = "maskot"; "Text" = "Teks"
}
foreach ($k in $Replace.Keys) { $fix[$k] = $Replace[$k] }
$raw = @((Get-Content "$tmp\vo.json" -Raw | ConvertFrom-Json).transcription | Where-Object { $_.text.Trim() })
$words = New-Object System.Collections.ArrayList
for ($i = 0; $i -lt $raw.Count; $i++) {
  $t = $raw[$i].text.Trim()
  $endMs = [int]$raw[$i].offsets.to
  # "11 Labs" -> "ElevenLabs"
  if ($t -eq "11" -and $i + 1 -lt $raw.Count -and $raw[$i + 1].text.Trim() -like "Labs*") {
    $t = "ElevenLabs" + $raw[$i + 1].text.Trim().Substring(4)
    $endMs = [int]$raw[$i + 1].offsets.to
    $i++
  }
  $core = $t.TrimEnd(',', '.', '?', '!', ':')
  $tail = $t.Substring($core.Length)
  if ($fix.ContainsKey($core)) { $t = $fix[$core] + $tail }
  [void]$words.Add([pscustomobject]@{ text = $t; startMs = [int]$raw[$i].offsets.from; endMs = $endMs })
}
$json = $words | ConvertTo-Json
[IO.File]::WriteAllText((Join-Path (Get-Location) $Out), $json, (New-Object Text.UTF8Encoding $false))
Remove-Item -Recurse -Force $tmp
Write-Output ("{0} kata -> {1}" -f $words.Count, $Out)
