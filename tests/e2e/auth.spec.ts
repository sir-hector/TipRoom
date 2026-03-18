import { test, expect } from '@playwright/test'
import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright'

test.describe('Authentication', () => {
  test('unauthenticated user is redirected to sign-in', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/sign-in/)
  })

  test('user can sign in and reach dashboard', async ({ page }) => {
    await setupClerkTestingToken({ page })

    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        identifier: process.env.E2E_TEST_EMAIL!,
        password: process.env.E2E_TEST_PASSWORD!,
      },
    })

    await page.goto('/dashboard')
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Your Rooms')).toBeVisible()
  })

  test('user can sign out', async ({ page }) => {
    await setupClerkTestingToken({ page })

    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        identifier: process.env.E2E_TEST_EMAIL!,
        password: process.env.E2E_TEST_PASSWORD!,
      },
    })

    await clerk.signOut({ page })
    await expect(page).toHaveURL('/')
  })
})
