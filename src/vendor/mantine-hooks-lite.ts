import { useCallback, useState } from 'react'

type RefTarget<T> = ((node: T | null) => void) | { current: T | null } | null | undefined

export function mergeRefs<T>(...refs: Array<RefTarget<T>>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') {
        ref(node)
      } else {
        ref.current = node
      }
    }
  }
}

export function useFocusTrap(_active = true) {
  void _active
  return useCallback(() => undefined, [])
}

export function useFocusWithin() {
  const [focused, setFocused] = useState(false)

  return {
    focused,
    ref: useCallback((node: HTMLElement | null) => {
      if (!node) return
      const onFocusIn = () => setFocused(true)
      const onFocusOut = (event: FocusEvent) => {
        if (event.relatedTarget instanceof Node && node.contains(event.relatedTarget)) return
        setFocused(false)
      }

      node.addEventListener('focusin', onFocusIn)
      node.addEventListener('focusout', onFocusOut)
    }, []),
  }
}

export function useHover<T extends HTMLElement = HTMLElement>() {
  const [hovered, setHovered] = useState(false)

  return {
    hovered,
    ref: useCallback((node: T | null) => {
      if (!node) return
      node.addEventListener('mouseenter', () => setHovered(true))
      node.addEventListener('mouseleave', () => setHovered(false))
    }, []),
  }
}
