import { getListBackspaceEdit, getListEnterEdit } from '../list-edit'

describe('list enter edit', () => {
    test('continues a bullet at the end of the line', () => {
        expect(getListEnterEdit('- a', 3)).toEqual({ from: 3, to: 3, insert: '\n- ', cursor: 6 })
    })

    test('continues a checklist with an unchecked box', () => {
        expect(getListEnterEdit('- [x] done', 10)).toEqual({
            from: 10,
            to: 10,
            insert: '\n- [ ] ',
            cursor: 17
        })
    })

    test('increments ordered markers', () => {
        expect(getListEnterEdit('2. a', 4).insert).toBe('\n3. ')
    })

    test('keeps the indent of nested items', () => {
        expect(getListEnterEdit('    - a', 7).insert).toBe('\n    - ')
    })

    test('splits the line when the cursor is in the middle', () => {
        expect(getListEnterEdit('- ab', 3)).toEqual({ from: 3, to: 3, insert: '\n- ', cursor: 6 })
    })

    test('ignores the cursor inside the marker', () => {
        expect(getListEnterEdit('- a', 1)).toBeNull()
    })

    test('removes the marker of an empty top-level item', () => {
        expect(getListEnterEdit('- ', 2)).toEqual({ from: 0, to: 2, insert: '', cursor: 0 })
        expect(getListEnterEdit('- [ ] ', 6).insert).toBe('')
    })

    test('outdents an empty nested item one level', () => {
        expect(getListEnterEdit('        - ', 10)).toEqual({
            from: 0,
            to: 10,
            insert: '    - ',
            cursor: 6
        })
        expect(getListEnterEdit('  - ', 4).insert).toBe('- ')
    })

    test('returns null outside lists', () => {
        expect(getListEnterEdit('plain', 5)).toBeNull()
    })
})

describe('list backspace edit', () => {
    test('removes the marker when the cursor is right after it', () => {
        expect(getListBackspaceEdit('- a', 2)).toEqual({ from: 0, to: 2, insert: '', cursor: 0 })
        expect(getListBackspaceEdit('  - [ ] a', 8)).toEqual(
            { from: 2, to: 8, insert: '', cursor: 2 }
        )
    })

    test('does nothing elsewhere', () => {
        expect(getListBackspaceEdit('- a', 3)).toBeNull()
        expect(getListBackspaceEdit('plain', 0)).toBeNull()
    })
})
