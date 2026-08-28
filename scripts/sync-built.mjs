import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const harnessRoot = resolve(process.argv[2] ?? '')

if (process.argv[2] === undefined) {
  throw new Error('Usage: node scripts/sync-built.mjs /absolute/path/to/deepseek-harness')
}

const harnessManifestPath = join(harnessRoot, 'package.json')
if (!existsSync(harnessManifestPath)) {
  throw new Error(`DeepSeek Harness package.json not found at ${harnessManifestPath}`)
}
const harnessManifest = JSON.parse(readFileSync(harnessManifestPath, 'utf8'))
if (harnessManifest.name !== '@deepseek-ai/dsh-root') {
  throw new Error(`Expected @deepseek-ai/dsh-root at ${harnessRoot}`)
}

const artifacts = [
  'packages/bundle/zentao/lib/index.js',
  'packages/bundle/zentao/lib/invariant.js',
  'packages/bundle/zentao/lib/types/index.d.ts',
  'packages/bundle/zentao/lib/types/invariant.d.ts',
  'packages/host/zentao-cli-gateway/lib/index.js',
  'packages/host/zentao-cli-gateway/lib/invariant.js',
  'packages/host/zentao-cli-gateway/lib/types/index.d.ts',
  'packages/host/zentao-cli-gateway/lib/types/invariant.d.ts',
  'packages/client/ui-zentao-notifications/lib/index.js',
  'packages/client/ui-zentao-notifications/lib/invariant.js',
  'packages/client/ui-zentao-notifications/lib/client.js',
  'packages/client/ui-zentao-notifications/lib/types/index.d.ts',
  'packages/client/ui-zentao-notifications/lib/types/invariant.d.ts',
  'packages/client/ui-zentao-notifications/lib/types/client/index.d.ts',
  'packages/client/ui-zentao-notifications/lib/types/client/ZentaoSidebar.d.ts',
]

for (const artifact of artifacts) {
  const from = join(harnessRoot, artifact)
  if (!existsSync(from)) throw new Error(`Missing built artifact: ${from}`)
  const to = join(sourceRoot, artifact)
  mkdirSync(dirname(to), { recursive: true })
  copyFileSync(from, to)
}

console.log(`Synced ${artifacts.length} release artifacts from ${harnessRoot}`)
