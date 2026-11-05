/**
 * Seed data for CBT Demo
 */
import { put, get, openDB, STORES } from './db.js';

export const DEMO_PARTICIPANT = {
  nisn: '0124271702',
  password: 'R702',
  name: 'Peserta Demo',
  avatar: 'PD'
};

export const DEMO_EXAM = {
  id: 'exam-matematika-demo',
  subject: 'Matematika',
  totalQuestions: 20,
  durationMinutes: 60,
  pointsPerCorrect: 5,
  maxScore: 100
};

/** 20 soal pilihan ganda Matematika SMP/SMA level dasar */
export const DEMO_QUESTIONS = [
  {
    id: 'q01',
    examId: 'exam-matematika-demo',
    number: 1,
    text: 'Hasil dari 15 + 27 × 2 adalah …',
    options: [
      { key: 'A', text: '54' },
      { key: 'B', text: '69' },
      { key: 'C', text: '84' },
      { key: 'D', text: '99' },
      { key: 'E', text: '42' }
    ],
    correct: 'B'
  },
  {
    id: 'q02',
    examId: 'exam-matematika-demo',
    number: 2,
    text: 'Bentuk sederhana dari 2³ × 2⁴ adalah …',
    options: [
      { key: 'A', text: '2⁷' },
      { key: 'B', text: '2¹²' },
      { key: 'C', text: '4⁷' },
      { key: 'D', text: '2⁶' },
      { key: 'E', text: '8⁴' }
    ],
    correct: 'A'
  },
  {
    id: 'q03',
    examId: 'exam-matematika-demo',
    number: 3,
    text: 'Akar kuadrat dari 144 adalah …',
    options: [
      { key: 'A', text: '10' },
      { key: 'B', text: '11' },
      { key: 'C', text: '12' },
      { key: 'D', text: '14' },
      { key: 'E', text: '16' }
    ],
    correct: 'C'
  },
  {
    id: 'q04',
    examId: 'exam-matematika-demo',
    number: 4,
    text: 'Jika 3x − 7 = 11, maka nilai x adalah …',
    options: [
      { key: 'A', text: '4' },
      { key: 'B', text: '5' },
      { key: 'C', text: '6' },
      { key: 'D', text: '7' },
      { key: 'E', text: '8' }
    ],
    correct: 'C'
  },
  {
    id: 'q05',
    examId: 'exam-matematika-demo',
    number: 5,
    text: 'Luas persegi dengan sisi 9 cm adalah …',
    options: [
      { key: 'A', text: '18 cm²' },
      { key: 'B', text: '36 cm²' },
      { key: 'C', text: '72 cm²' },
      { key: 'D', text: '81 cm²' },
      { key: 'E', text: '90 cm²' }
    ],
    correct: 'D'
  },
  {
    id: 'q06',
    examId: 'exam-matematika-demo',
    number: 6,
    text: 'Hasil dari 5/8 + 3/8 adalah …',
    options: [
      { key: 'A', text: '1' },
      { key: 'B', text: '8/8' },
      { key: 'C', text: '1 atau 8/8' },
      { key: 'D', text: '2/8' },
      { key: 'E', text: '15/64' }
    ],
    correct: 'C'
  },
  {
    id: 'q07',
    examId: 'exam-matematika-demo',
    number: 7,
    text: 'Keliling lingkaran dengan diameter 14 cm (gunakan π = 22/7) adalah …',
    options: [
      { key: 'A', text: '22 cm' },
      { key: 'B', text: '44 cm' },
      { key: 'C', text: '66 cm' },
      { key: 'D', text: '88 cm' },
      { key: 'E', text: '154 cm' }
    ],
    correct: 'B'
  },
  {
    id: 'q08',
    examId: 'exam-matematika-demo',
    number: 8,
    text: 'FPB dari 24 dan 36 adalah …',
    options: [
      { key: 'A', text: '6' },
      { key: 'B', text: '8' },
      { key: 'C', text: '12' },
      { key: 'D', text: '18' },
      { key: 'E', text: '24' }
    ],
    correct: 'C'
  },
  {
    id: 'q09',
    examId: 'exam-matematika-demo',
    number: 9,
    text: 'Nilai dari 7² − 3² adalah …',
    options: [
      { key: 'A', text: '16' },
      { key: 'B', text: '40' },
      { key: 'C', text: '46' },
      { key: 'D', text: '52' },
      { key: 'E', text: '58' }
    ],
    correct: 'B'
  },
  {
    id: 'q10',
    examId: 'exam-matematika-demo',
    number: 10,
    text: 'Persentase 45 dari 150 adalah …',
    options: [
      { key: 'A', text: '25%' },
      { key: 'B', text: '30%' },
      { key: 'C', text: '35%' },
      { key: 'D', text: '40%' },
      { key: 'E', text: '45%' }
    ],
    correct: 'B'
  },
  {
    id: 'q11',
    examId: 'exam-matematika-demo',
    number: 11,
    text: 'Volume kubus dengan rusuk 5 cm adalah …',
    options: [
      { key: 'A', text: '25 cm³' },
      { key: 'B', text: '75 cm³' },
      { key: 'C', text: '100 cm³' },
      { key: 'D', text: '125 cm³' },
      { key: 'E', text: '150 cm³' }
    ],
    correct: 'D'
  },
  {
    id: 'q12',
    examId: 'exam-matematika-demo',
    number: 12,
    text: 'Suku berikutnya dari barisan 2, 5, 10, 17, … adalah …',
    options: [
      { key: 'A', text: '24' },
      { key: 'B', text: '26' },
      { key: 'C', text: '28' },
      { key: 'D', text: '30' },
      { key: 'E', text: '32' }
    ],
    correct: 'B'
  },
  {
    id: 'q13',
    examId: 'exam-matematika-demo',
    number: 13,
    text: 'Jika a = 4 dan b = 6, maka nilai 2a + 3b adalah …',
    options: [
      { key: 'A', text: '22' },
      { key: 'B', text: '24' },
      { key: 'C', text: '26' },
      { key: 'D', text: '28' },
      { key: 'E', text: '30' }
    ],
    correct: 'C'
  },
  {
    id: 'q14',
    examId: 'exam-matematika-demo',
    number: 14,
    text: 'Rata-rata dari 8, 12, 15, 9, dan 16 adalah …',
    options: [
      { key: 'A', text: '10' },
      { key: 'B', text: '11' },
      { key: 'C', text: '12' },
      { key: 'D', text: '13' },
      { key: 'E', text: '14' }
    ],
    correct: 'C'
  },
  {
    id: 'q15',
    examId: 'exam-matematika-demo',
    number: 15,
    text: 'Hasil dari (−5) × (−4) + 3 adalah …',
    options: [
      { key: 'A', text: '−17' },
      { key: 'B', text: '−23' },
      { key: 'C', text: '17' },
      { key: 'D', text: '23' },
      { key: 'E', text: '20' }
    ],
    correct: 'D'
  },
  {
    id: 'q16',
    examId: 'exam-matematika-demo',
    number: 16,
    text: 'Sudut siku-siku besarnya …',
    options: [
      { key: 'A', text: '45°' },
      { key: 'B', text: '60°' },
      { key: 'C', text: '90°' },
      { key: 'D', text: '120°' },
      { key: 'E', text: '180°' }
    ],
    correct: 'C'
  },
  {
    id: 'q17',
    examId: 'exam-matematika-demo',
    number: 17,
    text: 'KPK dari 8 dan 12 adalah …',
    options: [
      { key: 'A', text: '16' },
      { key: 'B', text: '24' },
      { key: 'C', text: '36' },
      { key: 'D', text: '48' },
      { key: 'E', text: '96' }
    ],
    correct: 'B'
  },
  {
    id: 'q18',
    examId: 'exam-matematika-demo',
    number: 18,
    text: 'Jika 40% dari suatu bilangan adalah 28, maka bilangan tersebut adalah …',
    options: [
      { key: 'A', text: '56' },
      { key: 'B', text: '64' },
      { key: 'C', text: '70' },
      { key: 'D', text: '72' },
      { key: 'E', text: '80' }
    ],
    correct: 'C'
  },
  {
    id: 'q19',
    examId: 'exam-matematika-demo',
    number: 19,
    text: 'Luas segitiga dengan alas 10 cm dan tinggi 8 cm adalah …',
    options: [
      { key: 'A', text: '20 cm²' },
      { key: 'B', text: '40 cm²' },
      { key: 'C', text: '60 cm²' },
      { key: 'D', text: '80 cm²' },
      { key: 'E', text: '100 cm²' }
    ],
    correct: 'B'
  },
  {
    id: 'q20',
    examId: 'exam-matematika-demo',
    number: 20,
    text: 'Hasil dari 3⁵ ÷ 3² adalah …',
    options: [
      { key: 'A', text: '3' },
      { key: 'B', text: '9' },
      { key: 'C', text: '27' },
      { key: 'D', text: '81' },
      { key: 'E', text: '243' }
    ],
    correct: 'C'
  }
];

export async function seedDatabase() {
  await openDB();

  const existing = await get(STORES.participants, DEMO_PARTICIPANT.nisn);
  if (existing) return; // already seeded

  await put(STORES.participants, DEMO_PARTICIPANT);
  await put(STORES.exams, DEMO_EXAM);

  for (const q of DEMO_QUESTIONS) {
    await put(STORES.questions, q);
  }

  console.log('[CBT] Database seeded successfully');
}
