import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const packagePaths = [
  'packages/host/zentao-cli-gateway/package.json',
  'packages/client/ui-zentao-notifications/package.json',
  'packages/bundle/zentao/package.json',
]

const manifests = packagePaths.map(relativePath => {
  const path = join(root, relativePath)
  return { path, value: JSON.parse(readFileSync(path, 'utf8')) }
})

function fail(message) {
  throw new Error(message)
}

function visitExport(packageDir, key, value) {
  if (typeof value === 'string') {
    if (value.includes('*')) fail(`${key} uses an unverifiable wildcard export: ${value}`)
    const target = join(packageDir, value.replace(/^\.\//, ''))
    if (!existsSync(target)) fail(`${key} points to a missing file: ${value}`)
    return
  }
  for (const nested of Object.values(value)) visitExport(packageDir, key, nested)
}

for (const { path, value } of manifests) {
  if (!value.name.startsWith('@haoyu-qi/')) fail(`${path} must use the @haoyu-qi scope`)
  for (const section of ['dependencies', 'peerDependencies', 'devDependencies']) {
    for (const [name, version] of Object.entries(value[section] ?? {})) {
      if (String(version).startsWith('workspace:')) fail(`${value.name} has an unpublished ${section} range for ${name}`)
    }
  }
  for (const [key, target] of Object.entries(value.exports ?? {})) {
    visitExport(dirname(path), `${value.name} export ${key}`, target)
  }
}

const [host, client, bundle] = manifests.map(entry => entry.value)
for (const dependency of [host, client]) {
  const expected = `^${dependency.version}`
  if (bundle.dependencies?.[dependency.name] !== expected) {
    fail(`${bundle.name} must depend on ${dependency.name}@${expected}`)
  }
}

const patch = readFileSync(join(root, 'packages/bundle/zentao/cordis.patch.yml'), 'utf8')
for (const dependency of [host, client]) {
  if (!patch.includes(`name: '${dependency.name}'`)) fail(`cordis.patch.yml does not load ${dependency.name}`)
}

console.log(`Release metadata and exports verified for ${manifests.length} packages`)
