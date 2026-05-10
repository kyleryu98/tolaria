export const STARTUP_INTEGRATION_CHECK_DELAY_MS = 1500
export const STARTUP_UPDATE_CHECK_DELAY_MS = 8000

export function scheduleStartupIntegrationCheck(
  callback: () => void,
  delayMs = STARTUP_INTEGRATION_CHECK_DELAY_MS,
): () => void {
  const timer = window.setTimeout(callback, delayMs)
  return () => { window.clearTimeout(timer) }
}
