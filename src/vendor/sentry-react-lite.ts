export type ErrorEvent = {
  breadcrumbs?: Array<{ message?: string }>
  exception?: { values?: Array<{ value?: string }> }
  message?: string
}

type ReactRootErrorInfo = { componentStack?: string }
type ReactRootErrorHandler = (error: unknown, errorInfo: ReactRootErrorInfo) => void

export function init(): void {}

export function setUser(): void {}

export function setTag(): void {}

export function close(): void {}

export function reactErrorHandler(): ReactRootErrorHandler {
  return () => {}
}
