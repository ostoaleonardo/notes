import { resolveDefaultNoteFolder } from '../default-note-folder'

const ACTIVE = { id: 'root' }
const DESCENDANTS = [{ id: 'child' }, { id: 'grandchild' }]

const resolveWith = (storedId) => resolveDefaultNoteFolder({
    storedId,
    activeFolder: ACTIVE,
    descendants: DESCENDANTS
})

describe('resolve default note folder', () => {
    test('uses the stored folder when it belongs to the folder tree', () => {
        expect(resolveWith('child')).toBe('child')
    })

    test('falls back to the folder root when nothing is stored', () => {
        expect(resolveWith('')).toBe('root')
    })

    test('falls back to the folder root when the folder no longer exists', () => {
        expect(resolveWith('deleted')).toBe('root')
    })
})
