class YCollection<T = unknown> {
  private readonly valuesByKey = new globalThis.Map<string, T>()
  private readonly items: T[] = []

  get(key: string): T | undefined {
    return this.valuesByKey.get(key)
  }

  set(key: string, value: T): this {
    this.valuesByKey.set(key, value)
    return this
  }

  values(): IterableIterator<T> {
    return this.valuesByKey.values()
  }

  push(values: T[]): void {
    this.items.push(...values)
  }

  map<U>(callback: (value: T, index: number) => U): U[] {
    return this.items.map(callback)
  }
}

export class Array<T = unknown> extends YCollection<T> {}

export class Map<T = unknown> extends YCollection<T> {}

export class XmlElement extends YCollection<unknown> {}

export class XmlFragment extends YCollection<unknown> {
  doc: Doc | null = null
}

export class Doc {
  getMap<T = unknown>(): Map<T> {
    return new Map<T>()
  }

  getXmlFragment(): XmlFragment {
    const fragment = new XmlFragment()
    fragment.doc = this
    return fragment
  }
}

export class UndoManager {
  undoStack: unknown[] = []
}

export class AbstractType<T = unknown> extends YCollection<T> {}

export class Item {}

export class ContentType {}

export function applyUpdate(): void {}

export function encodeStateAsUpdate(): Uint8Array {
  return new Uint8Array()
}

export function encodeStateVector(): Uint8Array {
  return new Uint8Array()
}

export function findIndexSS(): number {
  return -1
}
