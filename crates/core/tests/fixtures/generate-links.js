const fs = require('fs')
const path = require('path')

const NOTES = [
    { path: 'r::Plan.md', title: 'Plan', properties: { aliases: ['Roadmap', 'Plan B'] } },
    { path: 'r::Ideas.md', title: 'Ideas' },
    { path: 'r::Año Nuevo.md', title: 'Año Nuevo', properties: { aliases: 'Solo alias' } },
    { path: 'a::Dup.md', title: 'Dup' },
    { path: 'b::Dup.md', title: 'Dup' },
    { path: 'r::Café.md', title: 'Café' },
    { path: 'r::Empty alias.md', title: 'Empty alias', properties: { aliases: ['', '  ', 5] } },
    { path: 'r::Upper.md', title: 'UPPER Case' },
    { path: 'b::Plan.md', title: 'Plan' }
]

const FOLDERS = {
    'r::Plan.md': '',
    'r::Ideas.md': '',
    'r::Año Nuevo.md': '',
    'a::Dup.md': 'Work/A',
    'b::Dup.md': 'Work/B',
    'r::Café.md': '',
    'r::Empty alias.md': '',
    'r::Upper.md': '',
    'b::Plan.md': 'Work/B'
}

const LINKS = [
    'Plan', 'plan', ' Plan ', 'Roadmap', 'roadmap', 'Plan B', 'Work/B/Plan', 'work/b/plan',
    'Other/Plan', 'Plan#Heading', '#Heading', 'Ideas#Top', 'Missing#Top', 'Missing', 'Año Nuevo',
    'AÑO NUEVO', 'Solo alias', 'Dup', 'Work/A/Dup', 'Work/B/Dup', 'Nope/Dup', 'Café', 'Café',
    'upper case', 'Empty alias', '5', '', 'a/b/c', 'Plan/', '/Plan', 'Plan#', '#', 'Ideas#A#B'
]

const SELF = 'r::Ideas.md'

const seeded = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
}

const random = seeded(42)
const pick = (items) => items[Math.floor(random() * items.length)]

const TITLE_POOL = ['Plan', 'plan', 'Roadmap', 'Dup', 'Ideas', 'Año', 'Cafe\u0301', 'Café', 'X y Z', 'a/b', 'Q#1', 'Ünï']
const FOLDER_POOL = ['', '', 'Work', 'Work/A', 'Work/B', 'Home', 'a/b']
const ANCHORS = ['', '', '#Top', '#Sec 1', '#']

const RANDOM_NOTES = Array.from({ length: 14 }, (_, index) => ({
    path: `n${index}::File ${index}.md`,
    title: pick(TITLE_POOL),
    properties: random() < 0.4 ? { aliases: [pick(TITLE_POOL), pick(TITLE_POOL)] } : undefined
}))

const RANDOM_FOLDERS = Object.fromEntries(RANDOM_NOTES.map((note) => [note.path, pick(FOLDER_POOL)]))

const randomLink = () => {
    const folder = pick(['', '', pick(FOLDER_POOL)])
    const title = pick(TITLE_POOL)
    const text = `${folder ? `${folder}/` : ''}${pick([title, title.toUpperCase(), ` ${title} `])}${pick(ANCHORS)}`

    return random() < 0.1 ? text.replace(/^[^#]*/, '') : text
}

const RANDOM_LINKS = Array.from({ length: 300 }, randomLink)

const RANDOM_RENAMES = Array.from({ length: 80 }, () => {
    const target = pick(RANDOM_NOTES)

    return {
        content: Array.from({ length: 4 }, () => `[[${randomLink()}${random() < 0.3 ? `|${pick(TITLE_POOL)}` : ''}]]`).join(' text '),
        target: target.path,
        title: pick(TITLE_POOL.concat(['Brand new', 'Dup 2']))
    }
})

const RENAMES = [
    { content: 'See [[Plan]] and [[Roadmap]] and [[Plan#Heading|label]] and [[Plan|Alias]]', target: 'r::Plan.md', title: 'Plan 2' },
    { content: 'See [[Work/B/Dup]] and [[Dup]] and [[Work/A/Dup#S]]', target: 'a::Dup.md', title: 'Dup2' },
    { content: 'See [[Work/A/Dup]] and [[work/a/dup#S|x]]', target: 'a::Dup.md', title: 'Plan' },
    { content: '[[Ideas#Top]] [[Ideas]] [[ideas|ID]]', target: 'r::Ideas.md', title: 'Plan' },
    { content: '[[Año Nuevo]] [[AÑO NUEVO#x]]', target: 'r::Año Nuevo.md', title: 'Nuevo' },
    { content: 'no links here', target: 'r::Ideas.md', title: 'X' },
    { content: '', target: 'r::Ideas.md', title: 'X' },
    { content: '[[Plan]] [[Work/B/Plan]]', target: 'b::Plan.md', title: 'Plan3' },
    { content: '[[Café]] [[Café#S]]', target: 'r::Café.md', title: 'Coffee' },
    { content: '[[Roadmap]] [[Plan B|b]]', target: 'r::Plan.md', title: 'Roadmap' }
]

const MOVED_FOLDERS = { ...FOLDERS, 'r::Ideas.md': 'Work/B' }

const load = () => {
    jest.resetModules()
    return require('@/shared/utils/wiki-links')
}

test('generates link fixtures', () => {
    const { resolveWikiLink, renameWikiLinksForNote } = load()
    const notePaths = new Map(Object.entries(FOLDERS))
    const movedPaths = new Map(Object.entries(MOVED_FOLDERS))
    const byPath = new Map(NOTES.map((note, index) => [note, index]))

    const resolutions = LINKS.map((text) => {
        const result = resolveWikiLink(text, NOTES, notePaths, SELF)

        return { text, note: result.note ? byPath.get(result.note) : null, target: result.target, anchor: result.anchor }
    })

    const renames = RENAMES.map((entry) => ({
        ...entry,
        plain: renameWikiLinksForNote(entry.content, entry.target, entry.title, NOTES, notePaths),
        moved: renameWikiLinksForNote(entry.content, entry.target, entry.title, NOTES, movedPaths, notePaths)
    }))

    const randomPaths = new Map(Object.entries(RANDOM_FOLDERS))
    const randomIndex = new Map(RANDOM_NOTES.map((note, index) => [note, index]))
    const movedRandom = { ...RANDOM_FOLDERS, [RANDOM_NOTES[0].path]: 'Moved/Here' }
    const movedRandomPaths = new Map(Object.entries(movedRandom))

    const random_resolutions = RANDOM_LINKS.map((text) => {
        const result = resolveWikiLink(text, RANDOM_NOTES, randomPaths, RANDOM_NOTES[0].path)

        return { text, note: result.note ? randomIndex.get(result.note) : null, target: result.target, anchor: result.anchor }
    })

    const random_renames = RANDOM_RENAMES.map((entry) => ({
        ...entry,
        plain: renameWikiLinksForNote(entry.content, entry.target, entry.title, RANDOM_NOTES, randomPaths),
        moved: renameWikiLinksForNote(entry.content, entry.target, entry.title, RANDOM_NOTES, movedRandomPaths, randomPaths)
    }))

    const output = {
        random: {
            notes: RANDOM_NOTES.map((note) => ({
                path: note.path,
                title: note.title,
                aliases: note.properties?.aliases ?? []
            })),
            folders: RANDOM_FOLDERS,
            movedFolders: movedRandom,
            self: RANDOM_NOTES[0].path,
            resolutions: random_resolutions,
            renames: random_renames
        },
        notes: NOTES.map((note) => ({
            path: note.path,
            title: note.title,
            aliases: (() => {
                const aliases = note.properties?.aliases
                return (Array.isArray(aliases) ? aliases : [aliases]).filter((alias) => typeof alias === 'string')
            })()
        })),
        folders: FOLDERS,
        movedFolders: MOVED_FOLDERS,
        self: SELF,
        resolutions,
        renames
    }

    fs.writeFileSync(path.join(__dirname, 'links.json'), `${JSON.stringify(output, null, '\t')}\n`)
})
