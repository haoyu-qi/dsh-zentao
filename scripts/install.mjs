import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const targetRoot = resolve(process.argv[2] ?? '')

if (process.argv[2] === undefined) {
  throw new Error('Usage: node scripts/install.mjs /absolute/path/to/deepseek-harness')
}

const targetManifestPath = join(targetRoot, 'package.json')
if (!existsSync(targetManifestPath)) {
  throw new Error(`DeepSeek Harness package.json not found at ${targetManifestPath}`)
}

const targetManifest = JSON.parse(readFileSync(targetManifestPath, 'utf8'))
if (targetManifest.name !== '@deepseek-ai/dsh-root') {
  throw new Error(`Expected @deepseek-ai/dsh-root at ${targetRoot}`)
}

function copyTree(source, target) {
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const sourcePath = join(source, entry.name)
    const targetPath = join(target, entry.name)
    if (entry.isDirectory()) copyTree(sourcePath, targetPath)
    else if (entry.isFile()) copyFileSync(sourcePath, targetPath)
  }
}

for (const packagePath of [
  'packages/bundle/zentao',
  'packages/client/ui-zentao-notifications',
  'packages/host/zentao-cli-gateway',
]) {
  copyTree(join(sourceRoot, packagePath), join(targetRoot, packagePath))
}

copyTree(join(sourceRoot, 'overlay'), targetRoot)

/** Strip `//` and `/* *​/` comments (not inside strings) so JSON5 tsconfig can parse as JSON. */
function stripJsonComments(text) {
  let out = ''
  let inString = false
  let inBlock = false
  let inLine = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    const next = text[i + 1]
    if (inBlock) {
      if (ch === '*' && next === '/') { inBlock = false; i += 1 }
      continue
    }
    if (inLine) {
      if (ch === '\n') { inLine = false; out += '\n' }
      continue
    }
    if (inString) {
      out += ch
      if (ch === '\\') { out += next; i += 1 }
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') { inString = true; out += ch; continue }
    if (ch === '/' && next === '/') { inLine = true; i += 1; continue }
    if (ch === '/' && next === '*') { inBlock = true; i += 1; continue }
    out += ch
  }
  return out
}

function updateJson(relativePath, update) {
  const path = join(targetRoot, relativePath)
  const value = JSON.parse(stripJsonComments(readFileSync(path, 'utf8')))
  update(value)
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

function addReference(references, path) {
  if (!references.some(reference => reference.path === path)) references.push({ path })
}

updateJson('tsconfig.base.json', config => {
  const paths = config.compilerOptions?.paths
  if (paths === undefined) throw new Error('tsconfig.base.json has no compilerOptions.paths')
  paths['@deepseek-ai/dsh-host-zentao-cli-gateway'] = ['./packages/host/zentao-cli-gateway/src']
  paths['@deepseek-ai/dsh-client-ui-zentao-notifications'] = ['./packages/client/ui-zentao-notifications/src']
})

updateJson('tsconfig.client.json', config => {
  if (!Array.isArray(config.references)) throw new Error('tsconfig.client.json has no references')
  addReference(config.references, './packages/client/ui-zentao-notifications')
})

updateJson('tsconfig.host.json', config => {
  if (!Array.isArray(config.references)) throw new Error('tsconfig.host.json has no references')
  addReference(config.references, './packages/bundle/zentao')
  addReference(config.references, './packages/host/zentao-cli-gateway')
})

console.log(`Installed DSH-ZENTAO sources into ${targetRoot}`)
console.log('Next: pnpm install && pnpm run build')
