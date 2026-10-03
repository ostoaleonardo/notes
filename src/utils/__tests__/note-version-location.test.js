import { buildVersionKey, getVersionLocation } from '../note-version-location'

const repositories = [
    { id: 'root', uri: 'file:///vault' },
    { id: 'sub', uri: 'file:///vault/Work', parentId: 'root', alias: 'Work' },
    { id: 'deep', uri: 'file:///vault/Work/Q1', parentId: 'sub', alias: 'Q1' }
]

describe('version key', () => {
    test('is the bare filename at the vault root', () => {
        expect(buildVersionKey('', 'note.md')).toBe('note.md')
    })

    test('prefixes the folder path inside subfolders', () => {
        expect(buildVersionKey('Work/Q1', 'note.md')).toBe('Work/Q1/note.md')
    })
})

describe('version location', () => {
    test('points a root note at its own folder', () => {
        expect(getVersionLocation(repositories, 'root')).toEqual({
            rootUri: 'file:///vault',
            folderUri: 'file:///vault',
            folderPath: ''
        })
    })

    test('resolves the vault root and relative path for nested folders', () => {
        expect(getVersionLocation(repositories, 'deep')).toEqual({
            rootUri: 'file:///vault',
            folderUri: 'file:///vault/Work/Q1',
            folderPath: 'Work/Q1'
        })
    })

    test('returns null for an unknown repository', () => {
        expect(getVersionLocation(repositories, 'missing')).toBeNull()
    })
})
