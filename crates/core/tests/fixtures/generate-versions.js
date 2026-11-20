const fs = require('fs')
const path = require('path')

jest.mock('expo-crypto', () => {
    let counter = 0
    return { randomUUID: () => `id-${counter++}` }
})

const seeded = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
}

const random = seeded(7)
const pick = (items) => items[Math.floor(random() * items.length)]
const WORDS = ['alpha', 'beta', 'gamma', 'delta', '', 'same line', '# Title', '- item', 'ñandú', 'x'.repeat(30)]

const randomText = (lines) => Array.from({ length: lines }, () => pick(WORDS)).join('\n')

const mutate = (text) => {
    const lines = text.split('\n')
    const edits = 1 + Math.floor(random() * 4)

    for (let edit = 0; edit < edits; edit++) {
        const at = Math.floor(random() * (lines.length + 1))
        const kind = random()

        if (kind < 0.4) lines.splice(at, 0, pick(WORDS))
        else if (kind < 0.7) lines.splice(at, 1)
        else lines[at] = pick(WORDS)
    }

    return lines.join('\n')
}

test('generates version fixtures', () => {
    const { buildLineDelta, applyLineDelta } = require('@/shared/utils/line-delta')
    const { commitNoteVersion } = require('@/shared/utils/note-versions')

    const deltas = []
    for (let index = 0; index < 150; index++) {
        const from = randomText(Math.floor(random() * 30))
        const to = index % 7 === 0 ? randomText(Math.floor(random() * 30)) : mutate(from)

        deltas.push({ from, to, delta: buildLineDelta(from, to) })
    }
    deltas.push({ from: '', to: '', delta: [] }, { from: 'a', to: 'a', delta: [] }, { from: '', to: 'a\nb', delta: buildLineDelta('', 'a\nb') })

    const scenarios = []
    const location = { rootUri: 'root', folderPath: '', folderUri: 'folder' }

    const run = async (startRaw, steps) => {
        let stored = startRaw
        const log = []
        let now = 1000

        for (const step of steps) {
            const fileStorage = {
                findFile: () => ({}),
                readVersions: async () => stored,
                writeVersions: (_root, _key, value) => { stored = value; step.written = value }
            }
            now += 1
            const before = JSON.parse(JSON.stringify(stored))
            jest.spyOn(Date, 'now').mockReturnValue(now)
            step.written = null
            const returned = await commitNoteVersion(fileStorage, location, 'n.md', step.title, step.content)
            log.push({ before, title: step.title, content: step.content, createdAt: now, returned, after: step.written })
        }

        return log
    }

    const sequences = []
    for (let sequence = 0; sequence < 25; sequence++) {
        let text = randomText(1 + Math.floor(random() * 20))
        const steps = []

        for (let step = 0; step < 8; step++) {
            if (random() < 0.7) text = mutate(text)
            steps.push({ title: pick(['Draft', 'Draft', 'Final', 'Other']), content: text })
        }

        sequences.push(steps)
    }

    const legacy = Array.from({ length: 4 }, (_, n) => ({ id: `legacy-${n}`, title: 'Old', createdAt: n, content: `line a\nline ${n}\nline c` }))

    const collect = async () => {
        const results = []

        for (const steps of sequences) {
            results.push(...await run([], steps))
        }

        results.push(...await run(legacy, [{ title: 'New', content: 'line a\nline 9\nline c' }, { title: 'New', content: 'line a\nline 9\nline c' }]))

        return results
    }

    return collect().then((commits) => {
        const ids = commits.filter((commit) => commit.after).map((commit) => commit.after.entries[commit.after.entries.length - 1].id)
        fs.writeFileSync(path.join(process.cwd(), 'crates/core/tests/fixtures/versions.json'), `${JSON.stringify({ deltas, commits, ids, applyChecks: deltas.map((entry) => applyLineDelta(entry.from, entry.delta) === entry.to) }, null, '\t')}\n`)
    })
})
