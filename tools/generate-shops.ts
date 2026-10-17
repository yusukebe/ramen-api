import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SHOPS_DIR = 'content/shops'
const OUTPUT = 'content/shops.json'
const LEGACY_ORDER = 'tools/legacy-shops-order.json'

const git = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf-8' }).trim()

if (git('rev-parse', '--is-shallow-repository') === 'true') {
  console.error(
    'This is a shallow clone, so the order of shops can not be determined. Fetch the full history (e.g. `fetch-depth: 0` in actions/checkout).'
  )
  process.exit(1)
}

const addedAt = (shopId: string) => {
  const path = join(SHOPS_DIR, shopId, 'info.json')
  if (!existsSync(path)) {
    return Infinity
  }
  const times = git(
    'log',
    '--no-renames',
    '--diff-filter=A',
    '--format=%ct',
    '--',
    path
  )
  const first = times.split('\n').filter(Boolean).pop()
  return first ? Number(first) : Infinity
}

const dirs = readdirSync(SHOPS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

const legacy: string[] = JSON.parse(
  readFileSync(LEGACY_ORDER, 'utf-8')
).shopIds.filter((id: string) => dirs.includes(id))

const others = dirs
  .filter((id) => !legacy.includes(id))
  .map((id) => ({ id, addedAt: addedAt(id) }))
  .sort(
    (a, b) => a.addedAt - b.addedAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  )
  .map((shop) => shop.id)

const shopIds = [...legacy, ...others]

writeFileSync(OUTPUT, JSON.stringify({ shopIds }, null, 2) + '\n')
console.log(`Generated ${OUTPUT} with ${shopIds.length} shops`)
