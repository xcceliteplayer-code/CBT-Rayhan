/**
 * Seed data for CBT Demo — multi subject
 */
import { put, get, openDB, STORES } from './db.js';

export const DEMO_PARTICIPANT = {
  nisn: '123456789',
  password: '1234',
  name: 'Peserta Demo',
  avatar: 'PD'
};

/** Daftar ujian / mata pelajaran tersedia */
export const DEMO_EXAMS = [
  {
    id: 'exam-matematika',
    subject: 'Matematika',
    totalQuestions: 20,
    durationMinutes: 60,
    pointsPerCorrect: 5,
    maxScore: 100,
    description: 'Aljabar, geometri, dan aritmetika dasar'
  },
  {
    id: 'exam-informatika',
    subject: 'Informatika',
    totalQuestions: 20,
    durationMinutes: 60,
    pointsPerCorrect: 5,
    maxScore: 100,
    description: 'Komputer, jaringan, dan dasar pemrograman'
  },
  {
    id: 'exam-otomotif',
    subject: 'Otomotif',
    totalQuestions: 20,
    durationMinutes: 60,
    pointsPerCorrect: 5,
    maxScore: 100,
    description: 'Mesin, sistem kelistrikan, dan perawatan kendaraan'
  },
  {
    id: 'exam-bahasa',
    subject: 'Bahasa Indonesia',
    totalQuestions: 20,
    durationMinutes: 60,
    pointsPerCorrect: 5,
    maxScore: 100,
    description: 'Tata bahasa, kosakata, dan pemahaman teks'
  },
  {
    id: 'exam-ipa',
    subject: 'IPA',
    totalQuestions: 20,
    durationMinutes: 60,
    pointsPerCorrect: 5,
    maxScore: 100,
    description: 'Fisika, kimia, dan biologi dasar'
  }
];

// Backward-compatible default
export const DEMO_EXAM = DEMO_EXAMS[0];

function q(examId, number, text, options, correct) {
  return {
    id: `${examId}-q${String(number).padStart(2, '0')}`,
    examId,
    number,
    text,
    options: options.map((t, i) => ({ key: 'ABCDE'[i], text: t })),
    correct
  };
}

/** Matematika */
const MATH = [
  q('exam-matematika', 1, 'Hasil dari 15 + 27 × 2 adalah …', ['54', '69', '84', '99', '42'], 'B'),
  q('exam-matematika', 2, 'Bentuk sederhana dari 2³ × 2⁴ adalah …', ['2⁷', '2¹²', '4⁷', '2⁶', '8⁴'], 'A'),
  q('exam-matematika', 3, 'Akar kuadrat dari 144 adalah …', ['10', '11', '12', '14', '16'], 'C'),
  q('exam-matematika', 4, 'Jika 3x − 7 = 11, maka nilai x adalah …', ['4', '5', '6', '7', '8'], 'C'),
  q('exam-matematika', 5, 'Luas persegi dengan sisi 9 cm adalah …', ['18 cm²', '36 cm²', '72 cm²', '81 cm²', '90 cm²'], 'D'),
  q('exam-matematika', 6, 'Hasil dari 5/8 + 3/8 adalah …', ['1', '8/16', '1 atau 8/8', '2/8', '15/64'], 'C'),
  q('exam-matematika', 7, 'Keliling lingkaran diameter 14 cm (π = 22/7) adalah …', ['22 cm', '44 cm', '66 cm', '88 cm', '154 cm'], 'B'),
  q('exam-matematika', 8, 'FPB dari 24 dan 36 adalah …', ['6', '8', '12', '18', '24'], 'C'),
  q('exam-matematika', 9, 'Nilai dari 7² − 3² adalah …', ['16', '40', '46', '52', '58'], 'B'),
  q('exam-matematika', 10, 'Persentase 45 dari 150 adalah …', ['25%', '30%', '35%', '40%', '45%'], 'B'),
  q('exam-matematika', 11, 'Volume kubus rusuk 5 cm adalah …', ['25 cm³', '75 cm³', '100 cm³', '125 cm³', '150 cm³'], 'D'),
  q('exam-matematika', 12, 'Suku berikutnya barisan 2, 5, 10, 17, … adalah …', ['24', '26', '28', '30', '32'], 'B'),
  q('exam-matematika', 13, 'Jika a = 4 dan b = 6, nilai 2a + 3b adalah …', ['22', '24', '26', '28', '30'], 'C'),
  q('exam-matematika', 14, 'Rata-rata dari 8, 12, 15, 9, dan 16 adalah …', ['10', '11', '12', '13', '14'], 'C'),
  q('exam-matematika', 15, 'Hasil dari (−5) × (−4) + 3 adalah …', ['−17', '−23', '17', '23', '20'], 'D'),
  q('exam-matematika', 16, 'Sudut siku-siku besarnya …', ['45°', '60°', '90°', '120°', '180°'], 'C'),
  q('exam-matematika', 17, 'KPK dari 8 dan 12 adalah …', ['16', '24', '36', '48', '96'], 'B'),
  q('exam-matematika', 18, 'Jika 40% dari suatu bilangan adalah 28, bilangan tersebut …', ['56', '64', '70', '72', '80'], 'C'),
  q('exam-matematika', 19, 'Luas segitiga alas 10 cm tinggi 8 cm adalah …', ['20 cm²', '40 cm²', '60 cm²', '80 cm²', '100 cm²'], 'B'),
  q('exam-matematika', 20, 'Hasil dari 3⁵ ÷ 3² adalah …', ['3', '9', '27', '81', '243'], 'C')
];

/** Informatika */
const INFO = [
  q('exam-informatika', 1, 'Kepanjangan dari CPU adalah …', ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Control Processing Unit', 'Core Processing Utility'], 'A'),
  q('exam-informatika', 2, 'Perangkat input di bawah ini adalah …', ['Monitor', 'Printer', 'Keyboard', 'Speaker', 'Proyektor'], 'C'),
  q('exam-informatika', 3, 'Sistem bilangan yang hanya memakai 0 dan 1 disebut …', ['Desimal', 'Oktal', 'Heksadesimal', 'Biner', 'Roman'], 'D'),
  q('exam-informatika', 4, 'HTML digunakan untuk …', ['Mengolah angka', 'Membuat struktur halaman web', 'Mengedit foto', 'Menjalankan database', 'Mengompilasi program'], 'B'),
  q('exam-informatika', 5, 'Protokol yang umum dipakai untuk mentransfer halaman web adalah …', ['FTP', 'SMTP', 'HTTP', 'SSH', 'POP3'], 'C'),
  q('exam-informatika', 6, 'RAM berfungsi sebagai …', ['Penyimpanan permanen', 'Memori kerja sementara', 'Pengolah grafis', 'Catu daya', 'Pendingin prosesor'], 'B'),
  q('exam-informatika', 7, 'Sistem operasi open source yang populer adalah …', ['Windows', 'macOS', 'Linux', 'DOS', 'Solaris saja'], 'C'),
  q('exam-informatika', 8, 'Dalam flowchart, simbol jajar genjang biasanya menyatakan …', ['Proses', 'Keputusan', 'Input/Output', 'Terminal', 'Konektor'], 'C'),
  q('exam-informatika', 9, 'Alamat IP versi 4 (IPv4) terdiri dari …', ['32 bit', '64 bit', '128 bit', '16 bit', '8 bit'], 'A'),
  q('exam-informatika', 10, 'Bahasa pemrograman yang berjalan di browser untuk interaktivitas web adalah …', ['Python', 'Java', 'JavaScript', 'C++', 'PHP saja'], 'C'),
  q('exam-informatika', 11, 'SSD lebih unggul daripada HDD terutama dalam …', ['Kapasitas maksimal', 'Kecepatan akses data', 'Harga per GB', 'Umur mekanis', 'Konsumsi listrik lebih tinggi'], 'B'),
  q('exam-informatika', 12, 'Firewall berfungsi untuk …', ['Mempercepat internet', 'Menyaring lalu lintas jaringan', 'Mengompres file', 'Mencetak dokumen', 'Mengedit video'], 'B'),
  q('exam-informatika', 13, 'Ekstensi file untuk dokumen Microsoft Word biasanya …', ['.xls', '.ppt', '.docx', '.pdf', '.exe'], 'C'),
  q('exam-informatika', 14, 'Cloud computing memungkinkan pengguna …', ['Hanya bekerja offline', 'Menyimpan dan mengakses data lewat internet', 'Menghapus antivirus', 'Mengganti hardware otomatis', 'Mematikan firewall'], 'B'),
  q('exam-informatika', 15, 'Dalam basis data, PRIMARY KEY berfungsi untuk …', ['Mengurutkan laporan', 'Mengidentifikasi baris secara unik', 'Mengenkripsi data', 'Membuat backup', 'Menghubungkan printer'], 'B'),
  q('exam-informatika', 16, 'Shortcut umum untuk menyalin teks di Windows adalah …', ['Ctrl+X', 'Ctrl+C', 'Ctrl+V', 'Ctrl+Z', 'Ctrl+S'], 'B'),
  q('exam-informatika', 17, 'Malware yang menyebar dengan menyalin diri ke file lain disebut …', ['Adware', 'Spyware', 'Virus', 'Phishing', 'Spam'], 'C'),
  q('exam-informatika', 18, 'Resolusi layar 1920×1080 sering disebut …', ['HD', 'Full HD', '4K', 'SD', 'QVGA'], 'B'),
  q('exam-informatika', 19, 'Git digunakan untuk …', ['Desain grafis', 'Version control kode', 'Editing audio', 'Keamanan jaringan', 'Manajemen inventaris'], 'B'),
  q('exam-informatika', 20, 'Port default HTTP adalah …', ['21', '22', '25', '80', '443'], 'D')
];

/** Otomotif */
const OTOM = [
  q('exam-otomotif', 1, 'Fungsi utama aki pada kendaraan adalah …', ['Menghasilkan bahan bakar', 'Menyimpan dan menyuplai listrik', 'Mendinginkan mesin', 'Mengatur tekanan ban', 'Menyaring oli'], 'B'),
  q('exam-otomotif', 2, 'Komponen yang mengubah gerak bolak-balik piston menjadi putaran adalah …', ['Camshaft', 'Crankshaft', 'Flywheel', 'Timing belt', 'Valve'], 'B'),
  q('exam-otomotif', 3, 'Oli mesin terutama berfungsi untuk …', ['Membersihkan kabin', 'Melumasi komponen mesin', 'Mengisi radiator', 'Menambah tenaga ban', 'Mengatur AC'], 'B'),
  q('exam-otomotif', 4, 'Sistem pengereman yang memakai cairan disebut …', ['Rem mekanis', 'Rem hidrolik', 'Rem parkir saja', 'Rem angin murni', 'Rem elektromagnetik saja'], 'B'),
  q('exam-otomotif', 5, 'Busi berfungsi untuk …', ['Menyemprot bahan bakar', 'Menyalakan campuran udara-bahan bakar', 'Mengukur suhu mesin', 'Mengatur idle', 'Mengisi aki'], 'B'),
  q('exam-otomotif', 6, 'Radiator berfungsi untuk …', ['Menyimpan bahan bakar', 'Mendinginkan cairan pendingin mesin', 'Menghasilkan listrik', 'Mengatur kecepatan', 'Menyaring udara kabin'], 'B'),
  q('exam-otomotif', 7, 'Kepanjangan dari ECU pada mobil modern adalah …', ['Engine Control Unit', 'Electric Current Utility', 'Energy Cooling Unit', 'Exhaust Control Utility', 'Electronic Cabin Unit'], 'A'),
  q('exam-otomotif', 8, 'Tekanan ban yang terlalu rendah dapat menyebabkan …', ['Konsumsi BBM lebih hemat', 'Ban cepat aus tidak merata dan rawan meletus', 'Handling lebih stabil', 'Rem lebih pakem', 'Mesin lebih dingin'], 'B'),
  q('exam-otomotif', 9, 'Filter udara kotor akan berdampak pada …', ['Pembakaran kurang optimal', 'AC lebih dingin', 'Rem lebih responsif', 'Lampu lebih terang', 'Power steering lebih ringan'], 'A'),
  q('exam-otomotif', 10, 'Transmisi manual memerlukan komponen berikut untuk memutus tenaga, yaitu …', ['Differential', 'Kopling (clutch)', 'Alternator', 'Starter', 'Injector'], 'B'),
  q('exam-otomotif', 11, 'Cairan pendingin (coolant) biasanya berwarna …', ['Hitam pekat', 'Hijau, merah, atau biru (tergantung jenis)', 'Ungu metalik saja', 'Coklat oli', 'Bening seperti air minum saja'], 'B'),
  q('exam-otomotif', 12, 'Fungsi timing belt/chain adalah …', ['Menggerakkan wiper', 'Menyelaraskan putaran poros engkol dan camshaft', 'Mengisi bahan bakar', 'Mengatur ketinggian jok', 'Menyalakan lampu sein'], 'B'),
  q('exam-otomotif', 13, 'ABS pada sistem rem berfungsi untuk …', ['Menambah tenaga mesin', 'Mencegah roda terkunci saat pengereman keras', 'Mengurangi berat kendaraan', 'Menghemat oli', 'Mempercantik pelek'], 'B'),
  q('exam-otomotif', 14, 'Bahan bakar diesel ignites karena …', ['Busi', 'Kompresi tinggi di ruang bakar', 'Magnet koil saja', 'Baterai 24V', 'Turbocharger saja'], 'B'),
  q('exam-otomotif', 15, 'Gejala kampas kopling aus biasanya …', ['Mesin sulit hidup dingin', 'Slip saat akselerasi / putaran mesin naik tanpa tenaga', 'AC tidak dingin', 'Lampu dim', 'Ban kempes'], 'B'),
  q('exam-otomotif', 16, 'Alternator berfungsi untuk …', ['Menyalakan starter', 'Mengisi aki dan menyuplai listrik saat mesin hidup', 'Mengatur injeksi', 'Mendinginkan kabin', 'Mengukur oktan BBM'], 'B'),
  q('exam-otomotif', 17, 'Interval ganti oli mesin umumnya ditentukan berdasarkan …', ['Warna cat mobil', 'Jarak tempuh atau waktu sesuai manual pabrikan', 'Musim hujan saja', 'Jumlah penumpang', 'Ukuran pelek'], 'B'),
  q('exam-otomotif', 18, 'Sistem injeksi bahan bakar modern dikontrol oleh …', ['Karburator mekanis saja', 'ECU berdasarkan sensor', 'Hanya vacuum advance', 'Manual driver setiap saat', 'Timer oli'], 'B'),
  q('exam-otomotif', 19, 'Shock absorber berfungsi untuk …', ['Mempercepat laju', 'Meredam getaran dan menjaga stabilitas suspensi', 'Mengisi ban', 'Mengatur suhu mesin', 'Menyalakan fog lamp'], 'B'),
  q('exam-otomotif', 20, 'Warna asap knalpot putih tebal terus-menerus sering menandakan …', ['Kampas rem aus', 'Kemungkinan kebocoran cairan pendingin ke ruang bakar', 'Aki soak', 'Filter kabin kotor', 'Ban tidak balance'], 'B')
];

/** Bahasa Indonesia */
const BINDO = [
  q('exam-bahasa', 1, 'Sinonim kata “cerdas” adalah …', ['Bodoh', 'Pandai', 'Malas', 'Lambat', 'Kasar'], 'B'),
  q('exam-bahasa', 2, 'Antonim kata “besar” adalah …', ['Luas', 'Tinggi', 'Kecil', 'Panjang', 'Berat'], 'C'),
  q('exam-bahasa', 3, 'Kalimat yang menggunakan huruf kapital dengan benar adalah …', ['saya tinggal di jakarta.', 'Saya tinggal di Jakarta.', 'Saya Tinggal Di jakarta.', 'saya Tinggal di Jakarta.', 'SAYA tinggal di jakarta.'], 'B'),
  q('exam-bahasa', 4, 'Imbuhan me- pada kata “baca” menjadi …', ['Membaca', 'Menbaca', 'Mebaca', 'Memaca', 'Mbaca'], 'A'),
  q('exam-bahasa', 5, 'Puisi yang terikat aturan bait dan rima disebut …', ['Prosa', 'Puisi bebas', 'Puisi lama', 'Novel', 'Drama'], 'C'),
  q('exam-bahasa', 6, 'Ide pokok paragraf biasanya terdapat pada …', ['Kata penghubung', 'Kalimat utama', 'Tanda baca', 'Catatan kaki', 'Daftar pustaka'], 'B'),
  q('exam-bahasa', 7, 'Kata baku dari “aktifitas” adalah …', ['Aktifitas', 'Aktivitas', 'Actifitas', 'Aktivitasz', 'Aktivity'], 'B'),
  q('exam-bahasa', 8, 'Kalimat efektif tidak mengandung …', ['Subjek dan predikat', 'Pemborosan kata', 'Makna jelas', 'Struktur runtut', 'Ejaan benar'], 'B'),
  q('exam-bahasa', 9, 'Majas perbandingan yang menggunakan kata “seperti” disebut …', ['Metafora', 'Personifikasi', 'Simile / perumpamaan', 'Hiperbola', 'Ironi'], 'C'),
  q('exam-bahasa', 10, 'Lawan kata “optimis” adalah …', ['Positif', 'Pessimis / pesimistis', 'Semangat', 'Berani', 'Rajin'], 'B'),
  q('exam-bahasa', 11, 'Surat resmi biasanya menggunakan bahasa …', ['Gaul', 'Baku dan formal', 'Campur kode', 'Dialek lokal saja', 'Singkatan chat'], 'B'),
  q('exam-bahasa', 12, 'Paragraf yang berisi ajakan disebut paragraf …', ['Narasi', 'Deskripsi', 'Persuasi', 'Eksposisi', 'Argumentasi saja'], 'C'),
  q('exam-bahasa', 13, 'Kata “mengarang” terbentuk dari …', ['me- + karang', 'meng- + arang', 'me- + ngarang', 'mem- + karang', 'men- + karang'], 'A'),
  q('exam-bahasa', 14, 'Tanda baca yang dipakai untuk mengakhiri kalimat tanya adalah …', ['Titik', 'Koma', 'Tanda seru', 'Tanda tanya', 'Titik koma'], 'D'),
  q('exam-bahasa', 15, 'Cerita fiksi panjang disebut …', ['Cerpen', 'Novel', 'Puisi', 'Artikel', 'Berita'], 'B'),
  q('exam-bahasa', 16, 'Kosakata yang tepat untuk “tempat menyimpan buku” adalah …', ['Garasi', 'Perpustakaan', 'Dapur', 'Bengkel', 'Gudang oli'], 'B'),
  q('exam-bahasa', 17, 'Kalimat “Dia pergi ke pasar.” termasuk kalimat …', ['Tanya', 'Perintah', 'Berita / deklaratif', 'Seru', 'Ajakan'], 'C'),
  q('exam-bahasa', 18, 'Ejaan yang disempurnakan mengatur tentang …', ['Harga BBM', 'Penulisan bahasa Indonesia yang baku', 'Sistem operasi', 'Ukuran ban', 'Kode warna kabel'], 'B'),
  q('exam-bahasa', 19, 'Tokoh utama dalam cerita disebut …', ['Antagonis', 'Protagonis', 'Narator saja', 'Setting', 'Plot'], 'B'),
  q('exam-bahasa', 20, 'Ringkasan isi bacaan secara padat disebut …', ['Sinopsis / ringkasan', 'Dialog', 'Kutipan panjang', 'Daftar isi saja', 'Indeks'], 'A')
];

/** IPA */
const IPA = [
  q('exam-ipa', 1, 'Satuan SI untuk gaya adalah …', ['Joule', 'Watt', 'Newton', 'Pascal', 'Ampere'], 'C'),
  q('exam-ipa', 2, 'Fotosintesis menghasilkan …', ['Oksigen dan glukosa', 'Karbon dioksida saja', 'Nitrogen', 'Uap air saja', 'Asam klorida'], 'A'),
  q('exam-ipa', 3, 'Air mendidih pada suhu (1 atm) …', ['50°C', '75°C', '100°C', '120°C', '0°C'], 'C'),
  q('exam-ipa', 4, 'Planet terdekat dengan Matahari adalah …', ['Venus', 'Merkurius', 'Bumi', 'Mars', 'Jupiter'], 'B'),
  q('exam-ipa', 5, 'Simbol kimia untuk air adalah …', ['H2O', 'CO2', 'O2', 'NaCl', 'H2O2'], 'A'),
  q('exam-ipa', 6, 'Organ yang memompa darah ke seluruh tubuh adalah …', ['Paru-paru', 'Hati', 'Jantung', 'Ginjal', 'Lambung'], 'C'),
  q('exam-ipa', 7, 'Gaya gesek cenderung …', ['Mempercepat benda', 'Melawan arah gerak', 'Menambah massa', 'Menghilangkan gravitasi', 'Menciptakan energi dari ketiadaan'], 'B'),
  q('exam-ipa', 8, 'Cahaya merambat paling cepat di …', ['Air', 'Kaca', 'Ruang hampa', 'Udara lembap', 'Minyak'], 'C'),
  q('exam-ipa', 9, 'pH = 7 menunjukkan larutan …', ['Asam', 'Basa', 'Netral', 'Sangat asam', 'Sangat basa'], 'C'),
  q('exam-ipa', 10, 'Tulang rawan banyak terdapat pada …', ['Tengkorak dewasa', 'Daun telinga dan ujung hidung', 'Gigi', 'Kuku', 'Rambut'], 'B'),
  q('exam-ipa', 11, 'Energi kinetik bergantung pada …', ['Warna benda', 'Massa dan kecepatan', 'Hanya volume', 'Hanya suhu', 'Medan magnet saja'], 'B'),
  q('exam-ipa', 12, 'Gas yang paling banyak di atmosfer Bumi adalah …', ['Oksigen', 'Nitrogen', 'Karbon dioksida', 'Hidrogen', 'Helium'], 'B'),
  q('exam-ipa', 13, 'Proses perubahan zat cair menjadi gas disebut …', ['Kondensasi', 'Penguapan / evaporasi', 'Pembekuan', 'Sublimasi saja', 'Deposisi'], 'B'),
  q('exam-ipa', 14, 'Sel hewan tidak memiliki …', ['Membran sel', 'Inti sel', 'Dinding sel (seperti tumbuhan)', 'Mitokondria', 'Sitoplasma'], 'C'),
  q('exam-ipa', 15, 'Alat ukur arus listrik adalah …', ['Voltmeter', 'Amperemeter', 'Termometer', 'Barometer', 'Higrometer'], 'B'),
  q('exam-ipa', 16, 'Sumber energi terbarukan contohnya …', ['Batu bara', 'Minyak bumi', 'Energi surya', 'Gas alam fosil', 'Gambut'], 'C'),
  q('exam-ipa', 17, 'Hukum Newton I berkaitan dengan …', ['Aksi-reaksi', 'Kelembaman / inersia', 'F = m·a secara langsung saja', 'Gravitasi planet', 'Optik lensa'], 'B'),
  q('exam-ipa', 18, 'Bagian darah yang mengangkut oksigen adalah …', ['Plasma', 'Kepingan darah', 'Sel darah merah', 'Sel darah putih', 'Limfa saja'], 'C'),
  q('exam-ipa', 19, 'Bunyi tidak dapat merambat di …', ['Air', 'Besi', 'Ruang hampa', 'Udara', 'Kayu'], 'C'),
  q('exam-ipa', 20, 'Unsur dengan nomor atom 1 adalah …', ['Helium', 'Hidrogen', 'Karbon', 'Oksigen', 'Nitrogen'], 'B')
];

export const DEMO_QUESTIONS = [...MATH, ...INFO, ...OTOM, ...BINDO, ...IPA];

export function getExamById(id) {
  return DEMO_EXAMS.find((e) => e.id === id) || DEMO_EXAMS[0];
}

export function getQuestionsForExam(examId) {
  return DEMO_QUESTIONS.filter((q) => q.examId === examId).sort((a, b) => a.number - b.number);
}

export async function seedDatabase() {
  await openDB();

  await put(STORES.participants, DEMO_PARTICIPANT);

  for (const exam of DEMO_EXAMS) {
    await put(STORES.exams, exam);
  }
  for (const question of DEMO_QUESTIONS) {
    await put(STORES.questions, question);
  }

  console.log('[CBT] Database seeded:', DEMO_EXAMS.length, 'exams,', DEMO_QUESTIONS.length, 'questions');
}
