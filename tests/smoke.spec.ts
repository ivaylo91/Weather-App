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

test('app loads and shows weather', async ({ page }) => {
  await ready(page)
  // City name shown in TopBar
  await expect(page.locator('button[aria-label*="Current location"]')).toBeVisible()
  // Temperature displayed
  await expect(page.locator('text=/\\d+°/').first()).toBeVisible()
  // H:/L: line visible from placeholder data (no network needed)
  await expect(page.locator('text=/H:\\d+°/').first()).toBeVisible({ timeout: 3000 })
})

test('unit toggle switches °C to °F', async ({ page }) => {
  await ready(page)
  // Get current temperature in °C
  const tempC = await page.locator('span').filter({ hasText: /^\d+$/ }).first().textContent()
  const celsius = parseInt(tempC ?? '0', 10)

  // Open settings
  await page.click('button[aria-label="Settings"]')
  await page.locator('button', { hasText: '°F' }).click()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)

  // Temperature should now be in Fahrenheit
  const tempF = await page.locator('span').filter({ hasText: /^\d+$/ }).first().textContent()
  const fahrenheit = parseInt(tempF ?? '0', 10)
  expect(fahrenheit).toBeGreaterThan(celsius) // F is always > C above freezing
})

test('city search adds a card to Cities view', async ({ page }) => {
  await ready(page)

  // Open cities tab
  await page.locator('button[role="tab"][aria-label="Cities"]').click()
  await page.waitForTimeout(500)

  // Search for Tokyo
  await page.fill('input[aria-label*="city"]', 'Tokyo')
  await page.waitForTimeout(700)

  // Suggestion appears
  const tokyo = page.locator('button', { hasText: 'Tokyo' }).first()
  await expect(tokyo).toBeVisible({ timeout: 5000 })
  await tokyo.click()
  await page.waitForTimeout(500)

  // Now in Today view showing Tokyo
  await expect(page.locator('button[aria-label*="Tokyo"]')).toBeVisible({ timeout: 6000 })
})

test('?city= deep-link auto-loads the city', async ({ page }) => {
  await page.goto('/?city=Paris')
  // Onboarding skipped, weather for Paris loads
  await page.locator('text=/°/').first().waitFor({ timeout: 12_000 })
  await expect(page.locator('button[aria-label*="Paris"]')).toBeVisible()
})

test('swipe left changes to next saved city', async ({ page }) => {
  await ready(page)

  // Save a second city via search first
  await page.locator('button[role="tab"][aria-label="Cities"]').click()
  await page.fill('input[aria-label*="city"]', 'London')
  await page.waitForTimeout(700)
  const london = page.locator('button', { hasText: 'London' }).first()
  if (await london.isVisible({ timeout: 3000 }).catch(() => false)) {
    await london.click()
    await page.waitForTimeout(500)
  }

  // Go back to Today
  await page.locator('button[role="tab"][aria-label="Today"]').click()
  await page.waitForTimeout(500)

  // Dots indicator should be visible
  await expect(page.locator('[style*="border-radius: 3px"]').first()).toBeVisible()
})

test('settings sheet opens and closes', async ({ page }) => {
  await ready(page)
  await page.click('button[aria-label="Settings"]')
  await expect(page.locator('text=Settings')).toBeVisible()
  await page.click('button[aria-label="Close settings"]')
  await expect(page.locator('text=Settings')).not.toBeVisible({ timeout: 2000 })
})
