import { getRepositoryNoteCount, getRepositoryNoteCounts } from '../repository-note-counts'

describe('getRepositoryNoteCount', () => {
    test('returns the number of markdown files at the given uri', () => {
        const listMarkdownFiles = (uri) => (uri === 'repo-a' ? [{ name: 'a.md' }, { name: 'b.md' }] : [])

        expect(getRepositoryNoteCount('repo-a', listMarkdownFiles)).toBe(2)
    })
})

describe('getRepositoryNoteCounts', () => {
    test('maps each repository id to its note count', () => {
        const repositories = [
            { id: 'r1', uri: 'repo-a' },
            { id: 'r2', uri: 'repo-b' }
        ]
        const listMarkdownFiles = (uri) => (uri === 'repo-a' ? [{ name: 'a.md' }] : [])

        expect(getRepositoryNoteCounts(repositories, listMarkdownFiles)).toEqual({ r1: 1, r2: 0 })
    })

    test('returns an empty object for no repositories', () => {
        expect(getRepositoryNoteCounts([], () => [])).toEqual({})
    })
})
