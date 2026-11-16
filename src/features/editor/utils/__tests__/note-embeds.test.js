import { loadEmbedNotes } from '../note-embeds'

const notes = [
    { path: 'a.md', title: 'Alpha', note: '# Intro\ntext\n\n## Part\nbody ^blk' },
    { path: 'self.md', title: 'Self', note: 'me' }
]

const context = { notes, notePaths: new Map(), selfPath: 'self.md' }

describe('load embed notes', () => {
    test('returns the whole text for a plain target', () => {
        const result = loadEmbedNotes(['Alpha'], context)

        expect(result.Alpha).toEqual({
            path: 'a.md',
            title: 'Alpha',
            anchor: '',
            text: notes[0].note
        })
    })

    test('returns only the requested section for a heading anchor', () => {
        const result = loadEmbedNotes(['Alpha#Part'], context)

        expect(result['Alpha#Part'].text).toContain('body')
        expect(result['Alpha#Part'].text).not.toContain('text')
    })

    test('answers null for missing notes and missing anchors', () => {
        const result = loadEmbedNotes(['Nope', 'Alpha#Missing'], context)

        expect(result).toEqual({ Nope: null, 'Alpha#Missing': null })
    })

    test('answers null for the note that is being read', () => {
        expect(loadEmbedNotes(['Self'], context)).toEqual({ Self: null })
    })
})
