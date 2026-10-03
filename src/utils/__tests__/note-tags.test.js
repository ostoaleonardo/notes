import { collectTags, getNoteTags } from '../note-tags'

describe('note tags', () => {
    test('joins frontmatter and inline tags without duplicates', () => {
        const note = { tags: ['Work'], note: 'text #work #home' }

        expect(getNoteTags(note)).toEqual(['Work', 'home'])
    })

    test('handles notes without tags or body', () => {
        expect(getNoteTags({})).toEqual([])
    })

    test('includes the parents of nested tags', () => {
        const notes = [{ tags: ['work/projects/a'], note: '#home/chores' }]

        expect(collectTags(notes)).toEqual([
            'home',
            'home/chores',
            'work',
            'work/projects',
            'work/projects/a'
        ])
    })

    test('collects the sorted unique tags of every note', () => {
        const notes = [
            { tags: ['work'], note: '#ideas' },
            { tags: ['Work', 'home'], note: '' }
        ]

        expect(collectTags(notes)).toEqual(['home', 'ideas', 'work'])
    })
})
