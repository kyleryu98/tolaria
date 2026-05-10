type LowlightRoot = {
  children: unknown[]
  type: 'root'
}

type Lowlight = {
  highlight: () => LowlightRoot
  highlightAuto: () => LowlightRoot
}

const emptyRoot = (): LowlightRoot => ({ type: 'root', children: [] })

export const all = {}
export const common = {}

export function createLowlight(): Lowlight {
  return {
    highlight: emptyRoot,
    highlightAuto: emptyRoot,
  }
}
