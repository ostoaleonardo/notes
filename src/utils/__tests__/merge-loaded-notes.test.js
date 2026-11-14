import { mergeLoadedNotes } from '../merge-loaded-notes'

const note = (path, body = '') => ({ path, note: body })

describe('merge loaded notes', () => {
    test('takes the loaded notes as they are when nothing changed meanwhile', () => {
        const snapshot = [note('a')]
        const loaded = [note('a', 'disk')]

        expect(mergeLoadedNotes(loaded, snapshot, snapshot)).toBe(loaded)
    })

    test('keeps a note edited while loading over its loaded version', () => {
        const snapshot = [note('a')]
        const edited = note('a', 'edited')

        expect(mergeLoadedNotes([note('a', 'disk')], snapshot, [edited])).toEqual([edited])
    })

    test('keeps a note created while loading', () => {
        const snapshot = [note('a')]
        const created = note('b')
        const loaded = [note('a', 'disk')]

        expect(mergeLoadedNotes(loaded, snapshot, [created, ...snapshot])).toEqual([created, loaded[0]])
    })

    test('drops a note deleted while loading', () => {
        const snapshot = [note('a'), note('b')]
        const loaded = [note('a', 'disk'), note('b', 'disk')]

        expect(mergeLoadedNotes(loaded, snapshot, [snapshot[1]])).toEqual([loaded[1]])
    })

    test('adds notes that only exist on disk', () => {
        const snapshot = [note('a')]
        const loaded = [snapshot[0], note('c', 'disk')]

        expect(mergeLoadedNotes(loaded, snapshot, [note('a', 'edited')])).toEqual([
            note('a', 'edited'),
            loaded[1]
        ])
    })
})
