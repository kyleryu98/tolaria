import type { CodeBlockOptions } from '@blocknote/core'
import { createdBundledHighlighter } from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import type {
  DynamicImportLanguageRegistration,
  DynamicImportThemeRegistration,
  HighlighterGeneric,
} from '@shikijs/types'
import { supportsModernRegexFeatures } from '../utils/regexCapabilities'

const LIGHT_CODE_THEME = 'github-light'
const DARK_CODE_THEME = 'github-dark'

type TolariaCodeTheme = typeof LIGHT_CODE_THEME | typeof DARK_CODE_THEME
type TolariaCodeHighlighter = HighlighterGeneric<string, TolariaCodeTheme>

const supportedLanguages = {
  text: { name: 'Plain Text', aliases: ['text', 'txt', 'plain'] },
  javascript: { name: 'JavaScript', aliases: ['javascript', 'js'] },
  typescript: { name: 'TypeScript', aliases: ['typescript', 'ts'] },
  tsx: { name: 'TSX', aliases: ['tsx', 'typescriptreact'] },
  jsx: { name: 'JSX', aliases: ['jsx'] },
  json: { name: 'JSON', aliases: ['json'] },
  markdown: { name: 'Markdown', aliases: ['markdown', 'md'] },
  shellscript: { name: 'Shell', aliases: ['shellscript', 'bash', 'sh', 'shell', 'zsh'] },
  css: { name: 'CSS', aliases: ['css'] },
  html: { name: 'HTML', aliases: ['html'] },
  yaml: { name: 'YAML', aliases: ['yaml', 'yml'] },
  sql: { name: 'SQL', aliases: ['sql'] },
  python: { name: 'Python', aliases: ['python', 'py'] },
  rust: { name: 'Rust', aliases: ['rust', 'rs'] },
  mermaid: { name: 'Mermaid', aliases: ['mermaid', 'mmd'] },
} satisfies CodeBlockOptions['supportedLanguages']

const bundledLanguages = {
  javascript: () => import('@shikijs/langs-precompiled/javascript'),
  js: () => import('@shikijs/langs-precompiled/javascript'),
  typescript: () => import('@shikijs/langs-precompiled/typescript'),
  ts: () => import('@shikijs/langs-precompiled/typescript'),
  tsx: () => import('@shikijs/langs-precompiled/tsx'),
  typescriptreact: () => import('@shikijs/langs-precompiled/tsx'),
  jsx: () => import('@shikijs/langs-precompiled/jsx'),
  json: () => import('@shikijs/langs-precompiled/json'),
  markdown: () => import('@shikijs/langs-precompiled/markdown'),
  md: () => import('@shikijs/langs-precompiled/markdown'),
  shellscript: () => import('@shikijs/langs-precompiled/shellscript'),
  bash: () => import('@shikijs/langs-precompiled/shellscript'),
  sh: () => import('@shikijs/langs-precompiled/shellscript'),
  shell: () => import('@shikijs/langs-precompiled/shellscript'),
  zsh: () => import('@shikijs/langs-precompiled/shellscript'),
  css: () => import('@shikijs/langs-precompiled/css'),
  html: () => import('@shikijs/langs-precompiled/html'),
  yaml: () => import('@shikijs/langs-precompiled/yaml'),
  yml: () => import('@shikijs/langs-precompiled/yaml'),
  sql: () => import('@shikijs/langs-precompiled/sql'),
  python: () => import('@shikijs/langs-precompiled/python'),
  py: () => import('@shikijs/langs-precompiled/python'),
  rust: () => import('@shikijs/langs-precompiled/rust'),
  rs: () => import('@shikijs/langs-precompiled/rust'),
  mermaid: () => import('@shikijs/langs-precompiled/mermaid'),
  mmd: () => import('@shikijs/langs-precompiled/mermaid'),
} satisfies Record<string, DynamicImportLanguageRegistration>

const bundledThemes = {
  [LIGHT_CODE_THEME]: () => import('@shikijs/themes/github-light'),
  [DARK_CODE_THEME]: () => import('@shikijs/themes/github-dark'),
} satisfies Record<TolariaCodeTheme, DynamicImportThemeRegistration>

const createTolariaBundledHighlighter = createdBundledHighlighter<string, TolariaCodeTheme>({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createJavaScriptRegexEngine(),
})

function currentCodeBlockTheme() {
  if (typeof document === 'undefined') return LIGHT_CODE_THEME

  const root = document.documentElement
  return root.classList.contains('dark') || root.dataset.theme === 'dark'
    ? DARK_CODE_THEME
    : LIGHT_CODE_THEME
}

function prioritizeTheme(themes: string[], theme: string) {
  return [theme, ...themes.filter((candidate) => candidate !== theme)]
}

async function createTolariaCodeHighlighter(): Promise<TolariaCodeHighlighter> {
  const highlighter = await createTolariaBundledHighlighter({
    themes: [LIGHT_CODE_THEME, DARK_CODE_THEME],
    langs: [],
  })

  return {
    ...highlighter,
    getLoadedThemes: () => prioritizeTheme(highlighter.getLoadedThemes(), currentCodeBlockTheme()),
  }
}

export function createTolariaCodeBlockOptions(): Partial<CodeBlockOptions> {
  const options: Partial<CodeBlockOptions> = {
    supportedLanguages,
    createHighlighter: createTolariaCodeHighlighter,
    defaultLanguage: 'text',
  }

  if (supportsModernRegexFeatures()) return options

  delete options.createHighlighter
  return options
}
