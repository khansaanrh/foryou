Taruh video kenangan di folder ini (format .mp4 / H.264 paling aman).

Contoh: assets/videos/video-1.mp4
Thumbnail (opsional): assets/videos/video-1.jpg

Lalu buka config.js, cari bagian "videos", dan tambahkan:
  videos: [
    { src: "./assets/videos/video-1.mp4", poster: "./assets/videos/video-1.jpg", title: "that one funny day" },
  ],

Section "Little moments, big feelings" otomatis muncul kalau daftar videos tidak kosong.

Tips:
- Nama file tanpa spasi.
- GitHub menolak file di atas 100 MB. Usahakan tiap video < 20 MB
  (kompres pakai HandBrake, preset "Fast 720p30").
