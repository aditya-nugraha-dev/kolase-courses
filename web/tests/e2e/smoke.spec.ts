import { test, expect } from '@playwright/test';

test('landing memuat', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/KOLASE/i);
});

test('daftar memuat', async ({ page }) => {
  const res = await page.goto('/daftar');
  expect(res?.status()).toBe(200);
});

test('pratinjau LMS kids tampil', async ({ page }) => {
  const res = await page.goto('/program/little-speakers');
  expect(res?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Peta 12 Misi Little Speakers/i })).toBeVisible();
  await expect(page.getByText('Explorer', { exact: true })).toBeVisible();
});

test('API health ok', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.ok).toBe(true);
});
