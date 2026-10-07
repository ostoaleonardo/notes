import { listDirectoryEntries } from '../list-directory-entries'

const mockList = jest.fn()

jest.mock('expo-file-system', () => {
    class Directory {
        constructor(uri) {
            this.uri = uri
        }

        list() {
            return mockList(this.uri)
        }
    }

    return { Directory }
})

const { Directory } = jest.requireMock('expo-file-system')

describe('list directory entries', () => {
    beforeEach(() => {
        mockList.mockReset()
        jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        console.warn.mockRestore()
    })

    test('maps entries to name, uri and directory flag', () => {
        const folder = new Directory('file:///notes/folder')
        folder.name = 'folder'
        const file = { name: 'a.md', uri: 'file:///notes/a.md' }
        mockList.mockReturnValue([folder, file])

        expect(listDirectoryEntries('file:///notes')).toEqual([
            { name: 'folder', uri: 'file:///notes/folder', isDirectory: true },
            { name: 'a.md', uri: 'file:///notes/a.md', isDirectory: false }
        ])
    })

    test('returns an empty list and logs when listing throws', () => {
        mockList.mockImplementation(() => {
            throw new Error('denied')
        })

        expect(listDirectoryEntries('file:///missing')).toEqual([])
        expect(console.warn).toHaveBeenCalled()
    })
})
