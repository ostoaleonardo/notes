import { buildVersionKey, getVersionLocation } from '../note-version-location'

const folders = [
    { id: 'root', uri: 'file:///repository' },
    { id: 'sub', uri: 'file:///repository/Work', parentId: 'root', alias: 'Work' },
    { id: 'deep', uri: 'file:///repository/Work/Q1', parentId: 'sub', alias: 'Q1' }
]

describe('version key', () => {
    test('is the bare filename at the repository root', () => {
        expect(buildVersionKey('', 'note.md')).toBe('note.md')
    })

    test('prefixes the folder path inside subfolders', () => {
        expect(buildVersionKey('Work/Q1', 'note.md')).toBe('Work/Q1/note.md')
    })
})

describe('version location', () => {
    test('points a root note at its own folder', () => {
        expect(getVersionLocation(folders, 'root')).toEqual({
            rootUri: 'file:///repository',
            folderUri: 'file:///repository',
            folderPath: ''
        })
    })

    test('resolves the repository root and relative path for nested folders', () => {
        expect(getVersionLocation(folders, 'deep')).toEqual({
            rootUri: 'file:///repository',
            folderUri: 'file:///repository/Work/Q1',
            folderPath: 'Work/Q1'
        })
    })

    test('returns null for an unknown repository', () => {
        expect(getVersionLocation(folders, 'missing')).toBeNull()
    })
})
