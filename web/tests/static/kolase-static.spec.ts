import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

const PAGES = [
  { path: '/home.html', title: /KOLASE/i },
  { path: '/catalog.html', title: /Katalog/i },
  { path: '/login.html', title: /Masuk/i },
  { path: '/dashboard.html', title: /KOLASE|Dashboard/i },
  { path: '/schedule.html', title: /KOLASE|Jadwal/i },
  { path: '/teacher-chat.html', title: /KOLASE|Chat/i },
  { path: '/profile.html', title: /KOLASE|Profil/i },
  { path: '/lms.html', title: /KOLASE|LMS/i },
];

// Resource eksternal (Drive, font, CDN) tidak diuji ketersediaannya dari CI.
const EXTERNAL_RESOURCE = /(drive\.google\.com|docs\.google\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net|wa\.me|api\.qrserver\.com)/i;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const url = msg.location().url || '';
    if (/Failed to load resource/i.test(text) && EXTERNAL_RESOURCE.test(url)) return;
    errors.push(`console: ${text}${url ? ` (${url})` : ''}`);
  });
  return errors;
}

async function waitForTheme(page: Page) {
  await page.waitForFunction(
    () => getComputedStyle(document.body).backgroundColor === 'rgb(255, 253, 247)',
    null,
    { timeout: 10000 }
  );
}

async function assertNoHorizontalOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return Math.max(doc.scrollWidth, body ? body.scrollWidth : 0) - window.innerWidth;
  });
  expect(overflow, `${label} melebar ${overflow}px`).toBeLessThanOrEqual(1);
}

async function assertLinksAlive(page: Page, request: APIRequestContext) {
  const raw = await page.$$eval('a[href]', (anchors) =>
    anchors.map((a) => a.getAttribute('href') || '').filter(Boolean)
  );
  const local = [...new Set(
    raw
      .map((href) => href.split('#')[0])
      .filter((href) => href && !/^(https?:|mailto:|tel:|javascript:|data:)/i.test(href))
  )];
  for (const href of local) {
    const url = new URL(href, page.url());
    const res = await request.get(url.pathname + url.search);
    expect(res.status(), `${page.url()} -> ${href}`).toBeLessThan(400);
  }
}

test.describe('KOLASE static pages', () => {
  for (const item of PAGES) {
    test(`${item.path} desktop: tanpa console error, link hidup, tidak melebar`, async ({ page, request }) => {
      const errors = collectErrors(page);
      const res = await page.goto(item.path, { waitUntil: 'domcontentloaded' });
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(item.title);
      await waitForTheme(page);
      await page.waitForTimeout(700);

      await assertLinksAlive(page, request);
      expect(errors, `Console error di ${item.path}`).toEqual([]);
      await assertNoHorizontalOverflow(page, `${item.path} desktop`);
    });

    test(`${item.path} HP: tidak melebar dan tab bawah muat`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const res = await page.goto(item.path, { waitUntil: 'domcontentloaded' });
      expect(res?.status()).toBe(200);
      await waitForTheme(page);
      await page.waitForTimeout(500);

      await assertNoHorizontalOverflow(page, `${item.path} HP 390px`);
      const tabs = page.locator('.mobile-tabs').first();
      await expect(tabs).toBeVisible();
      const boxes = await tabs.locator('a').evaluateAll((anchors) =>
        anchors.map((a) => {
          const rect = a.getBoundingClientRect();
          return { left: rect.left, right: rect.right, bottom: rect.bottom };
        })
      );
      expect(boxes.length).toBeGreaterThanOrEqual(4);
      for (const box of boxes) {
        expect(box.left, `${item.path} tab keluar kiri`).toBeGreaterThanOrEqual(-1);
        expect(box.right, `${item.path} tab keluar kanan`).toBeLessThanOrEqual(391);
        expect(box.bottom, `${item.path} tab keluar bawah`).toBeLessThanOrEqual(845);
      }
    });
  }
});

test('home: copy baru dan judul ramah orang tua tampil', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/home.html');
  await expect(
    page.getByText('Public Class, Little Explorers (6–8 Tahun), hingga Young Speakers (9–12 Tahun).', { exact: false })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Materi & Bahan Belajar Anak' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Panduan untuk Orang Tua' })).toBeVisible();
  await expect(page.getByText('SOP pendaftaran', { exact: false })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('catalog: filter cepat dan kartu kelas lengkap', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/catalog.html');
  await expect(page.getByRole('button', { name: 'Semua Kelas' })).toBeVisible();

  await page.getByRole('button', { name: 'Usia 6–8 Tahun (Little Explorers)' }).click();
  await expect(page.getByRole('button', { name: /Little Explorers/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#catalogCount')).toContainText('Menampilkan 2 dari 4 kelas');

  await page.getByRole('button', { name: 'Public Class', exact: true }).click();
  await expect(page.locator('#catalogCount')).toContainText('Menampilkan 2 dari 4 kelas');

  const card = page.locator('#catalogGrid .class-card').first();
  await expect(card.locator('.cc-age')).toContainText('Usia');
  await expect(card.locator('.cc-facts')).toContainText('sesi');
  await expect(card.locator('.cc-outcome')).toContainText('Manfaat belajar');
  await expect(card.locator('.cc-price')).toContainText('Rp');
  expect(errors).toEqual([]);
});

test('login: form pendaftaran anak ramah orang tua + ID STU tetap dibuat', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/login.html?mode=register');
  await expect(page.locator('#authTitle')).toHaveText('Daftar & Buat ID Siswa');
  await expect(page.getByText('Kontak Orang Tua', { exact: true })).toBeVisible();
  await expect(page.locator('#regNamaLabel')).toHaveText('Nama Lengkap Anak');
  await expect(page.locator('#regUsia option')).toHaveCount(8);
  await expect(page.locator('#regWaLabel')).toContainText('Orang Tua');
  await expect(page.locator('#regEmailLabel')).toContainText('Orang Tua');

  const email = `uji.${Date.now()}@example.com`;
  await page.locator('#regNama').fill('Anak Uji Coba');
  await page.locator('#regPanggilan').fill('Uji');
  await page.locator('#regUsia').selectOption('8');
  await page.locator('#regWa').fill('081234567890');
  await page.locator('#regEmail').fill(email);
  await page.locator('#regPass').fill('rahasia123');
  await page.locator('#regBtn').click();

  await expect(page.locator('#regSuccessId')).toHaveText(/^STU-\d{6}$/);
  await expect(page.locator('#regSuccess')).toBeVisible();
  expect(errors).toEqual([]);
});

test('dashboard: pintasan LMS, Meet, dan sisa sesi tampil ramah anak', async ({ page }) => {
  await page.goto('/home.html');
  await page.evaluate(() => {
    const key = 'kolase_db_v1';
    const db = JSON.parse(localStorage.getItem(key) || '{}');
    db.sessionUser = { role: 'student', id: 'STU-900001', nama: 'Alya Uji', email: 'alya.uji@example.com' };
    db.MST_STUDENTS = [{
      student_id: 'STU-900001', nama: 'Alya Uji', panggilan: 'Alya', usia: '8', email: 'alya.uji@example.com',
    }];
    localStorage.setItem(key, JSON.stringify(db));
    localStorage.setItem('kolase.lms.summary.v1:STU-900001', JSON.stringify({
      stars: 13, missionsDone: 1, missionsTotal: 12, level: 2, levelTitle: 'Sentence Builder',
      badges: [{ id: 'first-step', title: 'Langkah Pertama' }], streakDays: 2, nextBadge: null,
    }));
  });

  const errors = collectErrors(page);
  await page.goto('/dashboard.html');
  await expect(page.locator('#kidsHeroSec')).toBeVisible();
  await expect(page.locator('.kid-hero-actions a[href="lms.html"]')).toBeVisible();
  await expect(page.locator('#lmsCardSec')).toBeVisible();
  await expect(page.locator('#lmsCardSec a[href="lms.html"]').first()).toBeVisible();
  await expect(page.locator('#lmsStars')).toHaveText('13');
  await expect(page.locator('#nextMeetBtn')).toBeVisible();
  await expect(page.locator('#kidSessionPips')).toBeAttached();

  const meetHeight = await page.locator('#nextMeetBtn').evaluate((el) => el.getBoundingClientRect().height);
  expect(meetHeight).toBeGreaterThanOrEqual(48);
  expect(errors).toEqual([]);
});
