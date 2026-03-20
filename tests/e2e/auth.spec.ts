import { test, expect } from '@playwright/test'

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/sign-in')
  // Step 1: email
  await page.getByLabel(/email address/i).fill(process.env.E2E_TEST_EMAIL!)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  // Step 2: password (Clerk routes to /sign-in/factor-one or factor-two)
  await page.waitForURL(/\/sign-in\/factor/, { timeout: 10000 })
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.E2E_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForURL('**/dashboard', { timeout: 15000 })
}

test.describe('Authentication', () => {
  test('unauthenticated user is redirected to sign-in', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/sign-in/)
  })

  test.skip('user can sign in and reach dashboard', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Your Rooms')).toBeVisible()
  })

  test.skip('user can sign out', async ({ page }) => {
    await signIn(page)
    // Open Clerk user button and sign out
    await page.getByRole('button', { name: /open user button/i }).click()
    await page.getByRole('menuitem', { name: /sign out/i }).click()
    await expect(page).toHaveURL('/')
  })
})
