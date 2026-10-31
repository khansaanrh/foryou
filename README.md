# A Little World Made for Khansa ♡

Website hadiah ulang tahun ke-21 untuk Khansa. Dibuat dengan HTML, CSS, dan JavaScript biasa: tanpa framework, tanpa npm, tanpa build process.

## Struktur folder

```
/
├── index.html          ← struktur halaman (judul section, hero, dll.)
├── style.css           ← tampilan, warna, animasi, responsive
├── config.js           ← ★ SEMUA ISI YANG BISA DIEDIT (surat, quiz, caption, tanggal, musik)
├── script.js           ← logika: opening, countdown, galeri, lightbox, surat, surprise
├── games.js            ← logika 3 mini game (Love Quiz, Catch the Hearts, Road to Love)
├── assets/
│   ├── photos/
│   │   ├── khansa/     ← salinan foto Khansa yang sudah dikompres (dipakai website)
│   │   └── together/   ← salinan foto bersama yang sudah dikompres
│   ├── music/          ← taruh lagu di sini
│   └── videos/         ← taruh video di sini
├── tools/
│   └── optimize-photos.ps1  ← script untuk mengompres foto baru
├── foto khansa/        ← foto asli (tidak dipakai langsung oleh website)
└── fotobareng/         ← foto asli (tidak dipakai langsung oleh website)
```

## Menjalankan

- **VS Code:** klik kanan `index.html` → *Open with Live Server*.
- Atau buka `index.html` langsung di browser.

## Yang bisa diedit (semuanya di `config.js`)

| Mau ganti | Cari di `config.js` |
|---|---|
| Tanggal ulang tahun | `birthday: "2026-11-01T00:00:00"` |
| Musik | `music: { src: "./assets/music/namafile.mp3", ... }` |
| Caption galeri | `gallery: [ ... caption: "..." ]` |
| Caption & tanggal polaroid | `memories: [ ... ]` |
| Video | `videos: [ ... ]` |
| Surat cinta | `letter: { greeting, paragraphs, closing, ... }` |
| Love Quiz | `loveQuiz.questions` (`answer` dihitung dari 0, atau `"all"` kalau semua benar) |
| Catch the Hearts | `catchGame.duration` dan `catchGame.results` |
| Road to Love (game mobil) | `loveRide`: panjang jalan, foto & posisi wajah, pesan hasil |
| Pesan kejutan terakhir | `surprise: { ... }` |

Foto hero ada di `index.html` (cari komentar *Ganti foto hero di sini*).

## Menambah foto baru

1. Taruh foto asli di `foto khansa/` atau `fotobareng/`.
2. Jalankan di terminal (dari folder project):
   ```
   powershell -ExecutionPolicy Bypass -File .\tools\optimize-photos.ps1
   ```
3. Tambahkan path-nya ke `gallery` atau `memories` di `config.js`, contoh
   `"./assets/photos/khansa/NAMA-FILE.jpg"`.

## Upload ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `khansa21`.
2. Upload semua file project ini (bisa lewat *Add file → Upload files*, atau `git push`).
3. Buka *Settings → Pages*. Di *Build and deployment*, pilih *Deploy from a branch*,
   branch `main`, folder `/ (root)`, lalu *Save*.
4. Tunggu 1–2 menit. Website bisa dibuka di `https://username.github.io/khansa21/`.

Kalau ingin alamatnya `https://username.github.io/` saja, beri nama repository
persis `username.github.io`.

Catatan: repository publik bisa dilihat siapa saja, termasuk foto-fotonya.
