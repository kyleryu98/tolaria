import path from 'node:path'

function nodeMajor(version) {
  const match = version.match(/^v?(\d+)\./)
  return match ? Number.parseInt(match[1], 10) : 0
}

if (
  nodeMajor(process.version) >= 25
  && process.env.TOLARIA_BUILD_ALLOW_UNSTABLE_NODE !== '1'
) {
  throw new Error(
    `Vite production builds are not stable under ${process.version}; run pnpm vite:build so scripts/run-vite-build.sh can select Node 24, 22, or 20.`,
  )
}

const { build, loadConfigFromFile, mergeConfig } = await import('vite')

const mode = process.env.MODE || 'production'
const loaded = await loadConfigFromFile({ command: 'build', mode }, 'vite.config.ts')

if (!loaded) {
  throw new Error('Failed to load Vite config')
}

let transformedModules = 0
let lastReportedMemoryBucket = 0
const traceEveryValue = Number.parseInt(process.env.TOLARIA_BUILD_TRACE_EVERY ?? '100', 10)
const traceEveryModule = Number.isFinite(traceEveryValue) && traceEveryValue > 0
  ? traceEveryValue
  : 0
const traceResolution = process.env.TOLARIA_BUILD_TRACE_RESOLVE === '1'
const traceSuspiciousModules = process.env.TOLARIA_BUILD_TRACE_SUSPICIOUS === '1'

function logBuildMemory(label) {
  console.log(
    `[build-memory] ${label} transformed=${transformedModules} rss=${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
  )
}

const buildMemoryProgressPlugin = {
  name: 'build-memory-progress',
  enforce: 'pre',
  resolveId(source, importer) {
    if (
      traceResolution
      && (source === 'lowlight'
        || source.includes('highlight.js')
        || source.includes('@shikijs/langs')
        || source.includes('date-fns/locale'))
    ) {
      console.log(`[build-resolve] ${source} <- ${importer ?? '<entry>'}`)
    }
    return null
  },
  transform(_code, id) {
    transformedModules += 1
    const rssMegabytes = process.memoryUsage().rss / 1024 / 1024
    const memoryBucket = Math.floor(rssMegabytes / 100)
    if (
      traceSuspiciousModules
      && (id.includes('highlight.js') || id.includes('lowlight') || id.includes('@shikijs/langs'))
    ) {
      console.log(`[build-module] ${id}`)
    }

    if (
      (traceEveryModule > 0 && transformedModules % traceEveryModule === 0)
      || memoryBucket > lastReportedMemoryBucket
      || transformedModules % 1000 === 0
    ) {
      lastReportedMemoryBucket = memoryBucket
      console.log(
        `[build-memory] transformed=${transformedModules} rss=${Math.round(rssMegabytes)}MB ${path.basename(id)}`,
      )
    }

    return null
  },
}

const heartbeat = setInterval(() => logBuildMemory('heartbeat'), 5000)

try {
  await build(mergeConfig(loaded.config, {
    plugins: [buildMemoryProgressPlugin],
  }))
} finally {
  clearInterval(heartbeat)
}
