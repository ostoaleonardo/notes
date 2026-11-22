import fs from 'fs'
import path from 'path'

import { CORE_SCHEMA, dump } from 'js-yaml'

import { filterNotes } from '../search-filter'
import { buildPrefilter, compileMatchIds } from '../search-prefilter'
import { parseSearchQuery } from '../search-parser'
import { getNoteTags } from '../note-tags'
import { getSearchText } from '../search-text'
import { extractProperties, parseFrontmatter, readFrontmatterTags } from '../frontmatter'
import { MOCK_NOTE_PATHS, MOCK_SEARCH_NOTES } from '../__fixtures__/search-query'

const CORPUS = path.join(__dirname, '../../../features/syntax/__fixtures__/corpus')
const FIXTURE = path.join(__dirname, '../../../../crates/core/tests/fixtures/search.json')
const FOLDERS = ['', 'Work', 'Work/Meetings', 'Home', 'a/b']

const CURATED = [
    'HappyCat', 'happycat', 'happy cat', '"happy cat"', '"HappyCat"', 'appy', '"appy cat"',
    'agenda', 'agenda OR milk', '(agenda OR milk) week', '-agenda', '-(milk agenda)',
    '-tag:work', '-has:images', 'milk agenda', 'milk receipt', 'meetings', 'grocery',
    'file:agenda', 'file:standup', 'path:work/meetings', 'path:"home/grocery"',
    'content:milk', 'content:grocery', 'content:duration', 'tag:work', 'tag:#home',
    'tag:home/shopping', 'tag:home', 'tag:tags', 'has:images', 'has:files', 'is:pinned',
    'line:(milk eggs)', 'line:(due 2026)', '-line:(milk eggs)', 'block:(agenda call)',
    'block:(agenda week)', 'section:(agenda bob)', 'section:(call bob)', 'task:', 'task:call',
    'task-todo:call', 'task-done:call', 'task-done:(call OR bob)', 'task-todo:', 'task-done:',
    'match-case:HappyCat', 'match-case:happycat', 'ignore-case:HAPPYCAT', '/gro[cs]ery/',
    '/#\\w+/', '/\\bnote\\b/', '/caf\\w+/', '/^# /', '/\\d{4}-\\d{2}/', '/a.b/', '/[[]/',
    '/(?<!x)y/', '[status]', '[status:draft]', '[status:draft OR done]', '[status:/^dr/]',
    '[status:null]', '[aliases:null]', '[duration:>=10]', '[duration:<5]', '[duration:>3]',
    '[duration:<=4]', '-[status:draft]', '2026-03-01', '"kly stan"', '"status: draft"',
    '"a random thought about HappyC"', '"milk, eggs"', 'file:(match-case:Weekly)',
    'path:(Work OR Home)', 'line:(match-case:Milk)', '[aliases]', '[tags]', '[title:x]',
    '"wiki"', '"link"', 'wikilink', 'heading', 'callout', 'alias', 'todo', 'embed', 'code',
    'frontmatter', 'task:cancelled', 'task:star', 'line:(#tag)', 'tag:nope', '#', '-', '"',
    '[count:>2]', '[count:<=3]', '[ratio:<1]', '[whole:>=2]', '[negative:<0]', '[flag:true]',
    '[off:false]', '[nothing:null]', '[tilde:null]', '[empty:null]', '[list:one]', '[list:2]',
    '[list:true]', '[nested]', '[nested:object]', '[title:/^A/]', '[Count:3]',
    '[count:>=3 OR <1]', 'istanbul', 'İstanbul', 'straße', 'strasse', '"straße"', 'ΟΔΟΣ',
    'οδος', '😀', 'line:(two)', 'task-todo:crlf', '[n1:>15]', '[n2:>=1000]', '[n3:<13]',
    '[n4:null]', '[n5:>a]', '[n6:>5]', '[n7:>1e5]', '"ΟΔΟΣ"', 'match-case:İSTANBUL',
    '()', '(', ')', 'OR', 'a OR', 'OR a', '"unterminated', '[unterminated', 'tag:', 'has:x'
]

const VOCABULARY = [
    'note', 'tag', 'link', 'wiki', 'heading', 'list', 'task', 'code', 'alias', 'caf',
    'Weekly', 'the', 'and', 'a', 'x', 'milk', 'status', 'draft', 'embed', 'quote'
]

const OPERATORS = [
    'file:', 'path:', 'content:', 'line:', 'block:', 'section:', 'tag:', 'task:',
    'task-todo:', 'task-done:', 'match-case:', 'ignore-case:', 'has:images', 'has:files',
    'is:pinned'
]

const seeded = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
}

const randomQueries = (count) => {
    const random = seeded(7)
    const pick = (items) => items[Math.floor(random() * items.length)]

    const term = () => {
        const word = pick(VOCABULARY)
        const roll = random()

        if (roll < 0.15) return `"${word}"`
        if (roll < 0.25) return `-${word}`
        if (roll < 0.45) {
            const operator = pick(OPERATORS)
            return operator.endsWith(':') ? `${operator}${word}` : operator
        }

        return word
    }

    return Array.from({ length: count }, () => {
        const parts = Array.from({ length: 1 + Math.floor(random() * 3) }, term)
        const roll = random()

        if (roll < 0.2) return `(${parts.join(' OR ')})`
        if (roll < 0.35) return parts.join(' OR ')

        return parts.join(' ')
    })
}

const buildCorpusNotes = () => fs.readdirSync(CORPUS)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name, index) => {
        const title = name.replace(/\.md$/, '')
        const { frontmatter, body, error, rawFrontmatter } = parseFrontmatter(
            fs.readFileSync(path.join(CORPUS, name), 'utf8')
        )

        return {
            file: fs.readFileSync(path.join(CORPUS, name), 'utf8'),
            path: `corpus/${name}`,
            title,
            filename: name,
            folder: FOLDERS[index % FOLDERS.length],
            tags: readFrontmatterTags(frontmatter),
            properties: extractProperties(frontmatter),
            invalidFrontmatter: error ? rawFrontmatter : null,
            rawFrontmatter: error ? null : rawFrontmatter ?? null,
            note: body
        }
    })

const SYNTHETIC_NOTES = [
    {
        path: 'synthetic/unicode',
        title: 'Ünï İstanbul Straße ΑΣ',
        filename: 'Ünï İstanbul Straße ΑΣ.md',
        folder: '',
        tags: [],
        properties: {},
        note: 'İSTANBUL straße ΟΔΟΣ 😀 emoji\r\nline two\r\n- [ ] crlf task\r\n'
    },
    {
        path: 'synthetic/numbers',
        title: 'Numbers',
        filename: 'Numbers.md',
        folder: 'Work',
        tags: [],
        properties: { n1: '0x10', n2: '1e3', n3: ' 12 ', n4: '', n5: 'abc', n6: 'Infinity', n7: 200000 },
        note: 'numbers'
    }
]

const withFile = (note) => {
    const raw = note.rawFrontmatter ? `${note.rawFrontmatter}\n` : ''
    const present = new Set([...raw.matchAll(/^(\w+):/gm)].map((match) => match[1]))
    const missing = Object.fromEntries(
        Object.entries(note.properties || {}).filter(([key]) => !present.has(key))
    )
    const properties = Object.keys(missing).length ? dump(missing, { schema: CORE_SCHEMA }) : ''
    const tags = note.tags?.length ? dump({ tags: note.tags }, { schema: CORE_SCHEMA }) : ''
    const block = `${raw}${properties}${tags}`

    return {
        ...note,
        rawFrontmatter: block ? block.replace(/\n$/, '') : null,
        file: block ? `---\n${block}---\n\n${note.note}` : note.note
    }
}

const buildNotes = () => [
    ...[
        ...MOCK_SEARCH_NOTES.map((note) => ({ ...note, folder: MOCK_NOTE_PATHS.get(note.path) })),
        ...SYNTHETIC_NOTES
    ].map(withFile),
    ...buildCorpusNotes()
]

const toFixtureNote = (note) => ({
    file: note.file,
    path: note.path,
    title: note.title,
    filename: note.filename,
    folder: note.folder,
    tags: getNoteTags(note),
    properties: note.properties || {},
    content: getSearchText(note)
})

const buildFixture = () => {
    const notes = buildNotes()
    const pinned = notes.filter((_, index) => index % 4 === 0).map((note) => note.path)
    const notePaths = new Map(notes.map((note) => [note.path, note.folder]))
    const queries = [...CURATED, ...randomQueries(200)]
    const folders = new Set(notes.map((note) => (note.folder || '').toLowerCase()).filter(Boolean))

    return {
        notes: notes.map(toFixtureNote),
        folders: [...folders],
        pinned,
        cases: queries.flatMap((query) => [false, true].map((matchCase) => {
            const ast = parseSearchQuery(query)
            const expected = filterNotes(notes, ast, {
                pinned: new Set(pinned),
                notePaths,
                matchCase
            }).map((note) => note.path)

            const tree = buildPrefilter(ast, folders)
            const prefilter = tree ? { tree, ...compileMatchIds(tree) } : null

            return { query, matchCase, ast: JSON.parse(JSON.stringify(ast)), expected, prefilter }
        }))
    }
}

describe('search parity fixture', () => {
    test('matches the notes the javascript evaluator selects', () => {
        const fixture = buildFixture()

        if (process.env.SEARCH_FIXTURE_UPDATE === '1') {
            fs.writeFileSync(FIXTURE, `${JSON.stringify(fixture, null, 1)}\n`)
        }

        expect(JSON.parse(fs.readFileSync(FIXTURE, 'utf8'))).toEqual(
            JSON.parse(JSON.stringify(fixture))
        )
    })
})
