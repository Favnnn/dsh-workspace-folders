/**
 * dsh-workspace-folders, Host half (dsh v0.2.0-rc.2).
 *
 * Official-style config: the exported `Config` schema (schemastery, volatile
 * fields) IS the settings surface — the Plugins page generates its form from
 * it and writes through the profile's config editor; the settings service
 * publishes the namespace under this row's id (`workspace-folders`).
 *
 * Owns the durable folder tree for the web sidebar's Workspaces region:
 *
 * - Storage: `%DSH_HOME%\plugin-data\dsh-workspace-folders\folders.json`,
 *   written atomically (tmp + rename) after every mutation, loaded lazily on
 *   the first request. A malformed or missing file normalizes to an empty
 *   tree and can never block a harness boot.
 * - HTTP: a `/workspace-folders` prefix on the web server — `GET /tree`
 *   returns the full state, POST verbs (`/folders`, `/rename`, `/move`,
 *   `/assign`, `/delete`, `/root`) mutate it and answer the fresh state, so
 *   the client never needs a second round trip.
 *
 * Folders are pure client-side grouping: they reference workspaces by id and
 * never touch the workspace registry, session logs, or the file system.
 *
 * Fail-safe: every startup step is contained. If schemastery cannot load the
 * tree loses only the Plugins-page form; if the web server is missing the
 * tree loses only the routes. The harness boots either way.
 */

import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'

export const name = 'workspace-folders'

/**
 * The web server is a hard dependency: declaring it makes this fiber wait
 * until the service exists, so the `ctx.webServer` property read in `apply`
 * is legal (property access follows the inject declaration).
 */
export const inject = ['webServer']

/**
 * Schemastery powers the Config schema. A plugin package outside the harness
 * tree may not resolve the bare specifier, so both paths are contained and
 * fully synchronous (createRequire — no top-level await): the bare name
 * first (installed hosts), then the vendored CJS copy the installer
 * provisions into `./deps/`. Without either the tree still runs with
 * internal defaults — it only loses the Plugins-page form.
 */
const requireFromHere = createRequire(import.meta.url)
let z = undefined
try {
  z = requireFromHere('@deepseek-ai/schemastery')
} catch {
  /* fall through to the vendored copy */
}
if (z === undefined) {
  try {
    z = requireFromHere('./deps/schemastery.cjs')
  } catch (error) {
    console.error('workspace-folders: schemastery unavailable; the tree runs without the Plugins-page form.', error)
  }
}

/**
 * Tree configuration. Every field is volatile: the Plugins page edits them
 * live — the fiber is NOT reloaded on a write, so `apply` holds volatile
 * references whose `.get()` always returns the current value.
 *
 * enabled     — the whole tree (routes, sidebar integration) on/off. The
 *               Plugins page row switch gates the fiber itself; this field
 *               only parks the routes while the bundle stays loaded.
 * chatSorting — the client's chat reorder gestures (durable order through
 *               the workspace controller) on/off.
 */
export let Config = undefined
if (z !== undefined) {
  Config = z.object({
    enabled: z.boolean().default(true).volatile(),
    chatSorting: z.boolean().default(true).volatile(),
  })
}

/** Live config reference, set on every `apply` (volatile refs or plain values). */
let live = null

/**
 * Read one config value whether it arrived as a volatile reference (rc.2
 * volatile fields) or a plain value (older loaders, absent schema). Never
 * throws: a hiccup reads as the fallback.
 * @param {string} key - config field.
 * @param {boolean} fallback - default when the value is absent.
 * @returns {boolean} the current value.
 */
function readValue(key, fallback) {
  try {
    const value = live === null || live === undefined ? undefined : live[key]
    if (value !== null && typeof value === 'object' && typeof value.get === 'function') {
      const snapshot = value.get()
      return snapshot === undefined || snapshot === null ? fallback : snapshot
    }
    return value === undefined || value === null ? fallback : value
  } catch {
    return fallback
  }
}

/** Route prefix this plugin answers under the web server. */
const PREFIX = '/workspace-folders'

/** Folder-name length cap. */
const MAX_NAME = 80
/** Maximum folder nesting depth (root children are depth 1). */
const MAX_DEPTH = 8
/** POST body cap: the payloads are a few ids and a short name. */
const MAX_BODY = 65536

/** Resolve the harness home the same way the harness does. */
function dshHome() {
  const env = process.env.DSH_HOME
  if (typeof env === 'string' && env.length > 0) return env
  return join(homedir(), '.dsh')
}

const DATA_DIR = join(dshHome(), 'plugin-data', 'dsh-workspace-folders')
const DATA_FILE = join(DATA_DIR, 'folders.json')

/** Collapse any value to a plain string (or fallback). */
function asString(value, fallback) {
  return typeof value === 'string' ? value : fallback
}

/**
 * Collapse a raw folder name: strip control characters and zero-width
 * look-alikes, trim, cap the length. Returns null when nothing usable remains.
 * @param {unknown} raw - candidate name from the wire.
 * @returns {string | null} the cleaned name, or null when empty.
 */
function cleanName(raw) {
  const base = asString(raw, '')
    .replace(/[\u0000-\u001f\u007f\u200b\u200c\u200d\ufeff]/g, '')
    .trim()
  if (base.length === 0) return null
  return base.length <= MAX_NAME ? base : base.slice(0, MAX_NAME).trim()
}

/** True when the value behaves like a folder id minted by this plugin. */
function isFolderId(value) {
  return typeof value === 'string' && /^f_[0-9a-f]{12}$/.test(value)
}

/** Mint one collision-proof folder id. */
function newFolderId() {
  return 'f_' + randomBytes(6).toString('hex')
}

/** Empty tree: no folders, nothing assigned. */
function emptyState() {
  return { version: 1, folders: [], assignments: [], root: [] }
}

/**
 * Normalize one loaded/mutated state: dedupe folder ids, reindex orders,
 * re-parent orphans to the root, drop assignments to unknown folders, and
 * cut cycles. Every write path funnels through here, so the file on disk
 * always reloads into a valid tree.
 * @param {unknown} raw - untrusted candidate state.
 * @returns {{version: number, folders: Array<object>, assignments: Array<object>}} normalized state.
 */
function normalizeState(raw) {
  const state = emptyState()
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return state
  const seen = new Set()
  const byId = new Map()
  const rawFolders = Array.isArray(raw.folders) ? raw.folders : []
  for (const entry of rawFolders) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) continue
    const id = isFolderId(entry.id) ? entry.id : newFolderId()
    if (seen.has(id)) continue
    const name = cleanName(entry.name)
    if (name === null) continue
    seen.add(id)
    const folder = {
      id,
      name,
      parentId: typeof entry.parentId === 'string' ? entry.parentId : '',
      order: Number.isInteger(entry.order) && entry.order >= 0 ? entry.order : byId.size,
    }
    byId.set(id, folder)
    state.folders.push(folder)
  }
  // Re-parent orphans to the root, then cut cycles (a hand-edited file may
  // contain a loop: A inside B inside A). Every chain walk terminates.
  for (const folder of state.folders) {
    if (folder.parentId !== '' && !byId.has(folder.parentId)) folder.parentId = ''
  }
  for (const folder of state.folders) {
    const chain = new Set([folder.id])
    let current = folder
    while (current.parentId !== '') {
      const parent = byId.get(current.parentId)
      if (parent === undefined) break
      if (chain.has(parent.id)) {
        folder.parentId = ''
        break
      }
      chain.add(parent.id)
      current = parent
    }
  }
  state.folders.sort((left, right) => left.order - right.order)
  state.folders.forEach((folder, index) => { folder.order = index })

  const assigned = new Set()
  const rawAssignments = Array.isArray(raw.assignments) ? raw.assignments : []
  for (const entry of rawAssignments) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) continue
    const workspaceId = asString(entry.workspaceId, '')
    if (workspaceId === '' || assigned.has(workspaceId)) continue
    const folderId = asString(entry.folderId, '')
    if (folderId !== '' && !byId.has(folderId)) continue
    assigned.add(workspaceId)
    state.assignments.push({
      workspaceId,
      folderId,
      order: Number.isInteger(entry.order) && entry.order >= 0 ? entry.order : state.assignments.length,
    })
  }
  state.assignments.sort((left, right) => left.order - right.order)
  state.assignments.forEach((entry, index) => { entry.order = index })

  // Root interleaving order: only ids that are currently root folders or
  // unfiled workspaces survive; everything else falls back to the tail.
  const rootFolders = new Set(state.folders.filter(folder => folder.parentId === '').map(folder => folder.id))
  const unfiled = new Set(state.assignments.filter(entry => entry.folderId === '').map(entry => entry.workspaceId))
  const seenRoot = new Set()
  const rawRoot = Array.isArray(raw.root) ? raw.root : []
  for (const id of rawRoot) {
    if (typeof id !== 'string' || id === '' || seenRoot.has(id)) continue
    if (!rootFolders.has(id) && !unfiled.has(id)) continue
    seenRoot.add(id)
    state.root.push(id)
  }
  return state
}

/** In-memory cache; the file is small and this plugin is its only writer. */
let cache = null

/** Load once per process; a missing or damaged file yields the empty state. */
function loadState() {
  if (cache !== null) return cache
  try {
    if (existsSync(DATA_FILE)) {
      cache = normalizeState(JSON.parse(readFileSync(DATA_FILE, 'utf8')))
      return cache
    }
  } catch {
    // Damaged file: start from an empty tree; the next write replaces it.
  }
  cache = emptyState()
  return cache
}

/** Persist atomically; a failed write keeps the in-memory state authoritative. */
function saveState(state) {
  // Root order entries for items that left the root (filed workspaces,
  // nested folders, deleted ids) fall away on every write.
  const rootFolders = new Set(state.folders.filter(folder => folder.parentId === '').map(folder => folder.id))
  const unfiled = new Set(state.assignments.filter(entry => entry.folderId === '').map(entry => entry.workspaceId))
  state.root = state.root.filter(id => rootFolders.has(id) || unfiled.has(id))
  cache = state
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    const tmp = DATA_FILE + '.tmp'
    writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8')
    renameSync(tmp, DATA_FILE)
  } catch {
    // Read-only disk or missing directory: mutations keep working in memory
    // for this server run and are lost on restart.
  }
}

/** Reply helper: one JSON envelope, no store. */
function reply(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
  res.end(JSON.stringify(payload))
}

/** The wire shape of the tree: plain owned JSON, no internal references. */
function publicState(state) {
  return {
    version: state.version,
    folders: state.folders.map(folder => ({ id: folder.id, name: folder.name, parentId: folder.parentId, order: folder.order })),
    assignments: state.assignments.map(entry => ({ workspaceId: entry.workspaceId, folderId: entry.folderId, order: entry.order })),
    root: [...state.root],
  }
}

/**
 * Read one JSON POST body with the size cap.
 * @returns {Promise<{ok: true, value: unknown} | {ok: false, error: string}>}
 */
function readBody(req) {
  return new Promise((resolve) => {
    let size = 0
    const chunks = []
    let settled = false
    const done = (result) => {
      if (settled) return
      settled = true
      resolve(result)
    }
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        done({ ok: false, error: 'body-too-large' })
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (settled) return
      try {
        done({ ok: true, value: JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') })
      } catch {
        done({ ok: false, error: 'bad-json' })
      }
    })
    req.on('error', () => done({ ok: false, error: 'body-read-failed' }))
  })
}

/** Build the parent→children indexes for one state snapshot. */
function childrenIndex(state) {
  const foldersByParent = new Map()
  for (const folder of state.folders) {
    const list = foldersByParent.get(folder.parentId)
    if (list === undefined) foldersByParent.set(folder.parentId, [folder])
    else list.push(folder)
  }
  return { foldersByParent }
}

/** Depth of one folder in the current tree (root children are 1). */
function depthOf(state, folderId) {
  const byId = new Map(state.folders.map(folder => [folder.id, folder]))
  let depth = 1
  let current = byId.get(folderId)
  const seen = new Set()
  while (current !== undefined && current.parentId !== '' && !seen.has(current.id)) {
    seen.add(current.id)
    const parent = byId.get(current.parentId)
    if (parent === undefined) break
    depth += 1
    current = parent
  }
  return depth
}

/** True when `candidateId` sits anywhere inside the subtree of `ancestorId`. */
function insideSubtree(state, candidateId, ancestorId) {
  const byId = new Map(state.folders.map(folder => [folder.id, folder]))
  let current = byId.get(candidateId)
  const seen = new Set()
  while (current !== undefined && !seen.has(current.id)) {
    seen.add(current.id)
    if (current.id === ancestorId) return true
    current = current.parentId === '' ? undefined : byId.get(current.parentId)
  }
  return false
}

/** Deepest distance from `folderId` to one of its descendants (1 for a leaf). */
function subtreeMaxDepth(state, folderId) {
  const byParent = childrenIndex(state).foldersByParent
  const walk = (id) => {
    const children = byParent.get(id) ?? []
    if (children.length === 0) return 1
    return 1 + Math.max(...children.map(child => walk(child.id)))
  }
  return walk(folderId)
}

/** Clamp a wire index into [0, length]. */
function clampIndex(value, length) {
  if (!Number.isInteger(value) || value < 0) return length
  return Math.min(value, length)
}

/**
 * Create one folder. Parent must exist; depth cap and sibling-name conflicts
 * reject.
 * @returns {{ok: true} | {ok: false, error: string}}
 */
function opCreateFolder(state, body) {
  const name = cleanName(body.name)
  if (name === null) return { ok: false, error: 'invalid-name' }
  const parentId = asString(body.parentId, '')
  if (parentId !== '') {
    const parent = state.folders.find(folder => folder.id === parentId)
    if (parent === undefined) return { ok: false, error: 'unknown-parent' }
    if (depthOf(state, parentId) >= MAX_DEPTH) return { ok: false, error: 'too-deep' }
  }
  const siblings = state.folders.filter(folder => folder.parentId === parentId)
  if (siblings.some(folder => folder.name === name)) return { ok: false, error: 'name-conflict' }
  const folder = { id: newFolderId(), name, parentId, order: siblings.length }
  state.folders.push(folder)
  state.folders.forEach((entry, index) => { entry.order = index })
  return { ok: true }
}

/** Rename one folder; sibling-name conflicts reject like the registry does. */
function opRenameFolder(state, body) {
  const id = asString(body.id, '')
  const folder = state.folders.find(entry => entry.id === id)
  if (folder === undefined) return { ok: false, error: 'unknown-folder' }
  const name = cleanName(body.name)
  if (name === null) return { ok: false, error: 'invalid-name' }
  if (name !== folder.name
    && state.folders.some(entry => entry.parentId === folder.parentId && entry.id !== folder.id && entry.name === name)) {
    return { ok: false, error: 'name-conflict' }
  }
  folder.name = name
  return { ok: true }
}

/** Move one folder under a new parent (or the root), optionally at an index. */
function opMoveFolder(state, body) {
  const id = asString(body.id, '')
  const folder = state.folders.find(entry => entry.id === id)
  if (folder === undefined) return { ok: false, error: 'unknown-folder' }
  const parentId = asString(body.parentId, '')
  if (parentId !== '') {
    if (parentId === id || insideSubtree(state, parentId, id)) return { ok: false, error: 'cycle' }
    const parent = state.folders.find(entry => entry.id === parentId)
    if (parent === undefined) return { ok: false, error: 'unknown-parent' }
    const wouldBeDepth = depthOf(state, parentId) + 1
    if (wouldBeDepth + subtreeMaxDepth(state, id) - 1 > MAX_DEPTH) return { ok: false, error: 'too-deep' }
    if (folder.parentId !== parentId) folder.parentId = parentId
  } else if (folder.parentId !== '') {
    folder.parentId = ''
  }
  const siblings = state.folders.filter(entry => entry.parentId === parentId && entry.id !== id)
  const index = clampIndex(body.index, siblings.length)
  siblings.splice(index, 0, folder)
  state.folders = siblings.concat(state.folders.filter(entry => entry.parentId !== parentId && entry.id !== id))
  state.folders.forEach((entry, position) => { entry.order = position })
  return { ok: true }
}

/** Assign (or unfile) one workspace into a folder at an optional index. */
function opAssignWorkspace(state, body) {
  const workspaceId = asString(body.workspaceId, '')
  if (workspaceId === '') return { ok: false, error: 'invalid-workspace' }
  const folderId = asString(body.folderId, '')
  if (folderId !== '' && !state.folders.some(folder => folder.id === folderId)) {
    return { ok: false, error: 'unknown-folder' }
  }
  let entry = state.assignments.find(item => item.workspaceId === workspaceId)
  if (entry === undefined) {
    entry = { workspaceId, folderId, order: 0 }
    state.assignments.push(entry)
  } else {
    entry.folderId = folderId
  }
  const siblings = state.assignments.filter(item => item.folderId === folderId && item.workspaceId !== workspaceId)
  const index = clampIndex(body.index, siblings.length)
  siblings.splice(index, 0, entry)
  state.assignments = siblings.concat(state.assignments.filter(item => item.folderId !== folderId && item.workspaceId !== workspaceId))
  state.assignments.forEach((item, position) => { item.order = position })
  return { ok: true }
}

/** Delete one folder; its children (subfolders and workspaces) move up a level. */
function opDeleteFolder(state, body) {
  const id = asString(body.id, '')
  const folder = state.folders.find(entry => entry.id === id)
  if (folder === undefined) return { ok: false, error: 'unknown-folder' }
  const parentId = folder.parentId
  for (const entry of state.folders) {
    if (entry.parentId === id) entry.parentId = parentId
  }
  for (const entry of state.assignments) {
    if (entry.folderId === id) entry.folderId = parentId
  }
  state.folders = state.folders.filter(entry => entry.id !== id)
  state.folders.forEach((entry, index) => { entry.order = index })
  state.assignments.forEach((entry, index) => { entry.order = index })
  return { ok: true }
}

/**
 * Replace the root interleaving order (folders + unfiled workspaces in one
 * mixed sequence). Workspaces listed without an assignment entry get one
 * (unfiled) on the spot, so a never-touched workspace can be positioned.
 */
function opSetRootOrder(state, body) {
  const order = Array.isArray(body.order) ? body.order : []
  for (const id of order) {
    if (typeof id !== 'string' || isFolderId(id)) continue
    if (state.assignments.some(entry => entry.workspaceId === id)) continue
    state.assignments.push({ workspaceId: id, folderId: '', order: state.assignments.length })
  }
  const rootFolders = new Set(state.folders.filter(folder => folder.parentId === '').map(folder => folder.id))
  const unfiled = new Set(state.assignments.filter(entry => entry.folderId === '').map(entry => entry.workspaceId))
  const seen = new Set()
  const next = []
  for (const id of order) {
    if (typeof id !== 'string' || id === '' || seen.has(id)) continue
    if (!rootFolders.has(id) && !unfiled.has(id)) continue
    seen.add(id)
    next.push(id)
  }
  state.root = next
  state.assignments.forEach((entry, index) => { entry.order = index })
  return { ok: true }
}

/**
 * Answer one request under the /workspace-folders prefix.
 * @param {{ method?: string, url?: string }} req - node request.
 * @param {{ writeHead: Function, end: Function }} res - node response.
 * @returns {Promise<void>} resolved once the reply is written.
 */
async function handleRequest(req, res) {
  const raw = String(req.url || '')
  const path = raw.split('?')[0]
  const route = path.startsWith(PREFIX) ? path.slice(PREFIX.length) : path
  const state = loadState()

  if (req.method === 'GET' || req.method === 'HEAD') {
    if (route === '/tree' || route === '' || route === '/') {
      reply(res, 200, { ok: true, data: publicState(state) })
      return
    }
    reply(res, 404, { ok: false, error: 'not-found' })
    return
  }
  if (req.method !== 'POST') {
    res.writeHead(405, { 'content-type': 'application/json', allow: 'GET, POST' })
    res.end('{"ok":false,"error":"method-not-allowed"}')
    return
  }
  if (route === '/tree' || route === '' || route === '/') {
    // A POST /tree is a convenient refresh verb: answer the current state
    // without touching storage.
    reply(res, 200, { ok: true, data: publicState(state) })
    return
  }

  const parsed = await readBody(req)
  if (!parsed.ok) {
    reply(res, 400, { ok: false, error: parsed.error })
    return
  }
  const body = parsed.value
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    reply(res, 400, { ok: false, error: 'bad-json' })
    return
  }

  let outcome
  switch (route) {
    case '/folders': outcome = opCreateFolder(state, body); break
    case '/rename': outcome = opRenameFolder(state, body); break
    case '/move': outcome = opMoveFolder(state, body); break
    case '/assign': outcome = opAssignWorkspace(state, body); break
    case '/delete': outcome = opDeleteFolder(state, body); break
    case '/root': outcome = opSetRootOrder(state, body); break
    default:
      reply(res, 404, { ok: false, error: 'not-found' })
      return
  }
  if (!outcome.ok) {
    reply(res, 200, { ok: false, error: outcome.error })
    return
  }
  saveState(state)
  reply(res, 200, { ok: true, data: publicState(state) })
}

/**
 * Plugin body: keep the live config reference and mount the
 * /workspace-folders routes on the web server.
 *
 * rc.2 official-style: the exported `Config` schema is the whole settings
 * surface — the settings service publishes it (under this row's id) and the
 * Plugins page renders and writes it; a volatile write does NOT reload the
 * fiber, so the captured volatile references simply return new values.
 * `enabled: false` parks the routes (the client then stays dormant because
 * its tree request 404s).
 *
 * Fail-safe: the webServer property is legal here (declared in `inject`), and
 * the registration itself is contained — a failure costs the tree its routes
 * only; the server boots normally either way.
 * @param {object} ctx - host plugin context.
 * @param {Record<string, unknown> | undefined} config - row config; volatile
 *   fields arrive as live references, plain fields as values.
 */
export function apply(ctx, config) {
  live = config === null || config === undefined || typeof config !== 'object' ? {} : config
  try {
    if (readValue('enabled', true) === false) {
      ctx.logger?.debug?.('workspace-folders: disabled by config')
      return
    }
    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: PREFIX,
      handler: handleRequest,
    }), 'workspace-folders: tree routes')
  } catch (error) {
    // No routes: the tree stays dormant, the server lives on.
    console.error('workspace-folders: tree routes failed; the plugin starts without them.', error)
  }
}
