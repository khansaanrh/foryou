/* =========================================================
   config.js — SEMUA ISI WEBSITE YANG BISA KAMU EDIT ADA DI SINI ♡
   ---------------------------------------------------------
   Tips:
   - Teks ditulis di antara tanda kutip "...".
   - Jangan lupa koma (,) di akhir setiap item dalam daftar.
   - Path foto selalu relatif, diawali "./" (aman untuk GitHub Pages).
   - Foto untuk website ada di assets/photos/ (salinan yang sudah
     dikompres dari folder "foto khansa" dan "fotobareng").
   ========================================================= */

const CONFIG = {
  name: "Khansa",

  /* ---------------------------------------------------------
     TANGGAL ULANG TAHUN
     Format: "TAHUN-BULAN-TANGGALTJAM:MENIT:DETIK" (waktu lokal)
     Contoh 1 November 2026 jam 00:00 -> "2026-11-01T00:00:00"
     --------------------------------------------------------- */
  birthday: "2026-11-01T00:00:00",

  /* ---------------------------------------------------------
     MUSIK LATAR
     1. Taruh file lagu di folder assets/music/ (mp3 paling aman).
     2. Isi src, contoh: "./assets/music/our-song.mp3"
     Kalau src dikosongkan (""), tombol musik otomatis disembunyikan.
     --------------------------------------------------------- */
  music: {
    src: "",
    title: "our song",
    volume: 0.25 // 0 = hening, 1 = paling kencang
  },

  /* ---------------------------------------------------------
     GALERI — "A collection of you" (foto Khansa)
     caption boleh dikosongkan: caption: ""
     --------------------------------------------------------- */
  gallery: [
    // Urutan di sini = urutan tampil di website (kiri ke kanan, baris per baris)
    { src: "./assets/photos/khansa/IMG-20251010-WA0226.jpg", caption: "my kesayangan aku" },
    { src: "./assets/photos/khansa/IMG-20260303-WA0079.jpg", caption: "ceweku yang paling cantik gada obeng" },
    { src: "./assets/photos/khansa/IMG-20260129-WA0023.jpg", caption: "orang cantik yang bikin ak kekangenan" },
    { src: "./assets/photos/khansa/IMG-20260115-WA0035.jpg", caption: "top 1 orang paling bikin kangenn :(((" },
    { src: "./assets/photos/khansa/IMG-20260408-WA0180.jpg", caption: "orang imoett" },
    { src: "./assets/photos/khansa/IMG-20260524-WA0057.jpg", caption: "kesayangan ak yg paling cantikkkk" },
    { src: "./assets/photos/khansa/IMG-20251029-WA0000.jpg", caption: "my kebanggaan te em pe gurll" },
    { src: "./assets/photos/khansa/IMG-20260511-WA0040.jpg", caption: "ada orang cantikk" },
    { src: "./assets/photos/khansa/IMG-20260115-WA0039.jpg", caption: "sedang melihat my istri" },
    { src: "./assets/photos/khansa/IMG-20260408-WA0119.jpg", caption: "naksirr bangett sama my lop" }
  ],

  /* ---------------------------------------------------------
     FOTO BERSAMA — "My favorite place is next to you"
     date = stempel kecil di pojok polaroid (boleh dikosongkan)
     --------------------------------------------------------- */
  memories: [
    { src: "./assets/photos/together/IMG20240424142843.jpg",  date: "apr 2024", caption: "proof that we look cute together" },
    { src: "./assets/photos/together/IMG-20240602-WA0070.jpg", date: "jun 2024", caption: "my favorite human, unfortunately for you" },
    { src: "./assets/photos/together/IMG20240615185058.jpg",  date: "jun 2024", caption: "another day of me being lucky" },
    { src: "./assets/photos/together/IMG-20240826-WA0123.jpg", date: "aug 2024", caption: "my favorite kind of ordinary" },
    { src: "./assets/photos/together/IMG-20241126-WA0092.jpg", date: "nov 2024", caption: "if happiness had a picture, it would look like this" },
    { src: "./assets/photos/together/IMG_20240713_215617.jpg", date: "jul 2024", caption: "home looks a lot like you" },
    { src: "./assets/photos/together/IMG-20241022-WA0062.jpg", date: "oct 2024", caption: "still choosing you, every single day" },
    { src: "./assets/photos/together/IMG-20250711-WA0117.jpg", date: "jul 2025", caption: "save this one forever, ok?" },
    { src: "./assets/photos/together/7a12f25580aa14139a4026aa93c937ef.jpg", date: "", caption: "the luckiest part of my story" },
    { src: "./assets/photos/together/IMG-20260603-WA0044.jpg", date: "jun 2026", caption: "right where I belong" },
    { src: "./assets/photos/together/IMG-20250111-WA0192.jpg", date: "jan 2025", caption: "every moment with you is my favorite" },
    { src: "./assets/photos/together/IMG-20260615-WA0138.jpg", date: "jun 2026", caption: "gym date with my lop" }
  ],

  /* ---------------------------------------------------------
     VIDEO — "Little moments, big feelings"
     Saat ini belum ada video, jadi section video disembunyikan.
     Cara menambah:
       1. Taruh video di assets/videos/ (mp4 H.264, usahakan < 20 MB)
       2. (opsional) taruh gambar thumbnail di assets/videos/
       3. Tambahkan item seperti contoh di bawah (hapus tanda //)
     --------------------------------------------------------- */
  videos: [
    // { src: "./assets/videos/video-1.mp4", poster: "./assets/videos/video-1.jpg", title: "that one funny day" },
  ],

  /* ---------------------------------------------------------
     SURAT CINTA
     Setiap item di "paragraphs" = satu paragraf.
     --------------------------------------------------------- */
  letter: {
    greeting: "Happy birthday sayang,",
    paragraphs: [
      "Selamat berkepala dua yg kedua kali ehehehe, dengan aku tuangkan semua ucapanku disini, semoga ini menjadi hadiah yang bisa kamu terima dari akuu yang aku buat dengan kasih sayang hehehe",
      "selamat 21 tahun ya sayangg, semoga semua hal baik menghampiri kamu ya sayangg, kamu biar makin dewasaa, makin pinterr, makin cantikk jugaa suapaya ak tambah kecintaannn hihihi, dan semogaa kedepannya kamu bisa menjadi versi yang lebih baik dari kamu sekarang, biar tambah suksess kedepannyaa bisa magang nyawit di tempat yang okee yg sama bapak bapak hey salah itu! eheheheh, dan ku doakan juga kamu bisa meraih semua mimpii dan harapan kamuu selama inii",
      "mungkin selama kita ldr 4 bulanan aku banyak buat salah ya sama kamu sampe sering bikin kamu ngerasaa gak aku sayang, ngerasa kesepian banget, dan masih banyak lagi yg bikin kamu ngerasa kita jadi jauhh, dan aku minta maaf sama semua kesalahan yang aku buat selama kita ldr, aku udh nungguin kamu pulang bangett, semoga nanti kamu dilancarkan yaa urusan magangnya sampai kamu dipulangkan ke bogor lagii trs sama aku lagiii hihihi",
      "aku ngerasa kamu udah jadi yang terbaik buat aku selama ini, kamu udah banyak ngajarin aku cara jadi cowo yang baik buat kamu, karena aku masih banyak kurangnyaa, aku mintaa maaf kalau selama ini aku masih belum bisa jadi yang terbaik buat kamu, dan kedepannya aku janji buat selalu berusaha menjadi yang terbaik menurut versi kamu, sebagaimana kamu yang udah jadi versi terbaik di mata aku..",
      "untuk ulang tahun kamu yg ke 21 ini harapan akuu buat kitaa, semoga kita bisa terus langgeng teruss, dan aku bisa nemenin kamu teruss sampe di umur yg ke 22 dan seterusnyaa, semogaa kita bisa saling cinta, saling sayanggg, dan saling mengerti satu sama lainnn"
    ],
    closing: "Selamat ulang tahun, cantik. I love you, more than this website can handle.",
    signoff: "Peluk paling erat,",
    signature: "your favorite person ♡"
  },

  /* ---------------------------------------------------------
     GAME 1 — OUR LITTLE LOVE QUIZ
     answer = nomor pilihan yang benar, MULAI DARI 0
       (pilihan pertama = 0, kedua = 1, ketiga = 2, keempat = 3)
     Kalau jawabannya benar semua, tulis: answer: "all"
     Kalau benarnya lebih dari satu, tulis: answer: [0, 2]
     yay  = pesan kalau benar, oops = pesan kalau salah
     --------------------------------------------------------- */
  loveQuiz: {
    title: "Our Little Love Quiz",
    intro: "5 pertanyaan tentang kita. Ga ada hadiahnya, tapi ada harga diri yang dipertaruhkan.",
    questions: [
      {
        q: "Kapan aniv kita?",
        options: ["99999", "0804", "0000", "asksksk"],
        answer: 1,
        yay: "Pinterr, 0804! Ga lupa ternyata hihi.",
        oops: "Ihh kok lupa :( jawabannya 0804 sayangg."
      },
      {
        q: "Siapa orang yang paling aku sayang?",
        options: ["kamu", "kamu", "kamu", "kamu doangan"],
        answer: "all",
        yay: "Ya iyalah, kamu semua jawabannya. Mau pilih yang mana juga tetap kamu.",
        oops: ""
      },
      {
        q: "Siapa orang paling cantik?",
        options: ["naurah", "khansa", "hawali", "naurah khansa hawali"],
        answer: "all",
        yay: "Benar semua! Soalnya semuanya kamu, cuma dipisah-pisah aja namanya.",
        oops: ""
      },
      {
        q: "Selain khansa, siapa yang paling cantik?",
        options: ["ga ada udah"],
        answer: 0,
        yay: "Betul. Ga ada lagi, udah habis stoknya di kamu.",
        oops: ""
      },
      {
        q: "Couple goals favorit kamu?",
        options: ["khansa rifki", "munawar hawali", "naurah munawar", "rifki naurah"],
        answer: "all",
        yay: "Semuanya benar, soalnya semuanya kita berdua ♡",
        oops: ""
      }
    ],
    // Pesan hasil akhir. "min" = skor minimal untuk dapat pesan ini.
    results: [
      { min: 5, title: "Perfect score! 💯", text: "Kamu kenal kita luar dalam. Pantes aku sayang banget." },
      { min: 4, title: "Hampir sempurna ♡", text: "Cuma salah satu... dan itu tanggal aniv kita 😤 Gapapa, aku tetap sayang." },
      { min: 0, title: "Waduh 😳", text: "Skornya kecil, tapi sayangku ke kamu tetap full. Coba lagi ya?" }
    ]
  },

  /* ---------------------------------------------------------
     GAME 2 — CATCH THE HEARTS
     --------------------------------------------------------- */
  catchGame: {
    duration: 25, // detik
    results: [
      { min: 45, title: "Heart collector pro!", text: "Kamu nangkep semuanya. Termasuk hati aku, dari dulu." },
      { min: 30, title: "Jago banget!", text: "Refleks kamu bagus. Pantes hatiku ga bisa kabur." },
      { min: 15, title: "Not bad, cutie", text: "Beberapa jatuh, tapi tenang, yang punya aku udah aman di kamu." },
      { min: 0,  title: "Uh oh, pada kabur", text: "Gapapa. Hati yang paling penting udah kamu pegang kok." }
    ]
  },

  /* ---------------------------------------------------------
     GAME 3 — ROAD TO LOVE (mobil Khansa & Rifki)
     heads = potongan wajah dari foto (dalam piksel foto tersebut):
       x, y = pojok kiri atas kotak wajah, size = lebar kotak
     length = panjang jalan (makin besar makin lama)
     --------------------------------------------------------- */
  loveRide: {
    title: "Road to Love",
    intro: "Bawa Khansa & Rifki naik turun bukit sampai ke love di ujung jalan. Kumpulin hati di jalan biar bensin cintanya ga habis!",
    length: 7500,
    heads: {
      khansa: { src: "./assets/photos/together/IMG20240424142843.jpg", x: 175, y: 320, size: 500, name: "Khansa" },
      rifki:  { src: "./assets/photos/together/IMG20240424142843.jpg", x: 490, y: 90,  size: 640, name: "Rifki" }
    },
    // Pesan kalau sampai di love. "min" = jumlah hati minimal.
    results: [
      { min: 40, title: "Perfect road trip! 💞", text: "Sampai di love bawa hati sebanyak ini. Kayak kita: penuh cinta sepanjang jalan." },
      { min: 20, title: "Sampai dengan selamat ♡", text: "Naik turun dikit gapapa, yang penting sampainya bareng." },
      { min: 0,  title: "Yeay, sampai!", text: "Hatinya cuma sedikit yang kebawa, tapi yang penting kita sampai bareng." }
    ],
    // Pesan kalau bensin cinta habis sebelum sampai
    lose: { title: "Yah, bensin cintanya habis", text: "Gapapa, isi ulang dulu terus kita jalan lagi. Coba lagi?" }
  },

  /* ---------------------------------------------------------
     SECRET SURPRISE — "One last thing..."
     --------------------------------------------------------- */
  surprise: {
    // Pesan yang muncul tiap kali kado diketuk (kado terbuka di ketukan terakhir)
    hints: [
      "there's one more thing...",
      "hmm, a little harder?",
      "almost there... ♡"
    ],
    photo: "./assets/photos/together/IMG-20241126-WA0101.jpg",
    photoCaption: "you & me ♡",
    title: "You are so loved.",
    paragraphs: [
      "If you made it all the way here, thank you for staying until the very end. This little world was made for you, one small detail at a time.",
      "I hope you know how much you mean to me. Not only today, but on the quiet days, the tired days, and every day in between. You make my life softer, warmer, and so much brighter.",
      "Happy 21st birthday, my love. I can't wait to see everything this new year brings you, and I hope I get to be right beside you for all of it."
    ],
    finalLine: "I love you, today and every ordinary day after."
  }
};
