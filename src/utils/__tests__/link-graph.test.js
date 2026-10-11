import { buildLinkGraph, findOrphanNotes, listUnresolvedLinks } from '../link-graph'

const note = (path, title, body = '') => ({ path, title, note: body })

const NOTES = [
    note('a', 'Alpha', 'See [[Beta]] and [[Ghost]]'),
    note('b', 'Beta', 'Back to [[alpha]]'),
    note('c', 'Gamma', 'Nobody links here'),
    note('d', 'Delta', 'Mentions [[Alpha]]'),
    note('e', 'Epsilon', 'Links to [[Ghost]] and [[Phantom|alias]] and [[photo.png]]')
]

describe('build link graph', () => {
    const graph = buildLinkGraph(NOTES, new Map())

    test('records which notes have resolved outgoing links', () => {
        expect([...graph.outgoing].sort()).toEqual(['a', 'b', 'd'])
    })

    test('records which notes receive links', () => {
        expect([...graph.incoming].sort()).toEqual(['a', 'b'])
    })

    test('collects unresolved links with the notes that use them', () => {
        expect(graph.unresolved.get('missing:ghost').sources).toEqual(new Set(['a', 'e']))
        expect(graph.unresolved.get('missing:phantom').sources).toEqual(new Set(['e']))
    })

    test('ignores links to files and links inside code', () => {
        const withCode = buildLinkGraph([
            note('x', 'X', '`[[Hidden]]` and [[photo.png]]')
        ], new Map())

        expect(withCode.unresolved.size).toBe(0)
    })
})

describe('find orphan notes', () => {
    test('returns notes without incoming or outgoing links sorted by title', () => {
        const graph = buildLinkGraph(NOTES, new Map())

        expect(findOrphanNotes(NOTES, graph).map((n) => n.path)).toEqual(['e', 'c'])
    })

    test('returns nothing when every note is connected', () => {
        const connected = [note('a', 'A', '[[B]]'), note('b', 'B', '')]

        expect(findOrphanNotes(connected, buildLinkGraph(connected, new Map()))).toEqual([])
    })
})

describe('list unresolved links', () => {
    test('counts notes per link and sorts by title', () => {
        const graph = buildLinkGraph(NOTES, new Map())

        expect(listUnresolvedLinks(graph)).toEqual([
            { id: 'missing:ghost', title: 'Ghost', count: 2 },
            { id: 'missing:phantom', title: 'Phantom', count: 1 }
        ])
    })

    test('counts a note once even when it repeats the link', () => {
        const repeated = [note('a', 'A', '[[Ghost]] again [[Ghost]]')]

        expect(listUnresolvedLinks(buildLinkGraph(repeated, new Map()))[0].count).toBe(1)
    })
})
