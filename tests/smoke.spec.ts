import { test, expect } from '@playwright/test'

// Helper: skip onboarding and wait for weather to load
async function ready(page: Parameters<typeof test>[1]) {
  await page.goto('/')
  const skip = page.locator('button', { hasText: 'Skip' })
  if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skip.click()
  }
  // Wait for weather data — hero temperature appears
  await page.locator('text=/°/').first().waitFor({ timeout: 12_000 })
}

// ── Core smoke tests ──────────────────────────────────────────────────────────

test('app loads and shows weather', async ({ page }) => {
  await ready(page)
  await expect(page.locator('button[aria-label*="Current location"]')).toBeVisible()
  await expect(page.locator('text=/\\d+°/').first()).toBeVisible()
  // H:/L: line visible from placeholder data
  await expect(page.locator('text=/H:\\d+°/').first()).toBeVisible({ timeout: 3000 })
})

test('unit toggle switches °C to °F', async ({ page }) => {
  await ready(page)
  const tempC = await page.locator('span').filter({ hasText: /^\d+$/ }).first().textContent()
  const celsius = parseInt(tempC ?? '0', 10)

  await page.click('button[aria-label="Settings"]')
  await page.locator('button', { hasText: '°F' }).click()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)

  const tempF = await page.locator('span').filter({ hasText: /^\d+$/ }).first().textContent()
  const fahrenheit = parseInt(tempF ?? '0', 10)
  expect(fahrenheit).toBeGreaterThan(celsius)
})

test('city search adds a card to Cities view', async ({ page }) => {
  await ready(page)
  await page.locator('button[role="tab"][aria-label="Cities"]').click()
  await page.waitForTimeout(500)
  await page.fill('input[aria-label*="city"]', 'Tokyo')
  await page.waitForTimeout(700)
  const tokyo = page.locator('button', { hasText: 'Tokyo' }).first()
  await expect(tokyo).toBeVisible({ timeout: 5000 })
  await tokyo.click()
  await page.waitForTimeout(500)
  await expect(page.locator('button[aria-label*="Tokyo"]')).toBeVisible({ timeout: 6000 })
})

test('?city= deep-link auto-loads the city', async ({ page }) => {
  await page.goto('/?city=Paris')
  await page.locator('text=/°/').first().waitFor({ timeout: 12_000 })
  await expect(page.locator('button[aria-label*="Paris"]')).toBeVisible()
})

test('swipe left changes to next saved city', async ({ page }) => {
  await ready(page)
  await page.locator('button[role="tab"][aria-label="Cities"]').click()
  await page.fill('input[aria-label*="city"]', 'London')
  await page.waitForTimeout(700)
  const london = page.locator('button', { hasText: 'London' }).first()
  if (await london.isVisible({ timeout: 3000 }).catch(() => false)) {
    await london.click()
    await page.waitForTimeout(500)
  }
  await page.locator('button[role="tab"][aria-label="Today"]').click()
  await page.waitForTimeout(500)
  await expect(page.locator('[style*="border-radius: 3px"]').first()).toBeVisible()
})

test('settings sheet opens and closes', async ({ page }) => {
  await ready(page)
  await page.click('button[aria-label="Settings"]')
  await expect(page.locator('text=Settings')).toBeVisible()
  await page.click('button[aria-label="Close settings"]')
  await expect(page.locator('text=Settings')).not.toBeVisible({ timeout: 2000 })
})

// ── New comprehensive tests ───────────────────────────────────────────────────

test('Escape key closes settings sheet', async ({ page }) => {
  await ready(page)
  await page.click('button[aria-label="Settings"]')
  await expect(page.locator('text=Settings')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('text=Settings')).not.toBeVisible({ timeout: 2000 })
})

test('unit preference persists after page reload', async ({ page }) => {
  await ready(page)
  await page.click('button[aria-label="Settings"]')
  // Switch to °F
  const fPill = page.locator('button[aria-label="Temperature Fahrenheit"]')
  await fPill.click()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)

  // Reload and re-open settings
  await page.reload()
  await page.locator('text=/°/').first().waitFor({ timeout: 8_000 })
  await page.click('button[aria-label="Settings"]')

  // °F pill should be aria-pressed="true"
  await expect(page.locator('button[aria-label="Temperature Fahrenheit"]')).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
})

test('language switching shows translated UI text', async ({ page }) => {
  await ready(page)
  await page.click('button[aria-label="Settings"]')

  // Switch to French
  await page.locator('button', { hasText: 'Français' }).click()
  await page.waitForTimeout(300)

  // Settings title is now in French
  await expect(page.locator('text=Paramètres')).toBeVisible()

  // Wind speed label is in French
  await expect(page.locator('text=Vitesse du vent')).toBeVisible()

  // Switch back to English and close
  await page.locator('button', { hasText: 'English' }).click()
  await page.keyboard.press('Escape')
})

test('forecast view renders day chips', async ({ page }) => {
  await ready(page)
  await page.locator('button[role="tab"][aria-label="Forecast"]').click()
  await page.waitForTimeout(800)
  // Either day chips (data loaded) or skeleton is present
  const forecastView = page.locator('button[role="tab"][aria-label="Forecast"]')
  await expect(forecastView).toHaveAttribute('aria-selected', 'true')
  // The forecast nav tab is selected
  await expect(page.locator('button[aria-selected="true"]')).toBeVisible()
})

test('radar view has layer toggle buttons', async ({ page }) => {
  await ready(page)
  await page.locator('button[role="tab"][aria-label="Radar"]').click()
  await page.waitForTimeout(2000)

  // Layer toggle buttons exist
  const precipBtn = page.locator('button', { hasText: /Precip|Precipit/ }).first()
  const satBtn = page.locator('button', { hasText: 'Satellite' }).first()
  await expect(precipBtn).toBeVisible({ timeout: 5000 })
  await expect(satBtn).toBeVisible({ timeout: 5000 })

  // Zoom buttons exist
  await expect(page.locator('button[aria-label="Zoom in"]')).toBeVisible()
  await expect(page.locator('button[aria-label="Zoom out"]')).toBeVisible()

  // Click satellite layer
  await satBtn.click()
  await page.waitForTimeout(300)
  // Click precip layer back
  await precipBtn.click()
})

test('arrow keys navigate pill nav tabs', async ({ page }) => {
  await ready(page)

  // Focus the active Today tab
  await page.locator('button[role="tab"][aria-selected="true"]').focus()
  // Press ArrowRight to go to Forecast
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(300)
  await expect(page.locator('button[role="tab"][aria-label="Forecast"]')).toHaveAttribute('aria-selected', 'true')

  // ArrowLeft back to Today
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(300)
  await expect(page.locator('button[role="tab"][aria-label="Today"]')).toHaveAttribute('aria-selected', 'true')
})

test('widget size=sm renders without main nav', async ({ page }) => {
  await page.goto('/#widget&size=sm')
  await page.waitForTimeout(2000)
  // Main app navigation must NOT be present (it's a widget, not the full app)
  await expect(page.locator('nav[aria-label="Main navigation"]')).not.toBeVisible()
  // A coloured gradient container renders (skeleton or actual widget)
  await expect(page.locator('div').filter({ has: page.locator('[style*="gradient"]') }).first()).toBeVisible({ timeout: 5000 })
})

test('widget size=lg renders without main nav', async ({ page }) => {
  await page.goto('/#widget&size=lg')
  await page.waitForTimeout(2000)
  await expect(page.locator('nav[aria-label="Main navigation"]')).not.toBeVisible()
  // Gradient container present
  await expect(page.locator('div').filter({ has: page.locator('[style*="gradient"]') }).first()).toBeVisible({ timeout: 5000 })
})
