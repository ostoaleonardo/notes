import { loadCorpus } from '../__fixtures__/corpus'
import { describeNote } from '../__fixtures__/describe-note'
import { extractNoteStructure } from '../extract-structure'

const corpus = loadCorpus()
const byName = Object.fromEntries(corpus.map(({ name, text }) => [name, text]))

const legacyShape = (text) => {
    const structure = extractNoteStructure(text)

    return {
        links: structure.links.map(({ target }) => target),
        tags: structure.tags.map(({ name, from, to }) => ({ name, from, to })),
        headings: structure.headings,
        customTasks: structure.customTasks.map(({ from, to, status }) => ({ from, to, status }))
    }
}

const pick = (note, key) => note[key]

const CHANGED_LINKS = {
    'html-blocks': ['Inside Inline Html', 'In Highlight'],
    math: ['Link After Money', 'Link'],
    'tabs-and-indentation': ['Space Link'],
    'wikilinks-code-indented': ['Visible One', 'Visible Two'],
    'wikilinks-code-inline': ['Visible One', 'Visible Two', 'Visible Three', 'Visible Four'],
    'wikilinks-escaped-and-broken': ['Never closed and a later [[Closed', 'Name ', '[Three'],
    'wikilinks-table': ['Target', 'Plain']
}

describe('structure extraction parity', () => {
    const unchanged = corpus.map(({ name }) => name).filter((name) => !CHANGED_LINKS[name])

    test.each(unchanged)('%s keeps the recorded links', (name) => {
        expect(pick(legacyShape(byName[name]), 'links')).toEqual(describeNote(byName[name]).links)
    })

    test.each(Object.keys(CHANGED_LINKS))('%s changes links on purpose', (name) => {
        expect(pick(legacyShape(byName[name]), 'links')).toEqual(CHANGED_LINKS[name])
    })

    test.each(corpus.map(({ name }) => name))('%s keeps the recorded custom tasks', (name) => {
        const expected = describeNote(byName[name]).customTasks
        const received = legacyShape(byName[name]).customTasks

        if (name === 'tasks-custom') expect(received).toHaveLength(expected.length - 1)
        else expect(received).toEqual(expected)
    })

    test.each(corpus.map(({ name }) => name).filter((name) => name !== 'html-blocks'))(
        '%s keeps the recorded tags',
        (name) => {
            expect(legacyShape(byName[name]).tags).toEqual(describeNote(byName[name]).tags)
        }
    )

    test('html blocks no longer yield tags', () => {
        expect(legacyShape(byName['html-blocks']).tags).toEqual([])
    })

    test.each(corpus.map(({ name }) => name).filter((name) => name !== 'headings-code-and-quotes'))(
        '%s keeps the recorded headings',
        (name) => {
            expect(legacyShape(byName[name]).headings).toEqual(describeNote(byName[name]).headings)
        }
    )

    test('headings inside quotes and list items are now found', () => {
        const levels = legacyShape(byName['headings-code-and-quotes']).headings.map(({ text }) => text)

        expect(levels).toEqual([
            'Real',
            'Quoted heading',
            'List heading',
            'Indented code heading',
            'Heading right after paragraph'
        ])
    })
})

describe('structure extraction details', () => {
    test('links record range, embed flag and unescaped table targets', () => {
        const { links } = extractNoteStructure('a ![[pic.png]] b [[T\\|x]]')

        expect(links).toEqual([
            { target: 'pic.png', from: 2, to: 14, isEmbed: true },
            { target: 'T', from: 17, to: 25, isEmbed: false }
        ])
    })

    test('tags inside frontmatter are skipped', () => {
        const { tags } = extractNoteStructure('---\na: b #x\n---\n#body')

        expect(tags.map(({ name }) => name)).toEqual(['body'])
    })

    test('markdown style wiki links are listed apart', () => {
        const { markdownLinks, links } = extractNoteStructure('[Shown](wikilink://folder/T) [web](https://a.com)')

        expect(links).toEqual([])
        expect(markdownLinks).toEqual([{ target: 'folder/T', from: 0, to: 28 }])
    })

    test('heading text drops closing hashes', () => {
        const { headings } = extractNoteStructure('## Title ##\n')

        expect(headings).toEqual([{ level: 2, text: 'Title', from: 0 }])
    })
})
