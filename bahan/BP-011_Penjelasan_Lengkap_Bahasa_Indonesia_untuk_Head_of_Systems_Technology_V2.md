KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

# BP-011 

## PENJELASAN LENGKAP DATA & SYSTEM ARCHITECTURE BLUEPRINT 

Referensi Bahasa Indonesia untuk Head of Systems & Technology 

#### **KOLASE** 

**Fungsi dokumen.** Dokumen ini menjelaskan BP-011 V0.9 dalam Bahasa Indonesia secara langsung dan sistematis. Dokumen ini dimaksudkan sebagai companion reference untuk memahami arsitektur, implementation package, dependency, technical review, build readiness, Go-Live, dan Production Baseline. Dokumen ini tidak menggantikan BP-011 sebagai source-oftruth dan tidak menambah business rule baru. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **STATUS DAN BATAS KEWENANGAN DOKUMEN** 

BP-011 V0.9 berada pada kondisi Architecture Complete / Unified Implementation Package Freeze Candidate. DEC-001 sampai DEC-017 dan Closure DEC sudah LOCKED. Architecture closure dan dependency audit sudah selesai. Unified Implementation Package sudah dikonsolidasikan dan final reaudit berstatus PASS, dengan Head of Systems & Technology Technical Review sebagai next gate. Namun kondisi ini belum berarti dokumen formal approved, system build selesai, Production Ready, atau Go-Live telah dimulai. 

|**Area**|**Status saat ini**|
|---|---|
|BP-011 Architecture|ARCHITECTURE COMPLETE|
|DEC-001 s.d. DEC-017|LOCKED|
|Closure DEC|LOCKED|
|Unified Implementation Package|FREEZE CANDIDATE COMPLETE|
|Appendix A–P|COMPLETE / CLOSED sesuai status|
|Final Consolidation Re-Audit|PASS — READY TO FREEZE|
|Head of Systems & Technology Technical Review|NEXT GATE|
|Formal Founder/Co-Founder Approval|PENDING|
|System Build|NOT STARTED under this baseline|
|Production Readiness|NOT READY|
|Go-Live|NOT STARTED|



**Aturan penggunaan.** Apabila penjelasan dalam dokumen ini terasa berbeda dengan BP-011 sumber, BP-011 sumber yang berlaku. Istilah canonical seperti Student ID, Enrollment ID, Session ID, ETX, RBAC, Production, TEST, Reconciliation, dan Production Baseline dipertahankan agar tidak menimbulkan terminologi paralel. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **PETA ISI** 

- Bagian I — Gambaran Besar dan Cara Membaca BP-011 

- Bagian II — Struktur Sistem: Source-of-Truth, Workbook, Entity, dan Data Classes 

- Bagian III — DEC-001 sampai DEC-017 secara lengkap 

- Bagian IV — Closure DEC, Decision Register, Dependency Register, dan Open Dependencies 

- Bagian V — Unified Implementation Package dan Appendix A–P 

- Bagian VI — Skenario End-to-End Student untuk Menghubungkan Seluruh Arsitektur 

- Bagian VII — Technical Review Head of Systems & Technology 

- Bagian VIII — Build, Production Readiness, Go-Live, dan Production Baseline 

- Bagian IX — Glosarium dan Non-Negotiable Invariants 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **BAGIAN I — GAMBARAN BESAR DAN CARA MEMBACA BP-011** 

##### **1. Apa yang sebenarnya dilakukan BP-011?** 

BP-011 adalah blueprint arsitektur data dan sistem untuk MVP KOLASE. Blueprint ini tidak hanya menentukan lokasi tabel atau nama workbook. BP-011 membentuk cara seluruh data dan proses bisnis KOLASE direpresentasikan sebagai system objects, records, transactions, workflows, permissions, audit history, configuration, integrations, reporting, backup, testing, migration, dan release controls. 

Tujuan utamanya adalah mencegah sistem tumbuh menjadi kumpulan spreadsheet yang saling bertentangan. Setiap fakta penting harus memiliki sumber yang jelas, setiap material action harus memiliki authority yang jelas, setiap transaction harus dapat dilacak, setiap correction harus mempertahankan history, dan setiap automation harus menjalankan approved rule tanpa menciptakan policy sendiri. 

**Versi sederhana.** Blueprint bisnis menjawab apa yang harus dilakukan KOLASE. BP-011 menjawab bagaimana sistem harus menyimpan, mengontrol, mengeksekusi, membuktikan, dan memulihkan business rule tersebut. 

##### **2. Apa yang tidak dilakukan BP-011?** 

- Tidak menggantikan SOP role-specific. 

- Tidak menggantikan code atau final Apps Script. 

- Tidak menggantikan BP-005/BP-006/BP-007 untuk detail academic, assessment, dan curriculum. 

- Tidak menggantikan BP-009 untuk detailed scheduling policy. 

- Tidak menggantikan BP-012 untuk advanced finance/accounting/forecast policy. 

- Tidak menggantikan BP-015 untuk exact legal/privacy/retention obligations. 

- Tidak memberi implementation team hak untuk mengisi business rule yang belum diputuskan. 

##### **3. Empat pertanyaan yang selalu dijawab BP-011** 

|**Pertanyaan**|**Jawaban arsitektural**|
|---|---|
|Siapa/apa yang sedang dibicarakan?|Canonical entity dan immutable ID.|
|Apa yang benar-benar terjadi?|Authoritative operational record/transaction.|
|Siapa yang boleh melakukan atau mengesahkan?|RBAC, authority, state transition, audit.|
|Kalau data/system salah atau gagal, bagaimana tetap<br>dapat dipercaya?|Correction, reconciliation, backup/restore, testing,<br>change control.|



##### **4. Masalah yang secara eksplisit ingin dicegah** 

- Conflicting truths antar file/sheet/dashboard/Calendar. 

- Hidden manual adjustments pada balance atau transaksi. 

- Duplicate identities dan duplicate transactions. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Payment/entitlement mismatch. 

- Automation yang opaque atau tidak dapat diretry dengan aman. 

- Access yang terlalu luas atau menggunakan shared privileged identity. 

- Correction yang menghapus history. 

- Reporting yang tidak bisa ditrace ke source transaction. 

- TEST data yang mengotori Production KPI, payroll, entitlement, Calendar, atau customer communication. 

- Backup yang ada sebagai file copy tetapi tidak pernah terbukti dapat direstore. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **BAGIAN II — STRUKTUR SISTEM: SOURCE-OF-TRUTH, WORKBOOK, ENTITY, DAN DATA CLASSES** 

##### **1. Source-of-Truth Hierarchy** 

BP-011 memisahkan policy truth, configuration truth, operational truth, evidence, projection, reporting, dan communication. Pemisahan ini penting karena masing-masing layer mempunyai authority yang berbeda. Sistem tidak boleh memperlakukan semua tempat penyimpanan informasi sebagai sumber yang sama kuat. 

|**Layer**|**Fungsi**|**Contoh artifact**|**Hal yang tidak boleh**<br>**dilakukan**|
|---|---|---|---|
|Business Rule Authority|Menentukan policy/rule|Blueprint + Decision<br>Register|Code/formula tidak boleh<br>mengubahnya|
|Configuration / Master<br>Authority|Menentukan<br>value/code/version yang<br>berlaku|WB-00<br>SYS_CONFIG_MASTER +<br>master tables|Tidak boleh jadi local<br>unmanaged constant|
|Structured Intake|Menerima submission|Google Forms →RAW|Submission tidak otomatis<br>final truth|
|Operational Source of<br>Truth|Menyimpan apa yang<br>benar-benar terjadi|Google Sheets<br>authoritative tables|Tidak boleh ada second<br>editable truth|
|Document Repository|Menyimpan<br>evidence/artifact|Google Drive|Drive file ID bukan<br>canonical business ID|
|Schedule Projection|Menampilkan canonical<br>Session truth|Google Calendar|Calendar tidak boleh<br>menentukan jadwal<br>canonical|
|Reporting|Menampilkan derived<br>KPI/view|WB-05|Dashboard tidak boleh<br>memperbaiki source data|
|Communication|Menyampaikan informasi|WhatsApp / notification<br>queue|Chat tidak boleh menjadi<br>material business record<br>tunggal|



Contoh: jika Google Calendar menampilkan kelas pukul 19.30, tetapi canonical Session record menunjukkan pukul 19.00, operational source-of-truth tetap Session record. Calendar harus direkonsiliasi atau disinkronkan kembali. Data tidak boleh diubah hanya agar sesuai dengan projection yang salah. 

##### **2. Enam Production Workbook** 

|**Workbook**|**Peran**|**Authoritative scope utama**|
|---|---|---|
|WB-00 — System Control &<br>Governance|Control plane|Config, Actors, code sets, registries,<br>decisions, audit, automation/system<br>governance|



Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

||KOLASE|BP|-011 — Penjelasan LengkapBahasa Indonesia|
|---|---|---|
|WB-01 — Core Student &<br>Operations|Daily operational engine|Students, Enrollments, Classes,<br>Sessions, Attendance, Entitlement,<br>service workflows|
|WB-02 — Commercial & Finance|Commercial/financial engine|Package/price, quotations,<br>adjustments, payments, sales,<br>expenses, payroll|
|WB-03 — Academic System|Academic definitions and evidence|Profiles, assessments, attempts,<br>Question Bank, learning<br>objectives/paths/progress|
|WB-04 — Risk, QA & Audit|Assurance operations|Risk, incident, controls, DQ,<br>reconciliation, findings, CAPA,<br>backup evidence|
|WB-05 — Management Reporting|Derived read-only management<br>information|KPI views, scorecards,<br>operating/business reviews|



Setiap logical entity hanya mempunyai satu authoritative home. Workbook lain boleh memiliki derived/reference view selama tidak menjadi second editable truth. WB-05 secara khusus tidak boleh menjadi tempat authoritative transaction atau write-back ke operational domain. 

##### **3. Cara sistem memandang data** 

|**Class data**|**Makna**|**Contoh**|
|---|---|---|
|Person / Party|Siapa yang terlibat|Student, Teacher, Actor|
|Master / Definition|Definisi reusable|Package, Price, Assessment, Learning<br>Objective|
|Transaction / Event|Sesuatu yang terjadi|Payment, Session, Attendance,<br>Entitlement Txn|
|Relationship / Workflow|Relasi atau proses stateful|Enrollment, Class Membership,<br>Schedule Request|
|Historical / Audit|Jejak perubahan/evidence|Audit Log, correction history|
|Derived|Hasil baca/perhitungan|Remaining Sessions, KPI views|



Pemisahan ini mencegah satu row mencoba merepresentasikan terlalu banyak hal sekaligus. Student bukan Enrollment; Class bukan Session; Attendance bukan Session; Payment submission bukan Payment Verified; Remaining Sessions bukan manually maintained attribute. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **BAGIAN III — DEC-001 SAMPAI DEC-017 SECARA LENGKAP** 

##### **1. DEC-001 — System Scope, Source-of-Truth Hierarchy & Architecture Principles** 

###### **Apa yang diatur** 

Fondasi konstitusi seluruh sistem. DEC ini menetapkan authority antar-layer, prinsip identity, integrity, environment, audit, automation, change control, dan rule bahwa implementation tidak boleh menjadi pembuat policy. 

###### **Mengapa bagian ini diperlukan** 

Tanpa hierarchy dan prinsip dasar, setiap tool dapat berkembang menjadi sumber kebenaran sendiri dan sulit menentukan siapa yang benar ketika data bertentangan. 

###### **Aturan canonical yang harus dipertahankan** 

- Blueprint + Decision Register adalah business-rule authority. 

- Critical config harus governed, versioned/effective-dated dan linked ke Decision authority. 

- Google Sheets authoritative domain tables adalah operational system-of-record. 

- Forms adalah submission evidence/input, bukan automatically verified/final truth. 

- Calendar hanya schedule projection; dashboard hanya read-only derived output; WhatsApp hanya communication channel. 

- System didesain berdasarkan business objects, bukan satu giant spreadsheet. 

- Canonical IDs immutable; nama, phone, email bukan relational key. 

- Material balances/facts hanya punya satu authoritative derivation. 

- Material history append-oriented; correction bukan silent deletion. 

- PROD dan TEST separated. 

- Referential integrity, uniqueness, idempotency, lineage, least privilege, data minimization wajib. 

- Automation boleh menjalankan approved workflow tetapi tidak boleh menciptakan/override policy. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: parameter atau operational fact tidak boleh memiliki empat versi berbeda di Form, Sheets, Calendar, dan dashboard. Apabila ada konflik, hierarchy menentukan artifact mana yang authoritative dan artifact mana yang harus diperbaiki. 

###### **Dampak terhadap technical implementation** 

Implikasi build: semua object, formula, script, import, Calendar sync, dashboard dan notification harus dipetakan ke hierarchy ini. Jika ada rule yang belum tersedia dari blueprint yang berwenang, affected implementation dihentikan atau digated; rule tersebut tidak boleh diisi melalui hard-coded logic. 

##### **2. DEC-002 — Canonical Entity Model & ID Architecture** 

**Apa yang diatur** 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

Menentukan universe entity dan cara identitas dijaga sepanjang lifecycle. Entity dipisahkan berdasarkan makna bisnis agar history, renewal, reschedule, transfer, duplicate resolution, dan audit tidak merusak identity. 

###### **Mengapa bagian ini diperlukan** 

Tanpa pemisahan identity dan relationship/event, renewal, transfer, reschedule, duplicate merge, dan history mudah merusak data. 

###### **Aturan canonical yang harus dipertahankan** 

- STUDENT menjawab siapa orangnya; ENROLLMENT menjawab commercial participation/package context. 

- Returning/alumni student reuse Student ID; commercial participation/renewal baru mendapat Enrollment ID baru. 

- CLASS adalah cohort/group; SESSION adalah one actual occurrence. 

- Attendance, entitlement, payroll dan reschedule memakai Session-based logic. 

- Student-to-Class direpresentasikan melalui CLASS_MEMBERSHIP agar start/end/transfer/occupancy history tetap tersedia. 

- ACTORS adalah named human/system identities yang melakukan Production actions. 

- Canonical ID format PREFIX-########, uppercase, unique, immutable, non-reusable, tanpa PII/mutable business meaning. 

- External Google IDs, Calendar IDs, Drive IDs dan row number hanya references, bukan canonical primary keys. 

- Duplicate merge mempertahankan old ID lineage di ENTITY_ALIAS_REGISTER; history tidak dihapus. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: Sarah sebagai orang tetap memiliki satu Student ID. Saat ia mengambil P30, relationship tersebut memiliki Enrollment ID. Jika ia selesai kemudian kembali membeli package baru, Student ID tetap sama tetapi Enrollment baru dibuat. Dengan cara ini identitas orang tidak dicampur dengan commercial lifecycle. 

###### **Dampak terhadap technical implementation** 

Implikasi build: ID generation harus concurrent-safe, environment-specific dan tidak pernah reuse issued IDs. Referential integrity perlu mencegah orphan child records. Duplicate merge/split perlu controlled tooling dan reconciliation, bukan row deletion. 

##### **3. DEC-003 — Workbook & Physical Data Domain Architecture** 

###### **Apa yang diatur** 

Menentukan physical boundaries enam production workbooks, authoritative home, tab classification, confidentiality segmentation, cross-workbook read/write rules, dan control metadata. 

###### **Mengapa bagian ini diperlukan** 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

Tanpa authoritative home dan domain boundary, workbook akan saling menyalin dan membuat conflicting editable truths. 

###### **Aturan canonical yang harus dipertahankan** 

- Workbook/file access adalah confidentiality boundary utama; hidden/protected tab tidak cukup sebagai sole boundary. 

- Setiap logical entity mempunyai exactly one authoritative home. 

- Cross-domain copies/views hanya derived/reference. 

- WB-05 tidak memiliki authoritative transaction dan tidak write-back ke production domains. 

- Canonical tab prefixes: SYS_, MST_, TXN_, WF_, RAW_, LOG_, GOV_, QA_, VIEW_. 

- RAW linked Form tabs bukan authoritative tables. 

- Long critical import chains dan cyclic dependencies dilarang. 

- IMPORTRANGE/equivalent boleh untuk controlled read path; cross-domain state mutation butuh controlled workflow/automation. 

- Manual copy/paste synchronization bukan normal integration mechanism. 

- Setiap workbook memiliki 00_README_CONTROL dengan environment, purpose, owner, custodian, schema version, scope, dependencies, classification, change, backup metadata. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: WB-01 dapat menampilkan reference payment status yang berasal dari WB-02, tetapi WB-01 tidak boleh memiliki editable payment status lain yang dianggap sama-sama benar. Jika finance mengubah authoritative payment state, semua consuming view mengikuti source tersebut. 

###### **Dampak terhadap technical implementation** 

Implikasi build: harus ada dependency map yang mencegah circular import, minimum-data exports, stable filenames, controlled environment naming, dan access segmentation yang dapat benar-benar diterapkan pada Google Workspace. 

##### **4. DEC-004 — Structured Input & Google Forms Architecture** 

###### **Apa yang diatur** 

Menentukan lifecycle submission dari saat user/staff mengirim form sampai data menjadi authoritative record atau transaction. Fokusnya adalah validation, identity/reference checking, duplicate prevention, approval, audit, dan failure handling. 

###### **Mengapa bagian ini diperlukan** 

Tanpa intake lifecycle, submission user dapat langsung mengubah bisnis walaupun invalid, duplicate atau belum approved. 

###### **Aturan canonical yang harus dipertahankan** 

- Canonical intake flow: controlled Form →RAW response →validation →identity/reference check → duplicate check →business-rule check →human review/approval where needed →authoritative table/workflow →audit/acknowledgement. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Core rule: Submit != Validated != Verified/Approved != Authoritative Transaction. 

- SYS_FORM_REGISTRY mencatat stable Form Code, version, environment, purpose, owner/custodian, submitter type, target entity, references, validation/approval, effective date dan Decision Ref. 

- Canonical intake states: RECEIVED, VALIDATING, VALIDATED, HELD_FOR_REVIEW, DUPLICATE, REJECTED, PROCESSED, RECONCILIATION_REQUIRED. 

- Structural, referential, business-rule, duplicate/idempotency validation dibedakan. 

- Payment proof submission tidak sama dengan verified payment. 

- Teacher attendance may be submitted session-wide tetapi authoritative outcome tetap per Student×Session. 

- Original RAW response tidak diedit diam-diam sebagai correction method. 

- Mega catch-all Form dilarang. 

- Failed downstream processing masuk reconciliation state. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: student submit bukti transfer. Submission tersebut masuk RAW dan mendapat intake identity. Finance masih melakukan verification. Hanya setelah verification dan integrity checks lolos, payment dapat memicu activation workflow. Jika script gagal setelah verification tetapi sebelum ETX selesai, case tidak dianggap sukses; status masuk reconciliation. 

###### **Dampak terhadap technical implementation** 

Implikasi build: setiap Form membutuhkan deterministic source/correlation identity, environment separation, idempotent processor, validation owner dan visible failure queue. Direct Form-to-ledger mutation harus dihindari. 

##### **5. DEC-005 — Transaction Ledger & Entitlement Integrity Architecture** 

###### **Apa yang diatur** 

Menjadikan entitlement sebagai accounting-style ledger yang dapat direkonstruksi. Remaining Sessions bukan field manual; ia merupakan hasil dari signed transactions yang memiliki source, timestamp, state dan correction lineage. 

###### **Mengapa bagian ini diperlukan** 

Tanpa ledger, balance mudah dimanipulasi dan tidak dapat direkonstruksi. 

###### **Aturan canonical yang harus dipertahankan** 

- TXN_ENTITLEMENT_LEDGER adalah authoritative entitlement source. 

- Setiap material entitlement movement memiliki ETX-########. 

- Remaining Sessions = sum of economically effective posted entitlement transactions per Enrollment dengan effective timestamp/closure rules. 

- Authoritative manual Remaining Sessions dilarang; generic MANUAL_ADJUSTMENT dumping ground dilarang. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

   - KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Package activation entries: P15 +15 dan trial -7 = 8; P30 +30 dan trial -7 = 23; P45 +45 dan trial -7 = 38. 

- Tujuh trial sessions = 6 learning + Session 7 Progress Test. Trial evidence hanya boleh applied sekali dan tidak digunakan pada normal renewal. 

- PRESENT/LATE/STUDENT_NO_SHOW/STUDENT_CANCELLED_LATE <12h = -1. STUDENT_CANCELLED_VALID >=12h, RESCHEDULED_ORIGINAL, TEACHER_CANCELLED, TEACHER_NO_SHOW, ACADEMY_CANCELLED, PLACEMENT_TEST = 0. FINAL_TEST = -1 paid entitlement. 

- Entitlement grain = Student×Session×Enrollment; teacher pay grain = payable class Session. 

- Wrong posting diperbaiki dengan compensating reversal/repost; posted critical ETX tidak diedit normal. 

- Negative balance adalah integrity exception; real truth tidak boleh disembunyikan dengan MAX(0). 

- Expiry/withdrawal memakai explicit forfeiture/closure transactions. 

- Renewal membuat Enrollment baru dan package grant baru. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: student mengonversi trial menjadi P30. Ledger mencatat +30 package grant dan - 7 trial recognition karena tujuh layanan trial sudah dikonsumsi sebagai bagian dari package. Initial paid remaining adalah 23, bukan 37. Jika kemudian satu session PRESENT, ETX -1 menghasilkan remaining 22. 

###### **Dampak terhadap technical implementation** 

Implikasi build: diperlukan posting engine dengan duplicate-source protection, concurrency safety, reversal linkage, state-aware retry, enrollment-scoped balance, closure reconciliation, dan detection untuk orphan/duplicate ETX. 

##### **6. DEC-006 — Status, State Machine & Workflow Architecture** 

###### **Apa yang diatur** 

Menjadikan lifecycle object explicit dan machine-readable sehingga status tidak lagi berupa free-text atau arbitrary dropdown. Setiap transition memiliki guard, authority, effective time, evidence dan history. 

###### **Mengapa bagian ini diperlukan** 

Tanpa state machine, status menjadi free-text dan workflow tidak dapat diuji. 

###### **Aturan canonical yang harus dipertahankan** 

- Canonical status codes menggunakan controlled English codes; UI label boleh localized. 

- Transition mendefinisikan From/To, trigger, guard, actor/authority, timestamp, evidence dan enforcement. 

- Independent lifecycle dimensions dipisahkan; mega-status dilarang. 

- Backward editing bukan normal path; reopening adalah explicit transition dengan history. 

- Terminal record retained; terminal bukan deleted. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Enrollment, Payment, Class, Membership, Schedule Request, Session, Attendance, ETX, Service Case, Adjustment, Expense, Payroll, CAPA, Change Request memiliki lifecycle terpisah. 

- WB-00 memelihara state definitions dan transition rules. 

- Critical cross-object workflow menggunakan Correlation/Workflow ID. 

- Partial success tidak boleh diam-diam dianggap complete; exception/reconciliation state wajib. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: Payment VERIFIED dapat menjadi trigger untuk package grant, trial recognition, Enrollment activation dan scheduling queue. Keempat effect harus diperlakukan sebagai correlated workflow. Jika package grant berhasil tetapi Enrollment activation gagal, case harus tetap terlihat sebagai partial failure dan direkonsiliasi. 

###### **Dampak terhadap technical implementation** 

Implikasi build: transition enforcement tidak boleh hanya dokumentasi. Processor harus mengecek current state, allowed transition, guard, actor role, required authority dan duplicate event sebelum melakukan side effect. 

##### **7. DEC-007 — RBAC, Access Control & Data Classification Architecture** 

###### **Apa yang diatur** 

Memisahkan technical privilege dari business authority dan memastikan setiap role hanya melihat atau melakukan hal yang diperlukan. Access control menjadi governance mechanism, bukan sekadar sharing preference. 

###### **Mengapa bagian ini diperlukan** 

Tanpa RBAC/SoD, technical access dapat berubah menjadi uncontrolled business authority. 

###### **Aturan canonical yang harus dipertahankan** 

- Capabilities: VIEW, CREATE, UPDATE, VERIFY, APPROVE, ADMINISTER. 

- Technical administration bukan business authority. 

- Canonical roles mencakup Founder, Co-Founder, Ops, Finance, Academic, Teacher, QA, SysAdmin, System; implementation package juga menetapkan HEAD_SYSTEMS_TECHNOLOGY. 

- Teacher scoped ke assigned class/student/periode dan tidak otomatis melihat seluruh finance/complaints/payroll. 

- Ops tidak otomatis memiliki price/rate/refund/verified-academic authority. 

- Finance mengontrol payment/financial evidence, bukan academic truth. 

- Academic mengontrol academic verification, bukan payment/refund truth. 

- QA inspect/create findings dan tidak mengedit source agar control terlihat pass. 

- Founder/Co-Founder broad access tidak mengizinkan ledger edit/control bypass. 

- Data classes: PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED. 

- Privileged Production use memakai named accounts mapped ke ACTOR. MFA where supported; password sharing dan credential in Sheets/WhatsApp dilarang. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Quarterly access review dan event-triggered review mandatory. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: Head of Systems dapat memiliki technical privilege untuk deploy script atau maintain access architecture, tetapi tidak otomatis memiliki authority untuk approve refund, discount, academic result, atau expense. Kewenangan teknis dan kewenangan bisnis sengaja dipisahkan. 

###### **Dampak terhadap technical implementation** 

Implikasi build: Google Workspace permissions, protected ranges, script-based write paths, actor identity, permission manifest, SoD controls dan access-review evidence harus mampu menunjukkan effective access, bukan hanya intended role matrix. 

##### **8. DEC-008 — Audit Log, Correction & Historical Integrity Architecture** 

###### **Apa yang diatur** 

Membuat material change dapat dibuktikan dan direkonstruksi. Audit menjawab siapa melakukan apa, kapan, terhadap object mana, mengapa, berdasarkan authority apa, serta nilai sebelum/sesudah yang relevan. 

###### **Mengapa bagian ini diperlukan** 

Tanpa audit, error dan override tidak dapat dibuktikan atau direkonstruksi. 

###### **Aturan canonical yang harus dipertahankan** 

- AUDIT_LOG adalah logical authoritative audit entity; material event memiliki AUD-########. 

- Audit scope mencakup identity merge/split, access, critical config/price/schema, payment, discount/refund, enrollment, membership, reschedule, attendance/entitlement correction, academic correction, finance/payroll, change, incident dan CAPA. 

- Minimum audit content: Event Type, Object Type/ID, Actor ID/Role, Event At, Effective At, Source, Reason Code, Authority Ref, Correlation ID, Before/After references, Evidence Ref, Environment, Privileged Flag. 

- Correction taxonomy: DATA_CORRECTION, TRANSACTION_REVERSAL, AUTHORIZED_OVERRIDE. 

- Original RAW evidence retained. 

- Hard deletion material Production records dilarang sebagai normal operation. 

- Bulk changes membutuhkan Change Request, backup, test, population control dan reconciliation. 

- Formula/schema/config change adalah auditable system event. 

- Audit Log itself restricted from free edit/delete. 

- Audit Log bukan backup dan backup bukan audit trail. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: ETX -1 ternyata salah karena session seharusnya teacher-cancelled. ETX original tidak dihapus. Sistem memposting compensating +1 dengan reference ke original dan audit event yang mencatat reason/authority. Hasil current balance benar dan historical chain tetap terlihat. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

###### **Dampak terhadap technical implementation** 

Implikasi build: audit tidak boleh bergantung pada manual log yang bisa diedit bebas. Direct privileged change perlu special audit path. System actor harus named dan material before/after reference perlu dapat direkonstruksi tanpa menyalin seluruh row ke log secara sembarangan. 

##### **9. DEC-009 — Configuration & Master Data Governance Architecture** 

###### **Apa yang diatur** 

Mencegah business parameter tersebar sebagai hard-coded constants yang berbeda di formula, script, Form dan dashboard. Configuration menjadi governed, versioned dan traceable ke policy authority. 

###### **Mengapa bagian ini diperlukan** 

Tanpa governed config, formula/script drift dan historical recomputation mudah terjadi. 

###### **Aturan canonical yang harus dipertahankan** 

- SYS_CONFIG_MASTER adalah canonical configuration source. 

- Stable Config Key merepresentasikan parameter; CFG-######## merepresentasikan historical version. 

- Config record memuat Value, Type, Unit, Scope, Effective From/Until, Status, Decision Ref, owner, approval dan audit metadata. 

- No Magic Numbers: governed business parameter tidak diduplikasi sebagai unmanaged constant. 

- Precedence: LOCKED BUSINESS RULE →APPROVED CONFIGURATION →SYSTEM IMPLEMENTATION →DERIVED OUTPUT. 

- Historical finalized transactions tidak recompute hanya karena current config/price berubah. 

- Future-dated approved config supported; overlapping exclusive effective periods prohibited. 

- Critical missing config fail closed/raise exception; arbitrary silent default dilarang. 

- Package identity stable, price records versioned. 

- SYS_CODESETS centrally governs statuses/outcomes/classifications. 

- Owner, Steward, Custodian dibedakan. 

- Decision↔Config↔Implementation reconciliation mandatory; mismatch = CONFIGURATION DRIFT. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: jika suatu runtime/business parameter memang dimodelkan sebagai config, automation mengambil approved effective config record. Script tidak menulis nilai yang sama di berbagai tempat karena perubahan future bisa menyebabkan drift antar consumer. 

###### **Dampak terhadap technical implementation** 

Implikasi build: perlu version-aware config resolver, environment-scoped configuration, validation untuk overlapping periods, controlled cache/freshness strategy, dependency map consumer, dan fail-closed behavior untuk critical missing config. 

##### **10. DEC-010 — Automation & Integration Architecture** 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

###### **Apa yang diatur** 

Menentukan kapan formula cukup, kapan controlled automation diperlukan, bagaimana side effects dijalankan, bagaimana duplicate/retry/concurrency ditangani, dan bagaimana failure/recovery dibuktikan. 

###### **Mengapa bagian ini diperlukan** 

Tanpa automation controls, retry, duplicate trigger, race condition dan partial failure dapat membuat authoritative truth ganda. 

###### **Aturan canonical yang harus dipertahankan** 

- Automation classes: AUTO_CALCULATED, AUTO_FLAGGED_HUMAN_VERIFIED, HUMAN_AUTHORIZED_AUTO_EXECUTED. 

- Formula preferred untuk deterministic local derivation; automation untuk ID issuance, authoritative transaction creation, state transitions, audit, cross-workbook mutation, notification, orchestration. 

- SYS_AUTOMATION_REGISTRY menyimpan code, owner, custodian, actor, trigger/source/target, authority, criticality, environment, version, status, deployment metadata. 

- Critical automation runs logged. 

- Same business event tidak boleh membuat duplicate authoritative effects. 

- Stable idempotency keys mandatory; retry state-aware, bounded dan idempotent. 

- Critical workflows memakai queue states QUEUED/PROCESSING/SUCCEEDED/RETRY_PENDING/FAILED/RECONCILIATION_REQUIRED. 

- Cyclic integration dilarang; partial success explicit; critical failures fail closed. 

- Canonical ID generation concurrent-safe, environment-specific dan recoverable tanpa reuse. 

- Automation consumes governed config; policy constants tidak hard-coded. 

- Notification adalah derived action, bukan business truth. 

- Manual fallback temporary, controlled dan reconciled; shadow permanent spreadsheet prohibited. 

- TEST/PROD automation separated; deployment versioned/change-controlled/rollbackable. 

- Secrets tidak disimpan di ordinary Sheets. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: payment-processing trigger dipanggil dua kali karena retry. Idempotency key yang sama harus membuat second invocation mengenali bahwa authoritative effect sudah ada, sehingga package grant, ETX dan activation tidak diduplikasi. Jika outcome external tidak pasti, workflow masuk uncertain/reconciliation path dan tidak blind retry. 

###### **Dampak terhadap technical implementation** 

Implikasi build: technical review harus fokus pada locking/claim strategy, queue design, idempotency key, correlation, partial commit, uncertain outcome, deployment discipline, error visibility, observability, credentials dan manual fallback. 

##### **11. DEC-011 — Scheduling & Google Calendar Integration Architecture** 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

###### **Apa yang diatur** 

Menentukan bahwa schedule truth hidup di system records, sedangkan Calendar hanya projection. DEC ini juga memisahkan recurring class pattern dari discrete Session occurrence serta menjaga reschedule/cancellation history. 

###### **Mengapa bagian ini diperlukan** 

Tanpa scheduling SOR, Calendar dan recurring events dapat merusak Session history serta entitlement/payroll linkage. 

###### **Aturan canonical yang harus dipertahankan** 

- Hierarchy: AVAILABILITY →MATCHING/FORMATION →SCHEDULE PROPOSAL →CONFIRMED CLASS SCHEDULE →DISCRETE SESSION →GOOGLE CALENDAR EVENT. 

- Google Calendar displays schedule truth; it does not determine schedule truth. 

- MVP default dua sessions per week fixed recurring class schedule. 

- Recurring pattern adalah class-level planning; actual delivery menggunakan discrete immutable Session IDs. 

- Infinite recurring Calendar series bukan authoritative representation. 

- Schedule proposal expires after 24h dan tidak memiliki entitlement/payroll effect. 

- Confirmed Session membutuhkan valid Class/Teacher, eligible workflow, time/conflict/capacity checks. 

- Teacher overlap hard block; student overlap controlled conflict. 

- Class hard maximum 5. 

- System→Calendar adalah default sync direction. 

- Calendar sync state terpisah dari Session state. 

- Calendar failure tidak cancel/alter Session truth; masuk retry/reconciliation. 

- Business reschedule membuat Session ID dan Calendar mapping baru; original retained. 

- Student-specific cancel dicatat di Attendance, bukan whole Session status. 

- BP-009 memegang exact matching score, make-up, substitution, holiday, waitlist, buffers dan generation horizon. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: satu student mengajukan cancellation dalam group class. Session untuk class tetap ada karena teacher dan student lain tetap menjalankan class. Hanya Student×Session attendance/service outcome yang berubah. Jika seluruh class di-reschedule, Session occurrence lama tetap retained dan replacement memiliki Session ID baru. 

###### **Dampak terhadap technical implementation** 

Implikasi build: scheduling engine harus membedakan recurring pattern, generated Sessions, proposal state, Session state, Attendance outcome, Calendar sync state, and dependency-gated matching policy. Concurrency perlu mencegah race untuk class capacity dan teacher overlap. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

**Dependency boundary.** Detail matching score, make-up, substitution, public holiday treatment, waitlist prioritization, buffers dan generation horizon tetap merupakan dependency BP-009. 

##### **12. DEC-012 — KPI, Dashboard & Reporting Architecture** 

###### **Apa yang diatur** 

Mencegah KPI menjadi angka yang definisinya berubah-ubah atau tidak dapat ditelusuri. Reporting harus read-only, definition-governed, time/grain-aware dan memiliki lineage ke authoritative records. 

###### **Mengapa bagian ini diperlukan** 

Tanpa KPI governance, satu nama KPI dapat memiliki banyak formula dan angka tidak dapat ditrace. 

###### **Aturan canonical yang harus dipertahankan** 

- Dashboard displays truth; dashboard does not create or repair truth. 

- SYS_KPI_MASTER_REGISTER mencatat stable code, definition, formula, numerator/denominator, unit, grain, source, inclusion/exclusion, time basis, owner, review frequency, target, status, effective date, Decision Ref, formula version. 

- Metric types: FLOW, SNAPSHOT, RATE, BALANCE. 

- Satu KPI memiliki satu canonical definition/version; formula berbeda berarti KPI identity/version berbeda. 

- Grain explicit: teacher pay = payable Session; entitlement consumption = Student×Session×Enrollment; trial capacity = class Session. 

- Timezone WIB; canonical week Monday–Sunday; month = calendar month. 

- Current/open period dan closed period dibedakan. 

- Derived views read-only dan tidak boleh drive critical transactions. 

- Missing denominator/data tidak disamarkan menjadi 0. 

- Formal snapshots/restatement harus mempertahankan lineage. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: dashboard menampilkan trial-to-paid conversion. Angka tersebut hanya official jika cohort/window, numerator, denominator, source grain, cutoff dan formula version sudah defined. Jika definition masih dependency/open, metric dapat tetap terdaftar tetapi tidak boleh dipresentasikan sebagai definitive KPI. 

###### **Dampak terhadap technical implementation** 

Implikasi build: perlu data freshness state, lineage, canonical formula implementation, snapshot cutoff, period certification, and restatement mechanism. Multi-workbook reporting perlu technical assessment untuk consistency dan performance. 

**Dependency boundary.** Sebagian KPI di implementation package tetap definition-required dan tidak boleh dianggap final sebelum cohort/window/formula diputuskan. 

##### **13. DEC-013 — Data Quality & Reconciliation Framework** 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

###### **Apa yang diatur** 

Menentukan bagaimana system health dibuktikan melalui rules, exceptions, reconciliation populations, certification, dan root-cause treatment. DQ bukan aktivitas kosmetik; ia memastikan authoritative facts antar-domain saling konsisten. 

###### **Mengapa bagian ini diperlukan** 

Tanpa DQ/reconciliation, setiap domain mungkin terlihat benar sendiri tetapi saling bertentangan. 

###### **Aturan canonical yang harus dipertahankan** 

- DQ dimensions mencakup Completeness, Validity, Uniqueness, Referential Integrity, Consistency, Timeliness, Accuracy dan Reconciliation Integrity. 

- SYS_DATA_QUALITY_RULES menyimpan rule logic, severity, enforcement, owner, frequency, Decision Ref dan version. 

- Material exception memiliki DQE identity dan severity. 

- Reconciliation mencakup Entitlement, Payment↔Enrollment, Attendance↔Entitlement, Session↔Payroll, Class↔Membership, Scheduling↔Calendar, Config↔Implementation, KPI↔Source, Audit/Access. 

- QA_RECONCILIATION_REGISTER di WB-04 menjadi controlled register. 

- Monthly reconciliation mandatory; critical duplicate/negative/partial checks dapat lebih sering. 

- Dataset/period dapat memiliki state UNVALIDATED, VALIDATION_IN_PROGRESS, VALIDATED, RECONCILIATION_REQUIRED, CERTIFIED_FOR_PERIOD, RESTATED. 

- Unresolved material issue dapat block period certification. 

- Recurring material defect memicu root-cause review/CAPA. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: attendance telah FINALIZED dengan outcome PRESENT tetapi tidak ada corresponding ETX -1. Attendance dan Entitlement masing-masing mungkin terlihat valid jika dilihat sendiri, namun cross-domain reconciliation menemukan mismatch dan membuat exception yang harus diselesaikan. 

###### **Dampak terhadap technical implementation** 

Implikasi build: detectors perlu memiliki deterministic population dan ownership. Reconciliation register tidak boleh menjadi second source yang “memperbaiki” source records secara manual; resolution tetap melalui controlled correction/transaction paths. 

##### **14. DEC-014 — Backup, Archive, Restore & Business Continuity Architecture** 

###### **Apa yang diatur** 

Memastikan sistem bukan hanya memiliki copy data, tetapi benar-benar dapat dipulihkan dengan urutan yang benar, tanpa menghasilkan duplicate ID/transaction, dan dengan post-restore reconciliation yang membuktikan current truth kembali konsisten. 

###### **Mengapa bagian ini diperlukan** 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

Tanpa tested restore, backup hanya memberi rasa aman palsu. 

###### **Aturan canonical yang harus dipertahankan** 

- Backup, Archive, Audit Log dan Contingency adalah control yang berbeda. 

- Mandatory weekly operational backup, monthly locked archive snapshot, dan pre-major-change backup. 

- WB-00/WB-01/WB-02 memiliki recovery priority tinggi; WB-05 derived/rebuildable. 

- RPO/RTO harus approved sebelum Production Readiness; angka exact tidak diinvent oleh architecture. 

- Backup validation dan restore test mandatory; continuity drill periodic. 

- Restore mengikuti dependency order dan latest known-good, bukan otomatis latest file. 

- Production restore adalah privileged audited action. 

- Post-restore reconciliation meliputi IDs, payment, entitlement, attendance, payroll, config, workflows, access dan projections. 

- Restore tidak boleh menyebabkan ID reuse atau duplicate authoritative effects. 

- Contingency transactions temporary dan harus validate/dedupe/post/reconcile/close setelah recovery. 

- Backup scope juga mencakup schema, formula, validation, protections, Apps Script, Forms specification, config, transitions, permissions dan integration mapping. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: spreadsheet copy tersedia, tetapi formula/protection/config atau script version yang diperlukan tidak ikut tercapture. Dalam BP-011, kondisi tersebut belum dianggap cukup sebagai recovery capability. Restore harus mengembalikan system behavior, bukan hanya row data. 

###### **Dampak terhadap technical implementation** 

Implikasi build: technical design perlu backup manifest, validation evidence, restore sequence, code/config backup, restore drill, environment-safe re-enable dan reconciliation checklist. 

##### **15. DEC-015 — Privacy, Data Retention & Legal-System Interface** 

###### **Apa yang diatur** 

Menyediakan technical capability untuk privacy-by-design, data inventory, minimization, retention, legal hold, disposal dan subject/guardian relationships, tanpa mengambil alih substantive legal decisions yang masih berada di BP-015/legal governance. 

###### **Mengapa bagian ini diperlukan** 

Tanpa privacy-system interface, technical design dapat mengumpulkan/menyebarkan data lebih luas dari kebutuhan. 

###### **Aturan canonical yang harus dipertahankan** 

- Purpose limitation dan data minimization berlaku pada Forms, tables, views, exports, logs dan integrations. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Need-to-know access tetap berlaku walaupun communication lewat WhatsApp. 

- SYS_DATA_INVENTORY mencatat category, purpose, source, authoritative location, subject type, classification, owner, consumers, sharing, retention reference dan authority. 

- Guardian/authorized contact relationship harus dapat direpresentasikan; exact legal age/authority tetap dependency BP-015. 

- Consent/notice tidak boleh disederhanakan menjadi generic yes/no bila version/authority/timestamp diperlukan. 

- GOV_RETENTION_SCHEDULE mandatory sebagai structure; exact retention duration deferred. 

- Legal hold dapat menunda disposal. 

- Material disposal controlled/logged; arbitrary row deletion dilarang. 

- Privacy request menggunakan structured case + identity/authority verification. 

- TEST data juga tunduk pada minimization. 

**Bagaimana mekanismenya bekerja dalam praktik** Contoh operasional: arsitektur dapat menyediakan Retention Rule ID, Hold status, Disposal eligibility dan Guardian relationship. Namun berapa lama data student disimpan atau siapa legal guardian yang sah bukan keputusan yang boleh dibuat developer melalui config default jika BP-015 belum menetapkan. 

###### **Dampak terhadap technical implementation** 

Implikasi build: data classification perlu memengaruhi access/export; retention engine harus mampu menerima future legal rule; disposal/anonymization harus mempertahankan required lineage tanpa melanggar no-hard-delete untuk domain yang memang perlu historical evidence. 

**Dependency boundary.** Exact retention, guardian/minor dan legal obligations tetap dependency BP-015. 

**16. DEC-016 — Release, Testing & Change Management Architecture** 

**Apa yang diatur** 

Mengatur perubahan sistem setelah architecture closure agar tidak terjadi silent Production drift. Semua material change mengikuti controlled lifecycle dari request sampai verification dan closure. 

**Mengapa bagian ini diperlukan** Tanpa controlled release, Production dapat drift melalui direct edits yang tidak diuji. 

**Aturan canonical yang harus dipertahankan** 

- Material change mengikuti Change Request →impact analysis →design/build in TEST →testing → approval →Production deployment →post-deployment verification →closure. 

- Critical schema, formula, Form, automation, validation, dashboard, config dan permission change termasuk controlled change. 

- TEST dan Production baseline/version harus identifiable. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Testing mencakup component, integration, regression, failure, boundary, security/negative-access, UAT dan reconciliation-oriented testing. 

- Release memiliki scope, version, dependencies, test evidence, approver, rollback route dan postrelease verification. 

- Emergency fix tetap memerlukan governance trail dan reconciliation. 

- Material architecture/business-rule change setelah closure harus mengikuti Change Request/decision governance, bukan direct edit. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: automation ETX perlu diperbaiki. Perubahan tidak langsung dilakukan pada script Production. Fix dibuat di TEST, diuji terhadap duplicate trigger, concurrency, reversal, failure dan regression, lalu dirilis dengan version/evidence/rollback route dan diverifikasi setelah deployment. 

###### **Dampak terhadap technical implementation** 

Implikasi build: source/version control, deployment separation, release manifest, test evidence storage, rollback mechanics dan change audit harus tersedia sejak awal agar Production tidak bergantung pada manual developer memory. 

##### **17. DEC-017 — Implementation, Migration & Production Readiness Architecture** 

###### **Apa yang diatur** 

Menentukan urutan pembangunan dan gate sebelum real operation. Arsitektur dibangun dari control foundation ke transactional core, lalu automation/integration/reporting, kemudian migration, testing, readiness, cutover dan hypercare. 

###### **Mengapa bagian ini diperlukan** 

Tanpa build/readiness sequence, komponen bisa dianggap selesai padahal dependency, test, migration atau continuity belum siap. 

###### **Aturan canonical yang harus dipertahankan** 

- Build sequence mengikuti governance/environment →control plane →code/config →ID engine → parent/master objects →transactions/workflows →Forms →state engines →entitlement/audit →QA →automation/integration →Calendar →reporting →RBAC validation →backup/continuity → migration →E2E/UAT →readiness →cutover →hypercare. 

- Seed dan migration dibedakan. 

- TEST→PROD write hard denied; Production menjalankan approved seed/migration logic sendiri. 

- Legacy identities mapped ke canonical IDs dan lineage/alias retained. 

- Fuzzy duplicate tidak auto-merge. 

- Historical price/payroll rates tetap historical transaction truth. 

- Calendar migration dimulai dari canonical Sessions, bukan Calendar event sebagai source. 

- Opening entitlement migration tanpa reconstructable history dapat block affected scope sampai governed opening semantic disetujui. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Production Readiness mencakup governance, data, security, operation, finance, academic, technology, continuity, people dan documentation. 

- Deployment to PROD tidak sama dengan Go-Live authorization. 

###### **Bagaimana mekanismenya bekerja dalam praktik** 

Contoh operasional: dashboard tidak dibangun lebih dahulu lalu dijadikan fondasi. Build dimulai dari governance, IDs, schema, config, actors/RBAC, masters, workflows dan ledgers. Reporting datang setelah authoritative sources cukup stabil. Migration dilakukan setelah target model sudah jelas dan diuji. 

###### **Dampak terhadap technical implementation** 

Implikasi build: build plan perlu respect dependency order, Definition of Done per component, seed/migration controls, UAT evidence, readiness checklist, cutover runbook dan post-live verification. 

**Dependency boundary.** Academic/assessment/curriculum/scheduling/legal capability tertentu dapat tetap gated oleh BP-005/BP-006/BP-007/BP-009/BP-015. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **BAGIAN IV — CLOSURE DEC, DECISION REGISTER, DEPENDENCY REGISTER, DAN OPEN DEPENDENCIES** 

##### **1. Closure DEC** 

Closure DEC menutup proses architecture decision-building tanpa memaksa semua downstream blueprint sudah selesai. Prinsipnya: suatu dependency dapat memblok affected Go-Live capability, tetapi tidak otomatis memblok architecture closure jika interface, owner, scope, dependency classification dan future support path sudah diregister dengan jelas. 

Dengan demikian, BP-011 dapat menyatakan arsitektur lengkap sambil tetap mengatakan bahwa bagian academic, scheduling, legal atau reporting tertentu belum boleh diaktifkan penuh sebelum blueprint yang berwenang menyelesaikan detailnya. 

##### **2. Decision Register** 

Decision Register adalah controlled index untuk DEC-001 sampai DEC-017 dan Closure DEC. Status LOCKED berarti implementation tidak boleh mengubah keputusan tersebut hanya karena ada cara build yang lebih nyaman. Jika technical review menemukan architecture defect, perubahan mengikuti DEC016 Change Request dan governance yang sesuai. 

##### **3. Dependency Register** 

|**Source Blueprint**|**Dependency**|**Classification**|**Treatment**|
|---|---|---|---|
|BP-004|Lead/Prospect model|NON-BLOCKING /<br>possible POST-MVP|Jangan invent final LEAD<br>entity.|
|BP-005|Academic Profile/evidence fields|BLOCKING full<br>Academic module|Shell allowed; no<br>invented academic<br>interpretation.|
|BP-006|Assessment scoring/verification|BLOCKING full<br>Assessment workflow|Preserve<br>version/retest/human<br>verification invariants.|
|BP-007|Curriculum hierarchy implementation|BLOCKING complete<br>curriculum module|Shell/interface allowed;<br>no fabricated curriculum<br>policy.|
|BP-008|Detailed student operations|NON-BLOCKING<br>foundation|Foundation can exist;<br>mature SOP later.|
|BP-009|Matching/make-<br>up/substitution/holidays/waitlist/buffers|BLOCKING full<br>automated scheduling|Gate affected automation<br>until rule exists.|
|BP-010|Teacher lifecycle/quality/substitution|CONDITIONAL|More critical when<br>scaling beyond founders.|
|BP-012|Advanced accounting/forecast|NON-BLOCKING core<br>MVP|Do not invent advanced<br>accounting metrics.|
|BP-013|Customer communication/service|NON-BLOCKING<br>manual / BLOCKING full|Manual controlled<br>communication may|



Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

||design|automation|remain.|
|---|---|---|---|
|BP-014|Detailed risk/QA operations|NON-BLOCKING<br>foundation|Foundation may exist.|
|BP-015|Retention/guardian/minor/privacy/legal|BLOCKING where<br>applicable|Load rule before affected<br>real-person Production<br>scope.|



**4. Open / dependency-gated semantics yang harus tetap terlihat** 

- Trial-to-Paid cohort/window: target ≥35% ada, official cohort/window formula masih definitionrequired. 

- Renewal Conversion cohort/window masih definition-required. 

- Active Student capacity population masih definition-required. 

- Class Occupancy formula masih definition-required. 

- Attendance Rate denominator masih definition-required. 

- FREEZE_DAY_COUNT_METHOD masih membutuhkan decision. 

- Reschedule monthly max tetap ada, tetapi exact counted-event semantics masih open. 

- Payroll non-business-day adjustment mode masih open. 

- Quote validity 7 hari adalah implementation assumption dalam package; quote-expiry automation tetap gated. 

- Placement/Scheduling ≤2 Business Days lifecycle mapping belum boleh ditebak. 

- BP-005/BP-006/BP-007/BP-009/BP-013/BP-015 memblok capability terkait. 

- Migration opening entitlement menjadi conditional blocker jika current legacy balance ada tetapi transaction history tidak dapat direconstruct. 

**Prinsip implementasi.** Open dependency bukan tempat developer mengambil keputusan bisnis. Capability harus digated, dibuat shell/interface, atau dibawa kembali ke governance sesuai dependency treatment. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **BAGIAN V — UNIFIED IMPLEMENTATION PACKAGE DAN APPENDIX A–P** 

Setelah DEC-001 sampai DEC-017 dan Closure DEC selesai, BP-011 dikonsolidasikan menjadi Unified Implementation Package. Bagian ini mengubah architecture decisions menjadi physical contracts yang lebih dekat dengan build. Freeze Candidate menyatakan appendices complete/closed sesuai status, A/B/F/G final consolidated, dan final re-audit PASS. 

|**Inventory**|**Final count/status**|
|---|---|
|Production Workbooks|6|
|Physical Objects|131|
|Standard Forms|13|
|Logical Automations|43 — 4 dependency-gated|
|Logical Integrations|19 — 1 provider dispatch integration gated|
|Reporting Metrics|63 — sebagian definition-gated|
|Final Re-Audit|PASS — READY TO FREEZE|



##### **Appendix A — Physical Data Dictionary — Consolidated Final** 

Field-level contract untuk 131 physical objects. Appendix ini menjelaskan field identity, type, requiredness, editability, reference, lineage, sensitivity, dan system ownership. Ia menjadi bridge antara logical entity architecture dan actual table columns. 

- Canonical ID contract tetap PREFIX-######## dan immutable. 

- Null semantic dibedakan dari 0/FALSE/blank/NOT_ASSESSED. 

- Editability classes membedakan system-only, controlled input, authorized edit, derived read-only, immutable-after-create dan immutable-after-post. 

- Core ledger/history tidak menggunakan ordinary hard delete. 

- Entitlement ledger append-oriented setelah posting. 

- Enrollment activation basis mengikuti verified payment. 

- Attendance grain per Student×Session. 

- Raw secrets tidak disimpan di ordinary Sheets. 

##### **Appendix B — Workbook & Table Specification — Consolidated Final** 

Menetapkan setiap table/object secara physical: workbook home, row grain, key, writer, mutability, uniqueness dan relationship. Appendix B membuat makna satu row menjadi deterministic. 

- MST_ENROLLMENTS = satu enrollment/package participation context. 

- TXN_SESSIONS = satu canonical Session occurrence. 

- TXN_ATTENDANCE = satu Student×Session outcome. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- TXN_ENTITLEMENT_LEDGER = satu signed entitlement posting. 

- TXN_TEACHER_PAYROLL = satu Teacher×payable Session effect. 

- QA test definition, execution dan defect entities dipisahkan. 

- VIEW_* tidak memiliki business writer. 

##### **Appendix C — Forms / Structured Intake Specification — Closed** 

Menetapkan exact standard Form inventory dan RAW intake path. Appendix ini memperjelas Form mana yang menghasilkan submission apa dan processor apa yang bertanggung jawab. 

- Exactly 13 standard forms. 

- Forms tidak menulis langsung ke ETX, Payroll atau Sales Ledger. 

- Assessment learner responses memakai dedicated assessment integration pattern, bukan menambah standard form ke-14. 

- Submission memerlukan deterministic source/correlation identity untuk idempotent ingestion. 

##### **Appendix D — State & Transition Matrix — Closed** 

Mengubah lifecycle DEC-006 menjadi transition-level contract: current state, requested transition, guard, scope, role, authority, evidence dan result. 

- State transition evidence terpisah dari governance authority evidence. 

- Proposal acceptance yang gagal revalidation adalah fulfillment failure. 

- Trial recognition business quantity tujuh layanan diwujudkan sebagai signed ETX -7 exactly once. 

- Assessment scoring dan verification tetap distinct. 

- Learning path completion dapat tetap dependency-gated BP-007. 

##### **Appendix E — RBAC / Permission Specification — Closed** 

Menerjemahkan DEC-007 menjadi role/capability/scope contract yang dapat diimplementasikan dan diuji. 

- Capabilities exactly VIEW, CREATE, UPDATE, VERIFY, APPROVE, ADMINISTER. 

- Roles mencakup FOUNDER, COFOUNDER, HEAD_SYSTEMS_TECHNOLOGY, SYSADMIN, OPERATIONS, FINANCE, ACADEMIC, TEACHER, QA_RISK. 

- No automatic role inheritance; assignment explicit. 

- Governance authority flag terpisah dari technical privilege flag. 

- Head Systems tidak otomatis identik dengan SysAdmin. 

- Founder final authority tidak berarti unrestricted technical superuser. 

##### **Appendix F — Config Baseline — Consolidated Final** 

Menentukan mana yang benar-benar variable governed parameter, mana yang invariant/master/register value, dan mana yang runtime technical configuration. Tujuan utamanya menghindari over-configurability dan hidden policy changes. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Tidak ada ALLOW_TEST_TO_PROD_WRITE. 

- Tidak ada ALLOW_ETX_EDIT atau editable authoritative balance. 

- Tidak ada IGNORE_SOD. 

- Tidak ada Calendar-as-Source-of-Truth switch. 

- Tidak ada Auto CEFR sebelum BP-006. 

- Tidak ada Auto Renew di bawah policy saat ini. 

- Tidak ada hidden default untuk unresolved business semantics. 

- Adit dapat merekomendasikan runtime retry/timeout/batch/lock/queue/freshness/backup clock values sepanjang tidak mengubah business rule. 

##### **Appendix G — Automation Specification — Consolidated Final** 

Menetapkan execution contract untuk 43 logical automations: trigger, source, target, idempotency, concurrency, state, recovery, config consumption, environment dan audit. 

- 43 logical automation inventory. 

- Critical automation membutuhkan deterministic trigger/source/correlation. 

- Concurrency-sensitive path membutuhkan locking/claim strategy. 

- UNCERTAIN_OUTCOME tidak boleh blind retry. 

- Dependency-gated automation tetap disabled/gated sampai semantic authority tersedia. 

##### **Appendix H — Integration Specification — Closed** 

Memetakan 19 logical integrations untuk cross-workbook sharing, Calendar, Drive, notification dan provider interactions. Fokusnya minimal data, controlled side effects, environment correctness, dan retry/reconciliation. 

- System→Calendar tetap authoritative direction. 

- Production references hanya boleh menuju Production resources. 

- Provider dispatch tertentu tetap gated. 

- Derived/reference flow tidak boleh menjadi second source-of-truth. 

##### **Appendix I — KPI & Reporting Specification — Closed** 

Menetapkan 63 reporting metric inventory dengan source grain, formula, inclusion/exclusion, time basis, quality state, views dan review outputs. 

- Definition-dependent metrics tidak dianggap final. 

- Snapshot, freshness, lineage dan restatement harus visible. 

- Reporting tetap read-only terhadap operational truth. 

##### **Appendix J — Data Quality & Reconciliation Matrix — Closed** 

Mengubah DEC-013 menjadi control matrix yang menentukan rule, severity, enforcement, reconciliation population, cadence dan exception owner. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Reconciliation tidak menjadi source-repair writer. 

- Access Drift dan Config Drift diperlakukan sebagai control/reconciliation classifications. 

- Reconciliation grain harus explicit. 

##### **Appendix K — Backup / Restore / Continuity Runbooks — Closed** 

Menetapkan langkah backup creation, validation, recovery sequence, contingency capture, restore drill, post-restore checks dan safe re-enable. 

- Backup creation saja tidak cukup; validity dan restore harus diuji. 

- Derived layers diregenerate setelah authoritative recovery. 

- Post-restore reconciliation wajib sebelum full operation kembali. 

##### **Appendix L — Test Case & UAT Pack — Closed** 

Menetapkan component, integration, regression, failure, boundary, security, UAT dan release-exit test evidence. 

- Test case definition, execution dan defect history dipisahkan. 

- Boundary tests mencakup class max 5, authority thresholds, trial recognition, renewal trigger dan timing rules. 

- Automation tests mencakup idempotency, concurrency, partial commit dan uncertain outcome. 

##### **Appendix M — Migration / Seed Specification — Closed** 

Menetapkan seed vs migration, source assessment, mapping, opening balance governance, dry run, reconciliation dan final migration. 

- TEST→PROD write hard denied. 

- Production menjalankan approved seed/migration logic di Production environment. 

- Legacy identity preserved sebagai lineage/alias, bukan reused blindly. 

- Fuzzy duplicate tidak auto-merge. 

- Calendar event bukan migration source of Session truth. 

- Opening entitlement tanpa reconstructable history dapat block affected migration. 

##### **Appendix N — Production Build Checklist — Closed** 

Menetapkan construction sequence dan Definition of Done per component. Appendix ini mencegah “object sudah ada” dianggap sama dengan “component siap”. 

- Object exists ≠configured ≠tested ≠component ready ≠Production Ready. 

- Phases 0–18 mencakup governance, workbook skeleton, schema, config, RBAC, masters, workflow, ledger, Forms, automation, integrations, academic, QA, reporting, recovery, migration, TEST/UAT, Head Systems review dan Production Build Readiness. 

##### **Appendix O — Go-Live Specification — Closed** 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

Memisahkan system built, test passed, UAT accepted, technical readiness, Production deployment, GoLive authorization dan baseline closure. 

- Adit memegang technical readiness/technical approval dan dapat withhold approval jika unsafe. 

- Hilal melakukan business/operational readiness review. 

- QA/UAT menyediakan independent readiness evidence. 

- Galang memegang final material GO/NO-GO. 

- Go-Live scope harus menyatakan ENABLED/GATED/DEFERRED/MANUAL-CONTROLLED. 

- Deployment ke PROD bukan authorization real processing. 

- Material ETX mismatch, unauthorized approval, class >5, TEST→PROD write, blind uncertain retry, raw secrets atau Production references to TEST normally block Go-Live. 

##### **Appendix P — Production Baseline Specification — Closed** 

Mendefinisikan approved point-in-time reference actual Production configuration/state setelah Go-Live. Baseline menjadi anchor untuk mengetahui apa yang benar-benar deployed/active pada saat tertentu. 

- Production Baseline bukan backup, release, Go-Live decision atau forever-current copy of business data. 

- Capture/reference meliputi baseline identity, six workbooks/131 objects/schema, config/codesets, RBAC, all 43 automation states, all 19 integration states, reporting readiness, dependencies dan GoLive evidence. 

- Exactly one current effective baseline per applicable scope setelah baselining dimulai. 

- Superseded baselines retained historical dan tidak materially edited in-place. 

- Unauthorized Production drift tidak menjadi legitimate hanya karena dicapture ke baseline baru. 

Final consolidation tidak mengubah canonical inventory counts. Re-audit menunjukkan Architecture Consistency PASS, Business Rule Consistency PASS, Governance/DEC-047 PASS, 

object/form/automation/integration/reporting counts PASS, dan Mandatory Patches Remaining = 0. Package kemudian ditempatkan pada gate Head of Systems & Technology Technical Review. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **BAGIAN VI — SKENARIO END-TO-END STUDENT UNTUK MENGHUBUNGKAN SELURUH ARSITEKTUR** 

Skenario berikut bukan business rule baru. Fungsinya hanya menunjukkan bagaimana entity, intake, state, ledger, scheduling, audit, reporting dan reconciliation bekerja sebagai satu sistem. 

##### **1. Registration / Identity Intake** 

Student mengirim registration Form. Submission masuk ke RAW intake. Processor menjalankan structural, referential dan duplicate checks. Jika orang tersebut sudah memiliki canonical Student ID, identity lama digunakan; sistem tidak membuat duplicate Student hanya karena registration baru. 

##### **2. Canonical Student Identity** 

Student memiliki immutable Student ID. Nama, phone atau email dapat berubah melalui controlled update, tetapi relational identity tidak berubah. 

##### **3. Academic / Placement Interface** 

Assessment dan attempt direpresentasikan dengan canonical identities, versions dan verification controls. Exact scoring/CEFR logic tetap mengikuti BP-006 dan tidak dibuat otomatis oleh BP-011. 

##### **4. Class / Membership** 

Class adalah cohort. Student masuk Class melalui CLASS_MEMBERSHIP sehingga start/end/transfer history tersedia. Membership bukan sekadar nama student di kolom Student 1/2/3. 

##### **5. Trial Delivery** 

Trial terdiri dari enam learning sessions dan Session 7 Progress Test. Setiap actual occurrence direpresentasikan sebagai Session dan attendance/service evidence tetap dapat ditelusuri. 

##### **6. Payment Submission** 

Student mengirim proof of payment. Submission belum berarti verified payment. Finance/authorized process melakukan verification. 

##### **7. Payment Verified →Activation Workflow** 

Verified payment menjadi authority/evidence untuk activation flow. Critical cross-object effects memakai correlation/workflow identity dan tidak boleh partial-success tanpa exception state. 

##### **8. Paid Package Conversion / Entitlement** 

Untuk P30, package grant +30 dan trial recognition -7 diposting sebagai signed ETX, menghasilkan initial paid remaining 23. Trial recognition applied exactly once. 

##### **9. Session Delivery / Attendance** 

Setiap Session memiliki immutable Session ID. Attendance disimpan per Student×Session. Studentspecific cancellation dalam group class tidak mengubah whole Session menjadi cancelled. 

##### **10. Entitlement Consumption** 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

Finalized attendance/service outcome menentukan signed entitlement effect. PRESENT/LATE/noshow/late cancel menghasilkan -1; valid cancellation/teacher/academy cancel sesuai rule menghasilkan 0. 

##### **11. Teacher Payroll** 

Teacher payable logic menggunakan payable class Session ID, bukan per-student entitlement grain. Empat student hadir menghasilkan empat entitlement deductions tetapi satu payable class Session untuk teacher. 

##### **12. Reschedule** 

Business reschedule membuat Session ID baru dan mempertahankan original Session lineage. Calendar mapping mengikuti canonical Session, bukan sebaliknya. 

##### **13. Reporting** 

WB-05 membaca authoritative facts untuk KPI/view. Reporting tidak menulis ulang Payment, Session, Attendance atau ETX. 

##### **14. Correction / Audit** 

Jika transaction salah, original record tidak dihapus. Correction/reversal diposting dan material action dicatat di Audit Log dengan actor/reason/authority/correlation evidence. 

##### **15. Reconciliation / Period Certification** 

DQ dan reconciliation membandingkan cross-domain effects: Payment↔Enrollment, Attendance↔ETX, Session↔Payroll, Scheduling↔Calendar, KPI↔Source, Config↔Implementation. Material mismatch harus diselesaikan sebelum period certification sesuai control rule. 

##### **Contoh mini-ledger P30** 

|**Event**|**Signed ETX**|**Running Remaining**|
|---|---|---|
|Package Grant P30|+30|30|
|Trial recognition: 7 services already<br>delivered|-7|23|
|PRESENT|-1|22|
|PRESENT|-1|21|
|Valid cancellation >=12h|0|21|
|Late cancellation <12h|-1|20|



Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **BAGIAN VII — TECHNICAL REVIEW HEAD OF SYSTEMS & TECHNOLOGY** 

Technical Review bukan approval terhadap business policy. Fungsinya adalah menilai apakah architecture dan implementation package dapat diwujudkan secara aman, deterministic, maintainable, recoverable dan observable pada Google Sheets + Apps Script / selected Google Workspace stack, tanpa mengubah locked business semantics. 

##### **1. Area yang wajib ditantang secara teknis** 

- Viability Google Sheets + Apps Script untuk expected MVP/near-term volume. 

- Effectively-once behavior untuk ETX dan Payroll under repeated/concurrent execution. 

- Race conditions pada ID issuance, package activation, ETX, class capacity, queue claims dan reporting snapshots. 

- Practical enforcement RBAC, record/field/state restrictions dan privileged direct edits. 

- Full TEST/PROD isolation across workbooks, Forms, Calendar, scripts, integrations, reporting dan communication. 

- Deterministic reconciliation untuk uncertain external outcomes sebelum retry. 

- Multi-workbook reporting snapshot consistency dan freshness. 

- Backup/restore feasibility termasuk code/config/forms/permissions, bukan hanya row data. 

- Maintainability/observability 131 physical objects di enam workbooks. 

- Setiap point yang impossible, unsafe atau terlalu fragile jika dibangun persis seperti specification. 

##### **2. Finding classification** 

|**Code**|**Classification**|**Makna**|
|---|---|---|
|TR-01|TECHNICAL BLOCKER|Tidak aman/tidak feasible tanpa<br>resolution sebelum build/Production.|
|TR-02|TECHNICAL RISK|Feasible tetapi risk harus<br>dikendalikan dan diuji.|
|TR-03|ARCHITECTURE CHANGE REQUIRED|Current locked architecture perlu<br>formal governed change.|
|TR-04|BUSINESS DECISION REQUIRED|Implementation tidak boleh<br>menentukan; kembali ke governance.|
|TR-05|IMPLEMENTATION<br>RECOMMENDATION|Technical approach lebih baik tanpa<br>mengubah business<br>rule/architecture.|
|TR-06|DOCUMENTATION / CLARIFICATION|Specification membutuhkan<br>wording/detail clarification.|
|TR-07|ACCEPTED AS DESIGNED|Design diterima tanpa blocking<br>concern.|



Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

##### **3. Bentuk output technical review** 

- Overall status: TECHNICALLY APPROVED / APPROVED WITH IMPLEMENTATION CONDITIONS / TECHNICAL REVISION REQUIRED / NOT TECHNICALLY APPROVED. 

- Findings register dengan impact, affected DEC/Appendix/object, failure scenario, recommended resolution, TEST blocker dan PROD blocker. 

- Runtime technical Config recommendations dengan rationale; tidak boleh menjadi arbitrary businessrule decision. 

- Build Preconditions dan Production Preconditions. 

- Jika architecture change diusulkan, alasan harus menunjukkan mengapa existing model tidak dapat memenuhi requirement secara aman tanpa perubahan governed. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **BAGIAN VIII — BUILD, PRODUCTION READINESS, GO-LIVE, DAN PRODUCTION BASELINE** 

##### **1. Milestone bukan sinonim** 

|**Milestone**|**Makna**|
|---|---|
|Architecture Complete|Architecture decisions selesai dan dependency closure<br>tercapai.|
|Build Specification Complete|Physical implementation contract lengkap.|
|System Built|Komponen telah dikonstruksi.|
|Test Passed|Technical test memenuhi exit criteria.|
|UAT Accepted|Business/user acceptance evidence terpenuhi.|
|Technically Ready|Head Systems memberi technical readiness conclusion.|
|Deployed to PROD|Artefak berada di Production environment.|
|Go-Live Authorized|Real operational processing diizinkan oleh governance.|
|Production Baseline Closed|Actual Production config/state dicapture sebagai<br>approved baseline.|



###### **Critical distinction.** SYSTEM BUILT ≠TEST PASSED ≠UAT ACCEPTED ≠TECHNICALLY READY ≠ DEPLOYED TO PROD ≠GO-LIVE AUTHORIZED ≠PRODUCTION BASELINE CLOSED. 

##### **2. Build phases** 

- 0 Governance / environment preparation 

- 1 Workbook skeleton 

- 2 Metadata / schema 

- 3 Codesets / Config / Business Calendar 

- 4 Actors / Roles / RBAC 

- 5 Business Masters 

- 6 Workflow / state 

- 7 Transactions / ledgers 

- 8 Forms 

- 9 Automation 

- 10 Integrations 

- 11 Academic 

- 12 QA / Risk / DQ / Reconciliation 

- 13 Reporting 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- 14 Backup / Recovery 

- 15 Seed / Migration 

- 16 Full TEST / UAT 

- 17 Head Systems Technical Review 

- 18 Production Build Readiness 

##### **3. Non-Waivable Integrity Blockers untuk Go-Live** 

- Payment dapat bypass verification. 

- Entitlement/package grant dapat duplicate. 

- Remaining Sessions dapat diedit authoritatively. 

- Student ke-6 dapat diterima ke class. 

- Payroll dapat double-pay Session ID. 

- Canonical IDs dapat duplicate/reuse. 

- Audit disabled/incomplete. 

- Critical role access uncontrolled. 

- TEST/PROD mixed. 

- Tidak ada valid backup/recovery path. 

- Blocking downstream policy unresolved untuk enabled scope. 

- Material migration mismatch unresolved. 

##### **4. Governance responsibility** **<u>pada Go-Live</u>** 

|**Role**|**Responsibility**|
|---|---|
|Adit — Head of Systems & Technology|Technical readiness / technical approval; dapat withhold<br>approval untuk unsafe architecture/implementation.|
|Hilal — Co-Founder|Business / operational readiness review.|
|QA / UAT|Independent readiness evidence.|
|Galang — Founder|Final material GO / NO-GO.|



Go-Live bersifat release-specific dan scope-specific. Capability harus ditandai ENABLED, GATED, DEFERRED atau MANUAL-CONTROLLED. Deployment artifact ke Production tidak otomatis mengizinkan real operational processing. 

##### **5. Production Baseline** 

Production Baseline adalah approved point-in-time reference dari actual Production configuration/state setelah Go-Live. Baseline bukan backup, bukan release, bukan Go-Live decision dan bukan copy semua business data yang harus selalu current. Baseline menjawab: versi schema apa yang live, config/codesets apa yang effective, role/permission state apa yang relevan, automation/integration version/state apa yang deployed, dependency apa yang masih gated, dan evidence readiness apa yang mendasari Production state tersebut. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Exactly one current effective baseline berlaku untuk applicable scope setelah baselining dimulai. 

- Superseded baseline tetap historical dan tidak materially edited in-place. 

- Unauthorized drift tidak boleh dilegalkan hanya dengan mencapture state tersebut menjadi baseline baru. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

### **BAGIAN IX — GLOSARIUM DAN NON-NEGOTIABLE INVARIANTS** 

##### **1. Glosarium** 

|**Istilah**|**Arti**|
|---|---|
|Authoritative|Sumber yang secara resmi dianggap benar untuk<br>domain/fakta tertentu.|
|Canonical ID|Stable, unique, immutable identity untuk persistent<br>material entity.|
|Enrollment|Commercial participation/package relationship student,<br>bukan identity orang.|
|Class|Cohort/group.|
|Session|Satu actual occurrence dari class/delivery.|
|Membership|Relasi Student ke Class dengan lifecycle/history.|
|ETX|Entitlement transaction dengan signed effect.|
|Ledger-derived|Saldo/fact berasal dari transaction history, bukan editable<br>field.|
|Idempotency|Pemrosesan ulang event yang sama tidak menciptakan<br>duplicate effect.|
|Correlation ID|Identifier yang menghubungkan langkah-langkah satu<br>workflow lintas object.|
|Reconciliation|Perbandingan antar-domain/source untuk memastikan<br>authoritative effects konsisten.|
|RBAC|Role-Based Access Control.|
|SoD|Segregation of Duties.|
|PROD|Environment Production untuk real operational truth.|
|TEST|Environment testing/sandbox yang wajib isolated.|
|Derived|Hasil baca/perhitungan dari authoritative data.|
|Freeze Candidate|Package architecture/implementation siap technical<br>review/freeze tetapi belum formal approved Production<br>baseline.|
|Production Baseline|Approved point-in-time reference actual Production<br>configuration/state.|



##### **2. Non-Negotiable Invariants — ringkasan cepat** 

- Student ID immutable; returning student reuse Student ID. 

- New commercial participation/renewal mendapat Enrollment ID baru. 

- Session ID immutable; reschedule membuat Session ID baru. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

KOLASE | BP-011 — Penjelasan Lengkap Bahasa Indonesia 

- Payment harus verified sebelum paid activation. 

- Remaining Sessions hanya ledger-derived; tidak ada authoritative manual balance edit. 

- Trial recognition signed ETX = -7 exactly once on conversion. 

- One payable Session ID tidak boleh dibayar dua kali. 

- Class hard maximum = 5 student. 

- Calendar, Dashboard dan WhatsApp bukan operational source-of-truth. 

- Material history tidak dihapus sebagai normal correction. 

- PROD, TEST dan recovery context tidak boleh contaminate satu sama lain. 

- Automation tidak boleh menciptakan/override policy. 

- Privileged Production action attributable ke named actor. 

- Raw secrets tidak disimpan di ordinary Sheets. 

- Blocking dependency tidak boleh diselesaikan dengan guessed rule di code/config/formula. 

**Ringkasan BP-011 dalam satu paragraf.** KOLASE menggunakan Blueprint/Decision Register sebagai policy authority, governed config/master sebagai applicable values, enam Google Sheets workbooks sebagai operational source-of-truth, Google Forms sebagai structured intake, Drive sebagai evidence repository, Google Calendar sebagai schedule projection, WB-05 sebagai readonly reporting dan WhatsApp sebagai communication channel. Persistent identities immutable; material economics dicatat melalui auditable transactions/ledgers; workflows memakai controlled states; access mengikuti RBAC/SoD; correction mempertahankan history; automation harus idempotent/recoverable; TEST/PROD isolated; data direkonsiliasi; backup harus dapat direstore; perubahan melalui controlled release; dan Go-Live hanya terjadi setelah technical/business/QA readiness serta final governance decision terpenuhi. 

Dokumen ini merupakan explanatory companion. Untuk technical implementation, field/table/automation/integration/test contract tetap harus dibaca bersama BP-011 V0.9 dan Unified Implementation Package yang authoritative. 

Internal Governance Reference | Berdasarkan BP-011 V0.9 Freeze Candidate 

