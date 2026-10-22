export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correct: string;
  feedback: string;
};

export type GlossaryTerm = {
  term: string;
  pronunciation: string;
  meaning: string;
  example: string;
};

export type DeepDive = {
  label: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  example?: string;
  takeaway?: string;
};

export type Lesson = {
  slug: string;
  title: string;
  objective: string;
  duration: number;
  format: string;
  keyPhrases: { phrase: string; meaning: string }[];
  mission: string;
  missionExample: string;
  selfCheck: string[];
  quiz?: QuizQuestion[];
  glossary?: GlossaryTerm[];
  deepDive?: DeepDive;
};

export type CourseModule = {
  slug: string;
  title: string;
  sessions: string;
  objective: string;
  exit: string;
  lessons: Lesson[];
};

export type Resource = {
  slug: string;
  type: string;
  title: string;
  description: string;
  moduleSlug: string;
  lessonSlug: string;
};

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  level: string;
  format: string;
  promise: string;
  outcomes: string[];
  modules: CourseModule[];
  resources: Resource[];
};

const KIDS_SELF_CHECK = [
  "Aku sudah mencoba mengucapkan frasa hari ini.",
  "Aku menyelesaikan misi sampai selesai.",
  "Aku tahu satu hal yang mau aku coba lagi.",
];

const HELLO_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Kamu bertemu teman baru. Apa yang kamu bilang?",
    options: [
      { id: "a", text: "Hello! My name is Bima." },
      { id: "b", text: "My name Bima is." },
      { id: "c", text: "Hello, Bima my name." },
    ],
    correct: "a",
    feedback: "Benar! Kita mulai dengan 'Hello' lalu 'My name is ...'.",
  },
  {
    id: "q2",
    prompt: "Bagaimana cara bertanya nama teman?",
    options: [
      { id: "a", text: "What is your name?" },
      { id: "b", text: "What your name?" },
      { id: "c", text: "Your name what?" },
    ],
    correct: "a",
    feedback: "Benar! 'What is your name?' adalah pertanyaan lengkap.",
  },
];

const COLOR_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Which one is a color?",
    options: [
      { id: "a", text: "Blue" },
      { id: "b", text: "Ball" },
      { id: "c", text: "Book" },
    ],
    correct: "a",
    feedback: "Blue artinya biru. Ball itu bola, book itu buku.",
  },
  {
    id: "q2",
    prompt: "Kamu punya bola merah. Apa bahasa Inggrisnya?",
    options: [
      { id: "a", text: "I have a red ball." },
      { id: "b", text: "I have a ball red." },
      { id: "c", text: "I red have a ball." },
    ],
    correct: "a",
    feedback: "Benar! Warna diletakkan sebelum benda: a red ball.",
  },
];

const FAMILY_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "'My mother' artinya ...",
    options: [
      { id: "a", text: "Ibuku" },
      { id: "b", text: "Kakakku" },
      { id: "c", text: "Temanku" },
    ],
    correct: "a",
    feedback: "Betul! Mother artinya ibu. Father artinya ayah.",
  },
  {
    id: "q2",
    prompt: "Which sentence is correct?",
    options: [
      { id: "a", text: "This is my sister." },
      { id: "b", text: "This my sister is." },
      { id: "c", text: "This is my sister is." },
    ],
    correct: "a",
    feedback: "Benar! 'This is my sister' artinya 'Ini kakak/adik perempuanku'.",
  },
];

const DAY_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Kamu bangun pagi. Apa yang kamu bilang?",
    options: [
      { id: "a", text: "I wake up in the morning." },
      { id: "b", text: "I wake up in the night." },
      { id: "c", text: "I sleep in the morning." },
    ],
    correct: "a",
    feedback: "Benar! 'Wake up in the morning' artinya bangun di pagi hari.",
  },
  {
    id: "q2",
    prompt: "'I brush my teeth' artinya ...",
    options: [
      { id: "a", text: "Aku menyikat gigi" },
      { id: "b", text: "Aku mencuci tangan" },
      { id: "c", text: "Aku mandi" },
    ],
    correct: "a",
    feedback: "Betul! Brush my teeth = menyikat gigi.",
  },
];

const FOOD_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Kamu suka nasi goreng. Apa yang kamu bilang?",
    options: [
      { id: "a", text: "I like fried rice." },
      { id: "b", text: "I like rice fried." },
      { id: "c", text: "I not like fried rice." },
    ],
    correct: "a",
    feedback: "Benar! 'I like fried rice' artinya aku suka nasi goreng.",
  },
  {
    id: "q2",
    prompt: "Which one is a drink?",
    options: [
      { id: "a", text: "Milk" },
      { id: "b", text: "Bread" },
      { id: "c", text: "Apple" },
    ],
    correct: "a",
    feedback: "Milk artinya susu, itu minuman.",
  },
];

const SCHOOL_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Guru bertanya. Kamu mau menjawab. Apa yang kamu bilang?",
    options: [
      { id: "a", text: "I know the answer!" },
      { id: "b", text: "I know answer the!" },
      { id: "c", text: "I the answer know!" },
    ],
    correct: "a",
    feedback: "Benar! 'I know the answer' artinya aku tahu jawabannya.",
  },
  {
    id: "q2",
    prompt: "'May I borrow a pencil?' artinya ...",
    options: [
      { id: "a", text: "Boleh aku pinjam pensil?" },
      { id: "b", text: "Boleh aku beli pensil?" },
      { id: "c", text: "Boleh aku bawa pensil?" },
    ],
    correct: "a",
    feedback: "Betul! Borrow artinya meminjam.",
  },
];

const ANIMAL_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Kamu suka kucing. Apa yang kamu bilang?",
    options: [
      { id: "a", text: "My favorite animal is a cat." },
      { id: "b", text: "My animal favorite is a cat." },
      { id: "c", text: "My favorite is animal a cat." },
    ],
    correct: "a",
    feedback: "Benar! 'My favorite animal is ...' artinya hewan favoritku adalah ...",
  },
  {
    id: "q2",
    prompt: "A cat says ...",
    options: [
      { id: "a", text: "Meow" },
      { id: "b", text: "Woof" },
      { id: "c", text: "Moo" },
    ],
    correct: "a",
    feedback: "Betul! Cat = meow. Dog = woof. Cow = moo.",
  },
];

const STORY_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Bagaimana cara memulai cerita?",
    options: [
      { id: "a", text: "Once upon a time ..." },
      { id: "b", text: "The end ..." },
      { id: "c", text: "Goodbye ..." },
    ],
    correct: "a",
    feedback: "Benar! 'Once upon a time' artinya pada suatu hari.",
  },
  {
    id: "q2",
    prompt: "'Then' dipakai untuk ...",
    options: [
      { id: "a", text: "Menunjukkan urutan kejadian" },
      { id: "b", text: "Mengakhiri cerita" },
      { id: "c", text: "Menanyakan nama" },
    ],
    correct: "a",
    feedback: "Betul! Then artinya lalu/kemudian.",
  },
];

const ASK_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Kamu mau tahu kesukaan teman. Apa pertanyaanmu?",
    options: [
      { id: "a", text: "What do you like?" },
      { id: "b", text: "What you like?" },
      { id: "c", text: "You like what?" },
    ],
    correct: "a",
    feedback: "Benar! 'What do you like?' adalah pertanyaan lengkap.",
  },
  {
    id: "q2",
    prompt: "Teman menjawab, lalu kamu mau bertanya lagi. Apa yang kamu bilang?",
    options: [
      { id: "a", text: "Tell me more!" },
      { id: "b", text: "Stop talking!" },
      { id: "c", text: "I don't care." },
    ],
    correct: "a",
    feedback: "Benar! 'Tell me more' artinya ceritakan lebih banyak.",
  },
];

const WEEKEND_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Kamu bermain bola kemarin. Apa yang kamu bilang?",
    options: [
      { id: "a", text: "Yesterday, I played football." },
      { id: "b", text: "Yesterday, I play football." },
      { id: "c", text: "Yesterday, I playing football." },
    ],
    correct: "a",
    feedback: "Benar! Untuk kemarin, play menjadi played.",
  },
  {
    id: "q2",
    prompt: "'I went to the park' artinya ...",
    options: [
      { id: "a", text: "Aku pergi ke taman" },
      { id: "b", text: "Aku tinggal di taman" },
      { id: "c", text: "Aku bermain di taman" },
    ],
    correct: "a",
    feedback: "Betul! Went adalah bentuk lampau dari go.",
  },
];

const SHOW_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Kamu mau menunjukkan mainanmu. Apa yang kamu bilang?",
    options: [
      { id: "a", text: "Look at my toy!" },
      { id: "b", text: "Look my toy at!" },
      { id: "c", text: "At my toy look!" },
    ],
    correct: "a",
    feedback: "Benar! 'Look at my toy' artinya lihat mainanku.",
  },
  {
    id: "q2",
    prompt: "Show & tell yang baik dimulai dengan ...",
    options: [
      { id: "a", text: "Sapaan dan nama" },
      { id: "b", text: "Diam saja" },
      { id: "c", text: "Langsung selesai" },
    ],
    correct: "a",
    feedback: "Betul! Mulai dengan 'Hello, my name is ...'.",
  },
];

const FINAL_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Apa yang membuat presentasi kecilmu jelas?",
    options: [
      { id: "a", text: "Bicara pelan, lihat kamera, dan tersenyum" },
      { id: "b", text: "Bicara sangat cepat" },
      { id: "c", text: "Membaca terus tanpa berhenti" },
    ],
    correct: "a",
    feedback: "Benar! Pelan, jelas, dan tersenyum membuat pendengar nyaman.",
  },
  {
    id: "q2",
    prompt: "Kalau lupa kata, apa yang bisa kamu lakukan?",
    options: [
      { id: "a", text: "Pakai kata lain atau bilang 'Let me think'" },
      { id: "b", text: "Diam dan menyerah" },
      { id: "c", text: "Langsung keluar" },
    ],
    correct: "a",
    feedback: "Betul! 'Let me think' memberi waktu untuk mencari kata.",
  },
];

const TOY_GLOSSARY: GlossaryTerm[] = [
  { term: "ball", pronunciation: "bawl", meaning: "bola", example: "This is my red ball." },
  { term: "doll", pronunciation: "dol", meaning: "boneka", example: "I have a small doll." },
  { term: "car", pronunciation: "kar", meaning: "mobil", example: "My toy car is blue." },
  { term: "kite", pronunciation: "kyt", meaning: "layangan", example: "I fly a kite at the park." },
  { term: "robot", pronunciation: "ROH-bot", meaning: "robot", example: "My robot can walk." },
];

export const COURSES: Course[] = [
  {
    slug: "little-speakers",
    title: "Little Speakers",
    subtitle: "Kids 6–12 • Berani bicara lewat cerita & permainan",
    level: "Pre-A1 – A1",
    format: "4 tahap • 12 misi • 20 menit per misi • pendampingan guru",
    promise:
      "Anak mulai dari satu kata dan satu kalimat, lalu perlahan berani bercerita 60 detik dan menjawab pertanyaan sederhana.",
    outcomes: [
      "Menyapa, memperkenalkan diri, dan menyebut kesukaan.",
      "Memakai kosakata warna, mainan, keluarga, makanan, dan aktivitas harian.",
      "Bercerita pendek dengan bantuan gambar dan urutan sederhana.",
      "Bertanya dan menjawab pertanyaan teman.",
      "Tampil Show & Tell 60 detik dengan percaya diri.",
    ],
    modules: [
      {
        slug: "explorer",
        title: "Explorer",
        sessions: "Misi 1–3",
        objective:
          "Anak berani menyapa, menyebut nama, dan mengenali kosakata sekitar.",
        exit: "Rekaman perkenalan 20–30 detik + 3 kosakata baru.",
        lessons: [
          {
            slug: "hello-its-me",
            title: "Hello, It's Me!",
            objective: "Menyapa dan memperkenalkan nama dengan satu kalimat.",
            duration: 20,
            format: "Video sapaan + latihan ulang + rekaman",
            keyPhrases: [
              { phrase: "Hello!", meaning: "Halo!" },
              { phrase: "My name is ___.", meaning: "Namaku ___." },
              { phrase: "What is your name?", meaning: "Siapa namamu?" },
              { phrase: "Nice to meet you.", meaning: "Senang bertemu denganmu." },
            ],
            mission: "Rekam 20–30 detik: sapa, sebut nama, lalu tanya nama.",
            missionExample:
              "Hello! My name is Bima. Nice to meet you. What is your name?",
            selfCheck: KIDS_SELF_CHECK,
            quiz: HELLO_QUIZ,
          },
          {
            slug: "colors-and-toys",
            title: "Colors & Toys",
            objective: "Menyebut warna dan mainan favorit.",
            duration: 20,
            format: "Lagu warna + permainan 'I spy' + rekaman",
            keyPhrases: [
              { phrase: "It is ___.", meaning: "Ini ___." },
              { phrase: "I have a ___.", meaning: "Aku punya ___." },
              { phrase: "My favorite color is ___.", meaning: "Warna favoritku ___." },
              { phrase: "Look at my ___.", meaning: "Lihat ___ milikku." },
            ],
            mission: "Tunjukkan 3 mainan dan sebutkan warna serta namanya.",
            missionExample:
              "I have a red ball, a blue car, and a yellow kite.",
            selfCheck: KIDS_SELF_CHECK,
            quiz: COLOR_QUIZ,
            glossary: TOY_GLOSSARY,
          },
          {
            slug: "my-family",
            title: "My Family",
            objective: "Menyebut anggota keluarga dengan kalimat sederhana.",
            duration: 20,
            format: "Gambar keluarga + contoh kalimat + rekaman",
            keyPhrases: [
              { phrase: "This is my ___.", meaning: "Ini ___ku." },
              { phrase: "I love my ___.", meaning: "Aku sayang ___ku." },
              { phrase: "My mother is ___.", meaning: "Ibuku ___." },
              { phrase: "We live together.", meaning: "Kami tinggal bersama." },
            ],
            mission: "Tunjukkan gambar keluarga dan sebutkan 3 orang.",
            missionExample:
              "This is my mother. This is my father. This is my sister. I love my family.",
            selfCheck: KIDS_SELF_CHECK,
            quiz: FAMILY_QUIZ,
          },
        ],
      },
      {
        slug: "builder",
        title: "Builder",
        sessions: "Misi 4–6",
        objective:
          "Anak bisa menyusun kalimat pendek tentang rutinitas, makanan, dan sekolah.",
        exit: "Rekaman 4 kalimat tentang hari dan kesukaan.",
        lessons: [
          {
            slug: "my-day",
            title: "My Day",
            objective: "Menceritakan rutinitas pagi sampai malam dengan kalimat pendek.",
            duration: 20,
            format: "Urutan gambar + gerakan + rekaman",
            keyPhrases: [
              { phrase: "I wake up.", meaning: "Aku bangun." },
              { phrase: "I brush my teeth.", meaning: "Aku menyikat gigi." },
              { phrase: "I go to school.", meaning: "Aku pergi ke sekolah." },
              { phrase: "I sleep at night.", meaning: "Aku tidur di malam hari." },
            ],
            mission: "Rekam 4 kalimat tentang harimu dari pagi sampai malam.",
            missionExample:
              "I wake up in the morning. I brush my teeth. I go to school. I sleep at night.",
            selfCheck: KIDS_SELF_CHECK,
            quiz: DAY_QUIZ,
          },
          {
            slug: "food-i-like",
            title: "Food I Like",
            objective: "Menyebut makanan dan minuman yang disukai atau tidak disukai.",
            duration: 20,
            format: "Gambar makanan + sorting game + rekaman",
            keyPhrases: [
              { phrase: "I like ___.", meaning: "Aku suka ___." },
              { phrase: "I don't like ___.", meaning: "Aku tidak suka ___." },
              { phrase: "It is yummy.", meaning: "Ini enak." },
              { phrase: "My favorite food is ___.", meaning: "Makanan favoritku ___." },
            ],
            mission: "Sebutkan 2 makanan yang kamu suka dan 1 yang tidak kamu suka.",
            missionExample:
              "I like fried rice and noodles. I don't like onions. My favorite food is fried rice.",
            selfCheck: KIDS_SELF_CHECK,
            quiz: FOOD_QUIZ,
          },
          {
            slug: "at-school",
            title: "At School",
            objective: "Meminta izin dan menyebut benda di kelas.",
            duration: 20,
            format: "Role-play kelas + kosakata benda + rekaman",
            keyPhrases: [
              { phrase: "May I borrow ___?", meaning: "Boleh aku pinjam ___?" },
              { phrase: "This is my ___.", meaning: "Ini ___ku." },
              { phrase: "I know the answer!", meaning: "Aku tahu jawabannya!" },
              { phrase: "Can you help me?", meaning: "Bisa bantu aku?" },
            ],
            mission: "Rekam percakapan kecil: minta pinjam pensil lalu berterima kasih.",
            missionExample:
              "May I borrow a pencil? Thank you! Can you help me with this book?",
            selfCheck: KIDS_SELF_CHECK,
            quiz: SCHOOL_QUIZ,
          },
        ],
      },
      {
        slug: "speaker",
        title: "Speaker",
        sessions: "Misi 7–9",
        objective:
          "Anak berani bercerita pendek, bertanya, dan menanggapi teman.",
        exit: "Cerita 45–60 detik + 2 pertanyaan.",
        lessons: [
          {
            slug: "my-favorite-animal",
            title: "My Favorite Animal",
            objective: "Mendeskripsikan hewan favorit dengan 3 kalimat.",
            duration: 20,
            format: "Suara hewan + gambar + rekaman deskripsi",
            keyPhrases: [
              { phrase: "My favorite animal is ___.", meaning: "Hewan favoritku ___." },
              { phrase: "It is ___.", meaning: "Hewan itu ___." },
              { phrase: "It can ___.", meaning: "Hewan itu bisa ___." },
              { phrase: "It likes ___.", meaning: "Hewan itu suka ___." },
            ],
            mission: "Rekam 3 kalimat tentang hewan favoritmu.",
            missionExample:
              "My favorite animal is a cat. It is small and soft. It can jump and it likes milk.",
            selfCheck: KIDS_SELF_CHECK,
            quiz: ANIMAL_QUIZ,
          },
          {
            slug: "story-time",
            title: "Story Time",
            objective: "Bercerita pendek dengan pembuka, urutan, dan penutup.",
            duration: 20,
            format: "Cerita bergambar + urutan + rekaman",
            keyPhrases: [
              { phrase: "Once upon a time, ___.", meaning: "Pada suatu hari, ___." },
              { phrase: "Then, ___.", meaning: "Lalu, ___." },
              { phrase: "After that, ___.", meaning: "Setelah itu, ___." },
              { phrase: "The end.", meaning: "Selesai." },
            ],
            mission: "Rekam cerita 45 detik dengan 3 urutan kejadian.",
            missionExample:
              "Once upon a time, a little cat was hungry. Then, it looked for food. After that, it found some milk. The end.",
            selfCheck: KIDS_SELF_CHECK,
            quiz: STORY_QUIZ,
          },
          {
            slug: "ask-and-answer",
            title: "Ask & Answer",
            objective: "Bertanya dan menjawab pertanyaan sederhana tentang kesukaan.",
            duration: 20,
            format: "Wawancara teman + pertanyaan lanjutan + rekaman",
            keyPhrases: [
              { phrase: "What do you like?", meaning: "Apa yang kamu suka?" },
              { phrase: "Do you like ___?", meaning: "Apakah kamu suka ___?" },
              { phrase: "Yes, I do. / No, I don't.", meaning: "Ya / Tidak." },
              { phrase: "Tell me more!", meaning: "Ceritakan lagi!" },
            ],
            mission: "Tanya 3 pertanyaan ke teman atau keluarga, lalu catat jawabannya.",
            missionExample:
              "Do you like ice cream? What do you like? Tell me more!",
            selfCheck: KIDS_SELF_CHECK,
            quiz: ASK_QUIZ,
          },
        ],
      },
      {
        slug: "communicator",
        title: "Communicator",
        sessions: "Misi 10–12",
        objective:
          "Anak tampil Show & Tell, bercerita tentang akhir pekan, dan menjawab pertanyaan.",
        exit: "Show & Tell 60 detik + 1 pertanyaan.",
        lessons: [
          {
            slug: "my-weekend",
            title: "My Weekend",
            objective: "Menceritakan aktivitas akhir pekan dengan bentuk lampau sederhana.",
            duration: 20,
            format: "Kalender mini + contoh + rekaman",
            keyPhrases: [
              { phrase: "Yesterday, I ___.", meaning: "Kemarin, aku ___." },
              { phrase: "I went to ___.", meaning: "Aku pergi ke ___." },
              { phrase: "I played ___.", meaning: "Aku bermain ___." },
              { phrase: "It was fun!", meaning: "Itu menyenangkan!" },
            ],
            mission: "Rekam 4 kalimat tentang akhir pekanmu.",
            missionExample:
              "Yesterday, I went to the park. I played football with my friend. It was fun!",
            selfCheck: KIDS_SELF_CHECK,
            quiz: WEEKEND_QUIZ,
            deepDive: {
              label: "Untuk orang tua",
              title: "Mendampingi tanpa mengejar kesempurnaan",
              paragraphs: [
                "Di tahap ini, tujuan utamanya adalah keberanian mencoba, bukan tata bahasa sempurna.",
                "Biarkan anak menyelesaikan kalimatnya. Koreksi satu hal saja setelah selesai.",
              ],
              bullets: [
                "Puji usaha: 'Kamu berani bilang sendiri!'",
                "Ulangi kalimat anak dengan bentuk yang benar, tanpa menyuruh mengulang.",
                "Batasi latihan 15–20 menit agar tetap menyenangkan.",
              ],
              takeaway: "Berani dulu, rapi kemudian.",
            },
          },
          {
            slug: "show-and-tell",
            title: "Show & Tell",
            objective: "Menunjukkan benda favorit dan menjelaskannya dalam 60 detik.",
            duration: 20,
            format: "Kerangka 3 kalimat + latihan + rekaman",
            keyPhrases: [
              { phrase: "Look at my ___.", meaning: "Lihat ___ milikku." },
              { phrase: "This is my favorite ___.", meaning: "Ini ___ favoritku." },
              { phrase: "It is special because ___.", meaning: "Ini istimewa karena ___." },
              { phrase: "Thank you for listening.", meaning: "Terima kasih sudah mendengarkan." },
            ],
            mission: "Rekam Show & Tell 60 detik tentang satu benda favorit.",
            missionExample:
              "Hello! Look at my blue robot. This is my favorite toy. It is special because my father gave it to me. Thank you for listening.",
            selfCheck: KIDS_SELF_CHECK,
            quiz: SHOW_QUIZ,
          },
          {
            slug: "little-speaker",
            title: "Little Speaker",
            objective: "Tampil percaya diri dan menjawab satu pertanyaan penonton.",
            duration: 20,
            format: "Gladi bersih + show & tell final + pertanyaan",
            keyPhrases: [
              { phrase: "Let me think.", meaning: "Biar aku pikirkan." },
              { phrase: "I think ___.", meaning: "Aku pikir ___." },
              { phrase: "Can you say that again?", meaning: "Bisa ulangi?" },
              { phrase: "I did it!", meaning: "Aku berhasil!" },
            ],
            mission:
              "Rekam Show & Tell 60 detik, lalu jawab satu pertanyaan dari orang tua/guru.",
            missionExample:
              "Hello, my name is Sari. This is my drawing. I made it yesterday. I think it is beautiful. I did it!",
            selfCheck: KIDS_SELF_CHECK,
            quiz: FINAL_QUIZ,
          },
        ],
      },
    ],
    resources: [
      {
        slug: "hello-quiz",
        type: "Quiz",
        title: "Kuis Sapaan & Nama",
        description: "2 soal sederhana untuk mengecek sapaan dan perkenalan.",
        moduleSlug: "explorer",
        lessonSlug: "hello-its-me",
      },
      {
        slug: "toy-glossary",
        type: "Glossary",
        title: "Kata Mainan & Warna",
        description: "5 kata mainan dengan contoh kalimat pendek.",
        moduleSlug: "explorer",
        lessonSlug: "colors-and-toys",
      },
      {
        slug: "parent-guide",
        type: "Panduan",
        title: "Mendampingi Anak di Rumah",
        description: "Cara memuji usaha dan mengoreksi satu hal saja.",
        moduleSlug: "communicator",
        lessonSlug: "my-weekend",
      },
      {
        slug: "show-and-tell-frame",
        type: "Activity",
        title: "Kerangka Show & Tell 60 Detik",
        description: "Sapaan, benda favorit, alasan istimewa, dan penutup.",
        moduleSlug: "communicator",
        lessonSlug: "show-and-tell",
      },
    ],
  },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((course) => course.slug === slug);
}

export function getModule(course: Course, moduleSlug: string): CourseModule | undefined {
  return course.modules.find((mod) => mod.slug === moduleSlug);
}

export function getLesson(
  course: Course,
  moduleSlug: string,
  lessonSlug: string
): { module: CourseModule; lesson: Lesson; lessonNumber: number } | undefined {
  const mod = getModule(course, moduleSlug);
  if (!mod) return undefined;
  const lessonIndex = mod.lessons.findIndex((lesson) => lesson.slug === lessonSlug);
  if (lessonIndex === -1) return undefined;
  return { module: mod, lesson: mod.lessons[lessonIndex], lessonNumber: lessonIndex + 1 };
}

export type FlatLesson = {
  key: string;
  courseSlug: string;
  moduleSlug: string;
  moduleTitle: string;
  lesson: Lesson;
  lessonNumber: number;
  moduleNumber: number;
};

export function flattenLessons(course: Course): FlatLesson[] {
  return course.modules.flatMap((mod, moduleIndex) =>
    mod.lessons.map((lesson, lessonIndex) => ({
      key: `${mod.slug}/${lesson.slug}`,
      courseSlug: course.slug,
      moduleSlug: mod.slug,
      moduleTitle: mod.title,
      lesson,
      lessonNumber: lessonIndex + 1,
      moduleNumber: moduleIndex + 1,
    }))
  );
}

export function totalLessons(course: Course): number {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}
