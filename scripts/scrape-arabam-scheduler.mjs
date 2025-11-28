import { spawn } from 'node:child_process'
import path from 'node:path'

const INTERVAL_MIN = Number(process.env.ARABAM_INTERVAL_MIN || 180)
const cwd = process.cwd()

function run(cmd, args, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' })
    child.on('close', (code) => resolve(code))
  })
}

async function cycle() {
  await run('node', [path.join('scripts', 'scrape-arabam-browser.mjs')])
  await run('node', [path.join('scripts', 'import-arabam.mjs')], { ARABAM_INPUT: path.join('import', 'arabam-scraped.csv') })
}

async function main() {
  await cycle()
  setInterval(cycle, INTERVAL_MIN * 60 * 1000)
}

main().catch((e)=> { console.error(e); process.exit(1) })