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

const SELF_CHECK = [
  "Saya memakai minimal 2 frasa kunci tanpa membaca.",
  "Saya menyelesaikan misi bicara sampai selesai.",
  "Saya mencatat satu hal yang ingin saya perbaiki.",
];

const PAST_SIMPLE_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt:
      "You are chatting with a friend after class. You want to say that you stayed home yesterday because you were sick. Which sentence should you use?",
    options: [
      { id: "a", text: "I am stay at home yesterday because I am sick." },
      { id: "b", text: "I stayed at home yesterday because I was sick." },
      { id: "c", text: "I didn't stayed at home yesterday because I was sick." },
      { id: "d", text: "I stay at home yesterday because I was sick." },
    ],
    correct: "b",
    feedback:
      "B benar karena 'stayed' dan 'was' sama-sama past, cocok dengan 'yesterday'. A mencampur 'am' dengan base verb. C memakai 'stayed' setelah 'didn't'. D memakai present 'stay' untuk waktu lampau.",
  },
  {
    id: "q2",
    prompt: "You want to ask your friend about their weekend. Which question is correct?",
    options: [
      { id: "a", text: "What did you do last weekend?" },
      { id: "b", text: "What did you did last weekend?" },
      { id: "c", text: "What you did last weekend?" },
      { id: "d", text: "What do you did last weekend?" },
    ],
    correct: "a",
    feedback:
      "A benar karena pertanyaan past simple memakai 'did' + base verb. B mengulang past di 'did you did'. C tidak punya auxiliary dan inversion. D mencampur 'do' dengan 'did'.",
  },
  {
    id: "q3",
    prompt:
      "Your friend asks why you did not join the study group. You want to explain that you did not have time. Which reply is correct?",
    options: [
      { id: "a", text: "I didn't had time." },
      { id: "b", text: "I didn't have time." },
      { id: "c", text: "I don't had time." },
      { id: "d", text: "I not have time." },
    ],
    correct: "b",
    feedback:
      "B benar karena 'didn't' sudah membawa makna past, jadi verb utama tetap base: 'didn't have'. A memakai 'had' setelah 'didn't'. C memakai present 'don't'. D tidak punya auxiliary.",
  },
  {
    id: "q4",
    prompt: "You are telling your teacher why you were late. Which sentence is correct and natural?",
    options: [
      { id: "a", text: "I missed the bus because I woke up late." },
      { id: "b", text: "I miss the bus because I wake up late." },
      { id: "c", text: "I missed the bus because I wake up late." },
      { id: "d", text: "I was missed the bus because I woke up late." },
    ],
    correct: "a",
    feedback:
      "A benar karena dua kejadian itu sudah selesai: 'missed' dan 'woke up'. B memakai present. C mencampur past dan present. D memakai passive 'was missed' yang mengubah makna.",
  },
  {
    id: "q5",
    prompt: "You are explaining when you moved to your current city. Which sentence is correct?",
    options: [
      { id: "a", text: "I move here two years ago." },
      { id: "b", text: "I moved here two years ago." },
      { id: "c", text: "I have moved here two years ago." },
      { id: "d", text: "I was move here two years ago." },
    ],
    correct: "b",
    feedback:
      "B benar karena 'two years ago' adalah waktu selesai, jadi past simple 'moved' yang dipakai. A memakai present. C memakai present perfect dengan waktu selesai. D memakai 'was' + base verb.",
  },
  {
    id: "q6",
    prompt: "In a past simple negative sentence, the main verb stays in the base form after 'didn't'.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" },
    ],
    correct: "a",
    feedback:
      "True. 'Didn't' sudah membawa makna past, jadi verb utama tetap base: 'I didn't go'. Bentuk 'I didn't went' salah karena past ditambahkan dua kali.",
  },
];

const TRAVEL_GLOSSARY: GlossaryTerm[] = [
  {
    term: "Could you point me toward...?",
    pronunciation: "kuud yoo POYNT mee tuh-WORD",
    meaning: "Meminta orang menunjukkan arah umum sebuah tempat.",
    example: "Excuse me, could you point me toward the nearest train station?",
  },
  {
    term: "How do I get to...?",
    pronunciation: "how doo eye GET too",
    meaning: "Menanyakan rute atau transportasi untuk sampai ke suatu tempat.",
    example: "How do I get to the old town from here?",
  },
  {
    term: "Is it within walking distance?",
    pronunciation: "iz it with-IN WAW-king DIS-tuns",
    meaning: "Menanyakan apakah tempat itu cukup dekat untuk ditempuh jalan kaki.",
    example: "Is the museum within walking distance, or should I take a taxi?",
  },
  {
    term: "I'm looking for...",
    pronunciation: "eyem LOOK-ing for",
    meaning: "Cara sopan mengatakan bahwa kamu sedang mencari tempat atau benda.",
    example: "I'm looking for the bus stop to the airport.",
  },
  {
    term: "Where is the nearest...?",
    pronunciation: "wair iz thuh NEER-ist",
    meaning: "Menanyakan tempat terdekat dari jenis tertentu.",
    example: "Where is the nearest convenience store?",
  },
  {
    term: "Go straight ahead.",
    pronunciation: "goh STRAYT uh-HED",
    meaning: "Terus maju tanpa berbelok.",
    example: "Go straight ahead for two blocks, and you will see the bank.",
  },
  {
    term: "Take the first left.",
    pronunciation: "tayk thuh FURST LEFT",
    meaning: "Belok kiri di jalan atau bukaan pertama.",
    example: "Take the first left after the pharmacy.",
  },
  {
    term: "It's on your right.",
    pronunciation: "its on yor RYTE",
    meaning: "Tempat itu ada di sisi kanan saat kamu menghadap ke depan.",
    example: "The cafe is on your right, next to the bookstore.",
  },
  {
    term: "Am I going the right way?",
    pronunciation: "am eye GOH-ing thuh RYTE way",
    meaning: "Mengecek apakah arah yang kamu ambil menuju tempat yang benar.",
    example: "Am I going the right way to the beach?",
  },
  {
    term: "Could you say that again more slowly?",
    pronunciation: "kuud yoo say that uh-GEN mor SLOH-lee",
    meaning: "Meminta orang mengulang petunjuk dengan lebih lambat.",
    example: "Sorry, could you say that again more slowly? I want to write it down.",
  },
];

export const COURSES: Course[] = [
  {
    slug: "comprehensive-track-30",
    title: "KOLASE Comprehensive Track 30",
    subtitle: "Pre-Intermediate Speaking Mastery",
    level: "A2 to B1",
    format: "30 sesi live, 10 minggu, 3 sesi per minggu, 3 to 5 murid",
    promise:
      "Mulai dari kalimat pendek yang masih ragu, lalu sampai bisa bicara 2 menit tanpa naskah dan menjawab pertanyaan susulan.",
    outcomes: [
      "Memperkenalkan diri dan menjaga percakapan 90 detik.",
      "Menangani situasi harian: small talk, rencana, permintaan, dan telepon sederhana.",
      "Menyampaikan opini dengan alasan dan contoh.",
      "Memperbaiki percakapan saat tidak paham, tanpa panik.",
      "Tampil 2 menit tanpa naskah dan menjawab 2 pertanyaan susulan.",
    ],
    modules: [
      {
        slug: "foundation",
        title: "From Hesitation to First Words",
        sessions: "Sesi 1-7",
        objective:
          "Murid bisa memperkenalkan diri, bertanya, dan menjaga percakapan 90 detik dengan frasa yang bisa dipakai langsung.",
        exit: "Rekaman perkenalan 90 detik + dua pertanyaan dari grup.",
        lessons: [
          {
            slug: "start-before-you-feel-ready",
            title: "Start Before You Feel Ready",
            objective:
              "Memperkenalkan diri 60 detik dan menetapkan satu target bicara yang spesifik.",
            duration: 60,
            format: "Baseline interview + rekaman perkenalan",
            keyPhrases: [
              { phrase: "Hi, I'm ___.", meaning: "Perkenalan singkat." },
              { phrase: "I'm from ___.", meaning: "Menyebut asal atau kota." },
              { phrase: "I like ___.", meaning: "Menyebut satu hal yang disukai." },
              { phrase: "What about you?", meaning: "Mengembalikan pertanyaan." },
            ],
            mission:
              "Rekam 60 detik: nama, asal, satu hal yang kamu suka, lalu tanya balik.",
            missionExample:
              "Hi, I'm Rina. I'm from Bandung. I like photography. What about you?",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "sentence-engine",
            title: "The Sentence Engine: Three Tenses You Can Use",
            objective:
              "Bicara tentang sekarang, kemarin, dan rencana dengan tiga pola dasar yang sering dipakai.",
            duration: 60,
            format: "Grammar in context + drill + speaking task",
            keyPhrases: [
              { phrase: "I usually ___.", meaning: "Rutinitas sekarang." },
              { phrase: "Yesterday, I ___.", meaning: "Aksi selesai di masa lalu." },
              { phrase: "Next week, I'm going to ___.", meaning: "Rencana." },
              { phrase: "After that, I ___.", meaning: "Urutan cerita." },
            ],
            mission:
              "Rekam 5 kalimat: 1 rutinitas, 1 kemarin, 1 rencana, dan 2 detail.",
            missionExample:
              "I usually study at night. Yesterday, I studied with my cousin. Next week, I'm going to join a speaking class.",
            selfCheck: SELF_CHECK,
            quiz: PAST_SIMPLE_QUIZ,
            deepDive: {
              label: "Microlearning",
              title: "Past simple weekend stories",
              paragraphs: [
                "Past simple dipakai untuk aksi akhir pekan yang sudah selesai. Pakai bentuk past sekali saja.",
                "Kalau ada did atau didn't, kata kerja utama kembali ke bentuk dasar.",
              ],
              bullets: [
                "Time marker: yesterday, last Saturday, on Sunday.",
                "Regular: watch menjadi watched. Irregular: go menjadi went, eat menjadi ate.",
                "Hindari: 'Yesterday I go' dan 'I didn't went'.",
              ],
              example:
                "I went to the beach with my family last Saturday. I didn't swim because the water was cold.",
              takeaway: "Past once, not twice.",
            },
          },
          {
            slug: "clear-enough",
            title: "Clear Enough to Be Understood",
            objective:
              "Memakai word stress dan rhythm supaya pesan lebih mudah ditangkap.",
            duration: 60,
            format: "Listening model + shadowing + pronunciation clinic",
            keyPhrases: [
              { phrase: "Could you say that again?", meaning: "Meminta ulang." },
              { phrase: "Listen to the stress: toMORrow.", meaning: "Contoh tekanan kata." },
              { phrase: "I wanted to say ___.", meaning: "Memperbaiki ucapan." },
              { phrase: "Let me try that again.", meaning: "Mengulang dengan lebih jelas." },
            ],
            mission:
              "Rekam 45 detik. Pilih 3 kata penting dan beri tekanan pada kata itu.",
            missionExample:
              "I wanted to say that I was busy YESTERDAY, not today.",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "questions-that-keep-people-talking",
            title: "Questions That Keep People Talking",
            objective:
              "Mengajukan pertanyaan terbuka dan follow-up supaya percakapan tidak berhenti.",
            duration: 60,
            format: "Dialogue analysis + question writing + interview carousel",
            keyPhrases: [
              { phrase: "What about you?", meaning: "Tanya balik." },
              { phrase: "How was that?", meaning: "Minta detail." },
              { phrase: "Why do you like it?", meaning: "Menggali alasan." },
              { phrase: "Tell me more.", meaning: "Meminta cerita lebih panjang." },
            ],
            mission:
              "Tanya satu teman 3 pertanyaan follow-up. Catat satu detail dari jawabannya.",
            missionExample:
              "I like badminton. What about you? How often do you play?",
            selfCheck: SELF_CHECK,
            deepDive: {
              label: "Activity",
              title: "Hobby Chain: Find Your Match",
              paragraphs: [
                "Aktivitas 15 menit untuk latihan perkenalan dan hobi. Semua murid memakai frame yang sama, jadi tekanan untuk tampil berkurang.",
              ],
              bullets: [
                "Model: 'Hi, I'm ___. I like ___. What about you?'",
                "Round 1: satu kalimat per murid.",
                "Round 2: tanya satu follow-up.",
                "Round 3: cari teman dengan hobi sama, lalu bilang 'Me too!'",
                "Self-check: nama, hobi, satu pertanyaan.",
              ],
              example: "Hi, I'm Sari. I like badminton. What about you?",
              takeaway: "Ask, listen, ask back.",
            },
          },
          {
            slug: "repair-without-panic",
            title: "Repair Without Panic",
            objective:
              "Memakai frasa perbaikan saat tidak paham atau kehilangan kata.",
            duration: 60,
            format: "Strategy video + role-play + meaning-gap game",
            keyPhrases: [
              { phrase: "Sorry, could you repeat that?", meaning: "Meminta ulang." },
              { phrase: "Do you mean ___?", meaning: "Mengecek pemahaman." },
              { phrase: "I didn't catch that.", meaning: "Tidak menangkap ucapan." },
              { phrase: "Let me say that again.", meaning: "Mengulang ucapan." },
            ],
            mission:
              "Rekam 60 detik dan gunakan 2 frasa perbaikan saat ada bagian yang tidak jelas.",
            missionExample:
              "Sorry, I didn't catch that. Do you mean the meeting starts at nine?",
            selfCheck: SELF_CHECK,
          },
        ],
      },
      {
        slug: "everyday-fluency",
        title: "Everyday Fluency",
        sessions: "Sesi 8-15",
        objective:
          "Murid bisa menangani lima situasi harian, menjaga interaksi 3 menit, dan memperbaiki salah paham dengan lebih sedikit bantuan bahasa Indonesia.",
        exit: "Role-play 3 menit dari bank situasi harian.",
        lessons: [
          {
            slug: "small-talk-that-doesnt-die",
            title: "Small Talk That Doesn't Die",
            objective:
              "Membuka, merespons, dan menutup small talk tanpa keheningan yang canggung.",
            duration: 60,
            format: "Listening input + question bank + live rounds",
            keyPhrases: [
              { phrase: "How's your week going?", meaning: "Membuka small talk." },
              { phrase: "That sounds great.", meaning: "Merespons positif." },
              { phrase: "Anyway, I should get going.", meaning: "Menutup percakapan." },
              { phrase: "Let's catch up soon.", meaning: "Menjaga hubungan." },
            ],
            mission:
              "Rekam 90 detik small talk: buka, beri respons, lalu tutup.",
            missionExample:
              "How's your week going? That sounds great. Anyway, I should get going. Let's catch up soon.",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "tell-it-simply",
            title: "Tell It Simply: Past Experiences",
            objective:
              "Menceritakan pengalaman pendek dengan urutan yang jelas dan penutup yang terasa selesai.",
            duration: 60,
            format: "Story model + guided story + storytelling circle",
            keyPhrases: [
              { phrase: "Last weekend, I ___.", meaning: "Memulai cerita." },
              { phrase: "After that, I ___.", meaning: "Urutan kejadian." },
              { phrase: "In the end, I ___.", meaning: "Menutup cerita." },
              { phrase: "It was fun because ___.", meaning: "Memberi alasan." },
            ],
            mission:
              "Rekam 90 detik cerita akhir pekan dengan 3 time markers.",
            missionExample:
              "Last weekend, I visited my grandparents. After that, we cooked together. In the end, I went home late.",
            selfCheck: SELF_CHECK,
            deepDive: {
              label: "Grammar",
              title: "Past continuous vs simple past",
              paragraphs: [
                "Dua-duanya tentang masa lalu. Bedanya ada di cara kita melihat aksi: sedang berjalan atau sudah selesai.",
                "Simple past itu foto: satu momen selesai. Past continuous itu video: aksi sedang berlangsung.",
              ],
              bullets: [
                "Simple past: 'I cooked dinner last night.'",
                "Past continuous: 'I was cooking at 7 p.m.'",
                "Interruption: 'I was cooking when the phone rang.'",
                "State verb: 'I knew', bukan 'I was knowing'.",
              ],
              example: "I was walking home when it started to rain.",
              takeaway: "Video untuk latar, foto untuk kejadian.",
            },
          },
          {
            slug: "make-plans-and-negotiate",
            title: "Make Plans and Negotiate",
            objective:
              "Mengajak, menawarkan waktu, menerima, dan menolak dengan sopan.",
            duration: 60,
            format: "Dialogue models + role-play cards + negotiation task",
            keyPhrases: [
              { phrase: "Do you want to ___?", meaning: "Mengajak." },
              { phrase: "How about ___?", meaning: "Menawarkan ide." },
              { phrase: "I'm free on ___.", meaning: "Menyebut waktu." },
              { phrase: "That works for me.", meaning: "Menyetujui." },
            ],
            mission:
              "Rekam percakapan 2 menit: ajak, tawar waktu, lalu setujui.",
            missionExample:
              "Do you want to study together? How about Thursday? That works for me.",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "get-things-done",
            title: "Get Things Done: Requests and Transactions",
            objective:
              "Membuat permintaan sopan, menangani transaksi sederhana, dan menyelesaikan masalah kecil.",
            duration: 60,
            format: "Functional language video + simulated call + role-play",
            keyPhrases: [
              { phrase: "Could you ___?", meaning: "Permintaan sopan." },
              { phrase: "Would you mind ___?", meaning: "Permintaan lebih sopan." },
              { phrase: "I'm sorry, but ___.", meaning: "Menolak dengan sopan." },
              { phrase: "I'd like to ___.", meaning: "Menyampaikan kebutuhan." },
            ],
            mission:
              "Rekam 2 menit transaksi: minta bantuan, jelaskan masalah, lalu cek hasil.",
            missionExample:
              "Could you help me with this form? I'd like to change my booking.",
            selfCheck: SELF_CHECK,
            glossary: TRAVEL_GLOSSARY,
          },
          {
            slug: "when-you-dont-understand",
            title: "When You Don't Understand",
            objective:
              "Menggunakan klarifikasi, parafrase, dan pengecekan makna.",
            duration: 60,
            format: "Strategy drill + noisy-line game + repair challenge",
            keyPhrases: [
              { phrase: "Sorry, I didn't catch that.", meaning: "Tidak menangkap." },
              { phrase: "So you mean ___?", meaning: "Mengulang pemahaman." },
              { phrase: "Could you speak more slowly?", meaning: "Minta lebih lambat." },
              { phrase: "Let me check.", meaning: "Membeli waktu." },
            ],
            mission:
              "Rekam 60 detik dengan 2 frasa klarifikasi.",
            missionExample:
              "Sorry, I didn't catch that. So you mean the class starts at seven?",
            selfCheck: SELF_CHECK,
          },
        ],
      },
      {
        slug: "opinions-that-land",
        title: "Opinions That Land",
        sessions: "Sesi 16-22",
        objective:
          "Murid bisa menyampaikan opini 2 menit dengan alasan, tidak setuju dengan sopan, dan menjawab satu pertanyaan susulan.",
        exit: "Opini 2 menit + Q&A.",
        lessons: [
          {
            slug: "take-a-position",
            title: "Take a Position",
            objective:
              "Menyatakan opini dan melunakkannya dengan frasa yang tepat.",
            duration: 60,
            format: "Model clip + sentence frames + opinion line",
            keyPhrases: [
              { phrase: "I think ___.", meaning: "Pendapat dasar." },
              { phrase: "In my opinion, ___.", meaning: "Pendapat formal." },
              { phrase: "I'm not sure, but ___.", meaning: "Pendapat hati-hati." },
              { phrase: "The reason is ___.", meaning: "Memberi alasan." },
            ],
            mission:
              "Rekam 60 detik opini dengan 1 alasan.",
            missionExample:
              "I think online classes work well for me. The reason is I can review the recording.",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "because-but-however",
            title: "Because, But, However",
            objective:
              "Menghubungkan alasan, kontras, dan contoh supaya pendengar bisa mengikuti.",
            duration: 60,
            format: "Linking words in context + guided writing + debate ladder",
            keyPhrases: [
              { phrase: "because", meaning: "Alasan." },
              { phrase: "but", meaning: "Kontras." },
              { phrase: "however", meaning: "Kontras formal." },
              { phrase: "for example", meaning: "Contoh." },
            ],
            mission:
              "Rekam 90 detik dengan 3 connector.",
            missionExample:
              "I like the plan, but the timeline is tight. However, we can start earlier. For example, we can finish the review on Thursday.",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "disagree-without-damage",
            title: "Disagree Without Damage",
            objective:
              "Tidak setuju dengan sopan, mengakui poin lawan bicara, dan menawarkan sudut pandang sendiri.",
            duration: 60,
            format: "Politeness scale + role-play + mini-debate",
            keyPhrases: [
              { phrase: "I see your point.", meaning: "Mengakui." },
              { phrase: "I see it a little differently.", meaning: "Melunakkan." },
              { phrase: "My concern is ___.", meaning: "Menyebut kekhawatiran." },
              { phrase: "What do you think?", meaning: "Mengundang." },
            ],
            mission:
              "Rekam 90 detik: akui, lunakkan, jelaskan, lalu tanya.",
            missionExample:
              "I see your point. I see it a little differently. My concern is the review time. What do you think?",
            selfCheck: SELF_CHECK,
            deepDive: {
              label: "Case Study",
              title: "The Meeting That Went Quiet",
              paragraphs: [
                "Rina, project coordinator, langsung bilang 'That's impossible' ke ide Dimas. Bahasa Inggrisnya benar, tapi Dimas berhenti berkontribusi.",
                "Masalahnya bukan grammar. Masalahnya cara menyampaikan perbedaan.",
                "KOLASE Bridge: Acknowledge, Soften, Explain, Invite.",
              ],
              bullets: [
                "Acknowledge: 'I see your point.'",
                "Soften: 'I see it a little differently.'",
                "Explain: 'The review usually takes three days.'",
                "Invite: 'What do you think?'",
              ],
              example:
                "I see your point. I see it a little differently. My concern is the review time. What do you think?",
              takeaway: "Bangun jembatan sebelum menyampaikan poin.",
            },
          },
          {
            slug: "tell-a-story-with-a-point",
            title: "Tell a Story with a Point",
            objective:
              "Menyusun cerita 2 menit dengan hook, konflik, dan pesan.",
            duration: 60,
            format: "Narrative arc model + outline + story circle",
            keyPhrases: [
              { phrase: "It started when ___.", meaning: "Membuka cerita." },
              { phrase: "Then ___.", meaning: "Lanjutan." },
              { phrase: "The point is ___.", meaning: "Pesan." },
              { phrase: "That's why ___.", meaning: "Kesimpulan." },
            ],
            mission:
              "Rekam 2 menit cerita dengan hook, konflik, dan pesan.",
            missionExample:
              "It started when I missed my bus. Then I had to walk. The point is, I should leave earlier.",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "think-on-your-feet",
            title: "Think on Your Feet",
            objective:
              "Menjawab pertanyaan tak terduga dalam 60 detik dengan struktur yang jelas.",
            duration: 60,
            format: "Impromptu prompt cards + recording + feedback",
            keyPhrases: [
              { phrase: "That's a good question.", meaning: "Membeli waktu." },
              { phrase: "Let me think for a second.", meaning: "Membeli waktu." },
              { phrase: "There are two reasons.", meaning: "Menyusun jawaban." },
              { phrase: "To sum up, ___.", meaning: "Menutup." },
            ],
            mission:
              "Jawab 3 pertanyaan acak dalam 60 detik masing-masing.",
            missionExample:
              "That's a good question. There are two reasons. First, it saves time. To sum up, I think it works.",
            selfCheck: SELF_CHECK,
          },
        ],
      },
      {
        slug: "confident-voice",
        title: "The Confident Voice",
        sessions: "Sesi 23-30",
        objective:
          "Murid bisa tampil 2 menit tanpa naskah, menjawab dua pertanyaan susulan, dan menyesuaikan register.",
        exit: "Final showcase 2 menit + Q&A.",
        lessons: [
          {
            slug: "structure-a-talk-in-three-moves",
            title: "Structure a Talk in Three Moves",
            objective:
              "Membuka dengan hook, menyampaikan satu poin utama, dan menutup dengan jelas.",
            duration: 60,
            format: "Talk analysis + outline template + 60-second talks",
            keyPhrases: [
              { phrase: "Today I want to talk about ___.", meaning: "Membuka." },
              { phrase: "My main point is ___.", meaning: "Poin utama." },
              { phrase: "For example, ___.", meaning: "Bukti." },
              { phrase: "To sum up, ___.", meaning: "Menutup." },
            ],
            mission:
              "Rekam 2 menit talk dengan hook, 1 poin, 1 contoh, dan closing.",
            missionExample:
              "Today I want to talk about morning routines. My main point is that small habits matter. For example, I read one page every morning.",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "your-voice-as-a-tool",
            title: "Your Voice as a Tool",
            objective:
              "Mengatur pace, pausing, dan intonation supaya pesan lebih mudah diingat.",
            duration: 60,
            format: "Listening models + delivery drills + recorded review",
            keyPhrases: [
              { phrase: "Pause before the key word.", meaning: "Teknik jeda." },
              { phrase: "Stress the contrast.", meaning: "Tekanan." },
              { phrase: "Slow down for the main point.", meaning: "Tempo." },
              { phrase: "Let the sentence land.", meaning: "Jeda akhir." },
            ],
            mission:
              "Rekam ulang 90 detik dengan 3 jeda yang disengaja.",
            missionExample:
              "I was nervous. [pause] But I still spoke. [pause] That was the win.",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "handle-the-q-and-a",
            title: "Handle the Q&A",
            objective:
              "Mendengar pertanyaan, membeli waktu, menjawab, dan mengecek pemahaman.",
            duration: 60,
            format: "Q&A model + pair drill + hot seat",
            keyPhrases: [
              { phrase: "That's a fair question.", meaning: "Mengakui." },
              { phrase: "Let me check that.", meaning: "Membeli waktu." },
              { phrase: "Does that answer your question?", meaning: "Mengecek." },
              { phrase: "Can I come back to that?", meaning: "Menunda." },
            ],
            mission:
              "Minta teman bertanya 3 pertanyaan. Jawab dengan 2 frasa Q&A.",
            missionExample:
              "That's a fair question. Let me check that. Does that answer your question?",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "switch-register",
            title: "Switch Register",
            objective:
              "Menyesuaikan formalitas untuk teman, kolega, dan orang baru.",
            duration: 60,
            format: "Comparison dialogues + role-play + switch task",
            keyPhrases: [
              { phrase: "Could you ___?", meaning: "Formal." },
              { phrase: "Can you ___?", meaning: "Kasual." },
              { phrase: "I'd like to ___.", meaning: "Formal." },
              { phrase: "Thanks a lot.", meaning: "Kasual." },
            ],
            mission:
              "Rekam 3 versi permintaan: teman, kolega, orang baru.",
            missionExample:
              "Can you send me the file? Could you send me the file, please?",
            selfCheck: SELF_CHECK,
          },
          {
            slug: "rehearse-like-a-speaker",
            title: "Rehearse Like a Speaker",
            objective:
              "Merekam, meninjau dengan rubrik, dan membuat satu perbaikan yang jelas.",
            duration: 60,
            format: "Self-review rubric + draft recording + feedback",
            keyPhrases: [
              { phrase: "One thing I want to improve is ___.", meaning: "Refleksi." },
              { phrase: "Next time, I will ___.", meaning: "Rencana." },
              { phrase: "I felt confident when ___.", meaning: "Bukti." },
              { phrase: "I need to practice ___.", meaning: "Fokus." },
            ],
            mission:
              "Rekam draft 1 dan draft 2. Bandingkan satu perbaikan.",
            missionExample:
              "One thing I want to improve is my pacing. Next time, I will pause after my main point.",
            selfCheck: SELF_CHECK,
          },
        ],
      },
    ],
    resources: [
      {
        slug: "diagnostic-quiz",
        type: "Quiz",
        title: "Kuis Diagnostik: Past Simple & Sentence Structure",
        description:
          "6 soal berbasis situasi untuk mengecek pemakaian past simple dan urutan kalimat.",
        moduleSlug: "foundation",
        lessonSlug: "sentence-engine",
      },
      {
        slug: "past-simple-microlearning",
        type: "Microlearning",
        title: "Past Simple Weekend Stories",
        description:
          "Ringkasan 150 kata: satu aturan inti, dua contoh, dan memory anchor.",
        moduleSlug: "foundation",
        lessonSlug: "sentence-engine",
      },
      {
        slug: "hobby-chain-activity",
        type: "Activity",
        title: "Hobby Chain: Find Your Match",
        description:
          "Aktivitas 15 menit untuk perkenalan, hobi, dan follow-up question.",
        moduleSlug: "foundation",
        lessonSlug: "questions-that-keep-people-talking",
      },
      {
        slug: "past-continuous-grammar",
        type: "Grammar",
        title: "Past Continuous vs Simple Past",
        description:
          "Analogi video dan foto untuk membedakan aksi yang sedang berjalan dan yang sudah selesai.",
        moduleSlug: "everyday-fluency",
        lessonSlug: "tell-it-simply",
      },
      {
        slug: "travel-glossary",
        type: "Glossary",
        title: "Travel & Navigation Expressions",
        description:
          "10 frasa A2 untuk bertanya arah, mengikuti rute, dan meminta pengulangan.",
        moduleSlug: "everyday-fluency",
        lessonSlug: "get-things-done",
      },
      {
        slug: "meeting-case-study",
        type: "Case Study",
        title: "The Meeting That Went Quiet",
        description:
          "Studi kasus tentang menyampaikan perbedaan pendapat tanpa mematikan percakapan.",
        moduleSlug: "opinions-that-land",
        lessonSlug: "disagree-without-damage",
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
