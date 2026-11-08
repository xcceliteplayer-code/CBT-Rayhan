# CBT Smart Exam · Demo Edition

Simulasi Computer Based Test (ujian berbasis komputer) untuk sekolah.

## Fitur

- Login peserta (NISN + password)
- Halaman konfirmasi identitas & ketentuan ujian
- Dashboard pengerjaan soal (20 soal pilihan ganda A–E)
- Timer hitung mundur 60 menit (berbasis deadline timestamp)
- Navigasi nomor soal dengan status (belum / dijawab / ragu / aktif)
- Auto-save jawaban (sessionStorage + IndexedDB)
- Tandai ragu-ragu
- Konfirmasi selesai 2 tahap
- Penilaian otomatis (nilai 0–100)
- Halaman hasil dengan rincian benar/salah/kosong
- Pengawasan demo: fullscreen, blokir klik kanan & shortcut copy, deteksi tab

## Akun Demo

| Field    | Nilai        |
|----------|--------------|
| NISN     | 123456789   |
| Password | 1234         |

## Cara Menjalankan

Karena menggunakan ES Modules, buka lewat local server (bukan file://).

### Opsi 1 — Python
```bash
cd cbt-demo
python -m http.server 8080
```
Lalu buka http://localhost:8080

### Opsi 2 — Node (npx)
```bash
cd cbt-demo
npx serve .
```

### Opsi 3 — VS Code Live Server
Buka folder `cbt-demo` lalu klik "Go Live".

## Struktur

```
cbt-demo/
├── index.html
├── styles/
│   ├── base.css
│   ├── login.css
│   ├── exam.css
│   ├── dashboard.css
│   └── responsive.css
├── src/
│   ├── app.js
│   ├── auth/
│   ├── exam/
│   ├── timer/
│   ├── scoring/
│   ├── proctor/
│   └── storage/
└── public/
```

## Catatan

- Demo ini **tanpa backend**. Semua data disimpan di browser (IndexedDB + sessionStorage).
- Untuk ujian sungguhan, validasi waktu, jawaban, dan nilai **harus** dilakukan di server.
- Fitur anti-cheat bersifat deteksi/peringatan saja; browser tidak bisa memblokir aplikasi lain secara mutlak.

## Teknologi

- HTML5 Modular
- CSS3 Modular + Responsive
- JavaScript ES Modules
- IndexedDB


## User-Agent

Aplikasi hanya berjalan jika **User-Agent** browser mengandung string:

```
mtsn2
```

Contoh (DevTools → Network conditions → User agent):

```
Mozilla/5.0 ... mtsn2
```

Jika tidak cocok, halaman menampilkan **Akses Ditolak**.
