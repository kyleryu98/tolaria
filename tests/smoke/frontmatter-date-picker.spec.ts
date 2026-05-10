import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import {
  createFixtureVaultCopy,
  openFixtureVaultDesktopHarness,
  removeFixtureVaultCopy,
} from '../helpers/fixtureVault'
import { APP_COMMAND_IDS } from '../../src/hooks/appCommandCatalog'
import { triggerShortcutCommand } from './testBridge'

test.use({ timezoneId: 'Europe/Rome' })

let tempVaultDir: string

function alphaProjectPath(vaultPath: string): string {
  return path.join(vaultPath, 'project', 'alpha-project.md')
}

function seedDateProperty(notePath: string, value: string): void {
  const content = fs.readFileSync(notePath, 'utf8')
  fs.writeFileSync(notePath, content.replace('Status: Active\n', `Status: Active\nDate: ${value}\n`))
}

test.describe('Frontmatter date picker', () => {
  test.beforeEach(async ({ page }) => {
    tempVaultDir = createFixtureVaultCopy()
    seedDateProperty(alphaProjectPath(tempVaultDir), '2026-04-29T00:00:00')
    await openFixtureVaultDesktopHarness(page, tempVaultDir)
    await page.setViewportSize({ width: 1600, height: 900 })
  })

  test.afterEach(() => {
    removeFixtureVaultCopy(tempVaultDir)
  })

  test('local-midnight date properties keep the selected calendar day @smoke', async ({ page }) => {
    const notePath = alphaProjectPath(tempVaultDir)

    await page.getByTestId('note-list-container').getByText('Alpha Project', { exact: true }).click()
    await expect(page.locator('.bn-editor')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('heading', { name: 'Alpha Project', level: 1 })).toBeVisible({ timeout: 5_000 })
    await triggerShortcutCommand(page, APP_COMMAND_IDS.viewToggleProperties)
    await expect(page.getByTestId('add-property-row')).toBeVisible()

    const dateRow = page.getByTestId('editable-property').filter({ hasText: 'Date' })
    await dateRow.getByTestId('date-display').click()

    await expect(page.getByTestId('date-picker-input')).toHaveValue('2026-04-29')
    const triggerBox = await dateRow.getByTestId('date-display').boundingBox()
    const popoverBox = await page.getByTestId('date-picker-popover').boundingBox()
    const rowBox = await dateRow.boundingBox()
    expect(popoverBox?.y).toBeGreaterThanOrEqual((rowBox?.y ?? 0) + (rowBox?.height ?? 0) - 1)
    expect((popoverBox?.x ?? 0) + (popoverBox?.width ?? 0)).toBeLessThanOrEqual((triggerBox?.x ?? 0) + (triggerBox?.width ?? 0) + 2)

    const nativeDateInput = page.getByTestId('date-picker-calendar')
    await expect(nativeDateInput).toHaveValue('2026-04-29')
    await nativeDateInput.fill('2026-04-30')

    await expect.poll(() => fs.readFileSync(notePath, 'utf8')).toMatch(/Date: "?2026-04-30"?/)
  })

  test('native date input updates the date property across month and year', async ({ page }) => {
    const notePath = alphaProjectPath(tempVaultDir)

    await page.getByTestId('note-list-container').getByText('Alpha Project', { exact: true }).click()
    await expect(page.locator('.bn-editor')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('heading', { name: 'Alpha Project', level: 1 })).toBeVisible({ timeout: 5_000 })
    await triggerShortcutCommand(page, APP_COMMAND_IDS.viewToggleProperties)

    const dateRow = page.getByTestId('editable-property').filter({ hasText: 'Date' })
    await dateRow.getByTestId('date-display').click()

    const nativeDateInput = page.getByTestId('date-picker-calendar')
    await expect(nativeDateInput).toBeVisible()
    await expect(nativeDateInput).toHaveValue('2026-04-29')
    const clearButtonBox = await page.getByTestId('date-picker-clear').boundingBox()
    const inputBox = await nativeDateInput.boundingBox()
    expect(clearButtonBox?.y).toBeGreaterThanOrEqual((inputBox?.y ?? 0) + (inputBox?.height ?? 0) - 1)
    await nativeDateInput.fill('2027-05-13')

    await expect.poll(() => fs.readFileSync(notePath, 'utf8')).toMatch(/Date: "?2027-05-13"?/)
  })

  test('manual date input updates the date property', async ({ page }) => {
    const notePath = alphaProjectPath(tempVaultDir)

    await page.getByTestId('note-list-container').getByText('Alpha Project', { exact: true }).click()
    await expect(page.locator('.bn-editor')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('heading', { name: 'Alpha Project', level: 1 })).toBeVisible({ timeout: 5_000 })
    await triggerShortcutCommand(page, APP_COMMAND_IDS.viewToggleProperties)

    const dateRow = page.getByTestId('editable-property').filter({ hasText: 'Date' })
    await dateRow.getByTestId('date-display').click()

    const input = page.getByTestId('date-picker-input')
    await input.fill('2026-05-13')
    await input.press('Enter')

    await expect.poll(() => fs.readFileSync(notePath, 'utf8')).toMatch(/Date: "?2026-05-13"?/)
  })
})
