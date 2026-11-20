import { renderHook } from '@testing-library/react-native'
import { Directory, File } from 'expo-file-system'

import { useFileStorage } from '../use-file-storage'

jest.mock('expo-file-system', () => {
    const registry = new Map()

    const removeFromParents = (uri) => {
        for (const entry of registry.values()) {
            if (entry.children) entry.children = entry.children.filter((child) => child.uri !== uri)
        }
    }

    class MockFile {
        constructor(uri) {
            this.uri = uri
            this.name = uri.split('/').pop()
        }

        async text() {
            return registry.get(this.uri)?.content ?? ''
        }

        async bytes() {
            return new Uint8Array()
        }

        write(content) {
            registry.set(this.uri, { ...registry.get(this.uri), content })
        }

        open() {
            const uri = this.uri
            return {
                writeBytesSync: (bytes) => {
                    const entry = registry.get(uri)
                    registry.set(uri, { ...entry, content: new TextDecoder().decode(bytes) })
                },
                close: () => { }
            }
        }

        delete() {
            registry.delete(this.uri)
            removeFromParents(this.uri)
        }
    }

    class MockDirectory {
        constructor(uri) {
            this.uri = uri
            this.name = uri.split('/').pop()
        }

        get exists() {
            return registry.has(this.uri)
        }

        list() {
            return registry.get(this.uri)?.children ?? []
        }

        createFile(name, type) {
            const uri = `${this.uri}/${name}`
            registry.set(uri, { content: '', type })
            const file = new MockFile(uri)
            this._addChild(file)
            return file
        }

        createDirectory(name) {
            const uri = `${this.uri}/${name}`
            registry.set(uri, { children: [] })
            const directory = new MockDirectory(uri)
            this._addChild(directory)
            return directory
        }

        delete() {
            registry.delete(this.uri)
        }

        _addChild(entry) {
            const self = registry.get(this.uri) || { children: [] }
            self.children = [...(self.children || []), entry]
            registry.set(this.uri, self)
        }
    }

    return {
        File: MockFile,
        Directory: MockDirectory,
        FileMode: { Truncate: 'truncate' },
        __registry: registry
    }
})

const registry = require('expo-file-system').__registry

const seedDirectory = (uri, children) => registry.set(uri, { children })
const setFileContent = (uri, content) => registry.set(uri, { ...registry.get(uri), content })

const renderFileStorageHook = () => renderHook(() => useFileStorage())

beforeEach(() => {
    registry.clear()
})

describe('list markdown files', () => {
    test('keeps only .md files and excludes json files', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [
            new File('content://repo/note.md'),
            new File('content://repo/NOTE-UPPER.MD'),
            new File('content://repo/data.json'),
            new File('content://repo/image.png'),
            new Directory('content://repo/templates')
        ])

        const files = result.current.listMarkdownFiles('content://repo')

        expect(files.map((f) => f.name)).toEqual(['note.md', 'NOTE-UPPER.MD'])
    })
})

describe('list subdirectories', () => {
    test('excludes dotfolders and reserved folder names', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [
            new Directory('content://repo/subfolder'),
            new Directory('content://repo/.hidden'),
            new Directory('content://repo/templates'),
            new Directory('content://repo/images'),
            new File('content://repo/note.md')
        ])

        const directories = result.current.listSubdirectories('content://repo')

        expect(directories.map((d) => d.name)).toEqual(['subfolder'])
    })
})

describe('write note file', () => {
    test('replaces an existing file with the same name', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [new File('content://repo/note.md')])
        setFileContent('content://repo/note.md', 'old content')

        result.current.writeNoteFile('content://repo', 'note.md', 'new content')

        const children = registry.get('content://repo').children
        expect(children).toHaveLength(1)
        expect(registry.get('content://repo/note.md').content).toBe('new content')
    })

    test('rewrites the same file in place when the new content is shorter', async () => {
        const { result } = await renderFileStorageHook()
        const original = new File('content://repo/note.md')

        seedDirectory('content://repo', [original])
        setFileContent('content://repo/note.md', 'a much longer old content')

        const written = result.current.writeNoteFile('content://repo', 'note.md', 'short')

        expect(written.uri).toBe(original.uri)
        expect(registry.get('content://repo/note.md').content).toBe('short')
    })

    test('creates the file when it does not exist yet', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [])

        result.current.writeNoteFile('content://repo', 'note.md', 'fresh')

        expect(
            registry.get('content://repo').children.map((entry) => entry.name)
        ).toEqual(['note.md'])
        expect(registry.get('content://repo/note.md').content).toBe('fresh')
    })
})

describe('verified write', () => {
    const mockReportedSize = (sizes) => {
        const reader = jest.fn()
        sizes.forEach((size) => reader.mockReturnValueOnce(size))
        Object.defineProperty(File.prototype, 'size', { get: reader, configurable: true })
        return reader
    }

    afterEach(() => {
        delete File.prototype.size
    })

    test('writes again when the reported size does not match', async () => {
        const { result } = await renderFileStorageHook()
        const reader = mockReportedSize([0, 5])

        seedDirectory('content://repo', [])

        result.current.writeNoteFile('content://repo', 'note.md', 'fresh')

        expect(reader).toHaveBeenCalledTimes(2)
        expect(registry.get('content://repo/note.md').content).toBe('fresh')
    })

    test('throws when the size never matches', async () => {
        const { result } = await renderFileStorageHook()
        mockReportedSize([0, 0])

        seedDirectory('content://repo', [])

        expect(() => (
            result.current.writeNoteFile('content://repo', 'note.md', 'fresh')
        )).toThrow('write verification failed for note.md')
    })

    test('accepts the write when the size is unavailable', async () => {
        const { result } = await renderFileStorageHook()
        mockReportedSize([null])

        seedDirectory('content://repo', [])

        expect(() => (
            result.current.writeNoteFile('content://repo', 'note.md', 'fresh')
        )).not.toThrow()
    })
})

describe('rename note file', () => {
    test('moves the content under the new filename and deletes the old file', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [new File('content://repo/old.md')])
        setFileContent('content://repo/old.md', 'hello world')

        await result.current.renameNoteFile('content://repo', 'old.md', 'new.md')

        const children = registry.get('content://repo').children.map((entry) => entry.name)
        expect(children).toEqual(['new.md'])
        expect(await new File('content://repo/new.md').text()).toBe('hello world')
    })

    test('does nothing when the source file does not exist', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [])

        await result.current.renameNoteFile('content://repo', 'missing.md', 'new.md')

        expect(registry.get('content://repo').children).toEqual([])
    })
})

describe('move note files', () => {
    test('moves the note to the destination and removes the source', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [new File('content://repo/note.md')])
        seedDirectory('content://bin', [])
        setFileContent('content://repo/note.md', 'hello')

        const target = await result.current.moveNoteFiles(
            'content://repo',
            'note.md',
            'content://bin'
        )

        expect(target).toBe('note.md')
        expect(await new File('content://bin/note.md').text()).toBe('hello')
        expect(result.current.findFile('content://repo', 'note.md')).toBeUndefined()
    })

    test('picks a unique filename when the destination already has one', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [new File('content://repo/note.md')])
        seedDirectory('content://bin', [new File('content://bin/note.md')])
        setFileContent('content://repo/note.md', 'new')

        const target = await result.current.moveNoteFiles(
            'content://repo',
            'note.md',
            'content://bin'
        )

        expect(target).toBe('note (2).md')
        expect(await new File('content://bin/note (2).md').text()).toBe('new')
    })
})

describe('notes folder', () => {
    test('writes and reads json inside the hidden notes folder at the root', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://root', [])

        result.current.writeNotesJson('content://root', 'tags.json', ['work'])

        expect(registry.has('content://root/.notes')).toBe(true)
        expect(
            await result.current.readNotesJson('content://root', 'tags.json', null)
        ).toEqual(['work'])
    })

    test('returns the fallback without creating the folder when it does not exist', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://root', [])

        expect(
            await result.current.readNotesJson('content://root', 'tags.json', 'fallback')
        ).toBe('fallback')
        expect(registry.has('content://root/.notes')).toBe(false)
    })

    test('does not list the notes folder as a subdirectory', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://root', [])
        result.current.writeNotesJson('content://root', 'tags.json', [])

        expect(result.current.listSubdirectories('content://root')).toEqual([])
    })
})

describe('versions', () => {
    const native = jest.requireMock('repository-fs').default

    test('writes and reads the versions of a note through the native vault', async () => {
        const { result } = await renderFileStorageHook()

        await result.current.writeVersions('content://root', 'Work/note.md', [{ id: 'v1' }])
        native.versionsRead.mockResolvedValueOnce('[{"id":"v1"}]')

        expect(native.versionsWrite).toHaveBeenCalledWith(
            'content://root',
            'Work/note.md',
            '[{"id":"v1"}]'
        )
        expect(
            await result.current.readVersions('content://root', 'Work/note.md')
        ).toEqual([{ id: 'v1' }])
    })

    test('forwards the rename and delete of folder versions to the native vault', async () => {
        const { result } = await renderFileStorageHook()

        await result.current.renameVersionsUnder('content://root', 'Work', 'Job')
        await result.current.deleteVersionsUnder('content://root', 'Work')

        expect(native.versionsRenameUnder).toHaveBeenCalledWith('content://root', 'Work', 'Job')
        expect(native.versionsDeleteUnder).toHaveBeenCalledWith('content://root', 'Work')
    })
})

describe('clear repository', () => {
    test('deletes every note and its versions', async () => {
        const native = jest.requireMock('repository-fs').default
        const { result } = await renderFileStorageHook()

        seedDirectory('content://root', [])
        seedDirectory('content://root/Work', [new File('content://root/Work/a.md')])

        await result.current.clearRepository(
            'content://root/Work',
            { rootUri: 'content://root', folderPath: 'Work' }
        )

        expect(result.current.findFile('content://root/Work', 'a.md')).toBeUndefined()
        expect(native.versionsDelete).toHaveBeenCalledWith('content://root', 'Work/a.md')
    })
})

describe('readJson / writeJson', () => {
    test('round-trips a JSON payload through a sidecar file', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [])

        result.current.writeJson('content://repo', '.data.json', { a: 1 })

        const data = await result.current.readJson('content://repo', '.data.json', null)
        expect(data).toEqual({ a: 1 })
    })

    test('returns the fallback when the file does not exist', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [])

        const data = await result.current.readJson('content://repo', '.missing.json', 'fallback')
        expect(data).toBe('fallback')
    })

    test('returns the fallback when the file contains invalid JSON', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [new File('content://repo/.broken.json')])
        setFileContent('content://repo/.broken.json', 'not json')

        const data = await result.current.readJson('content://repo', '.broken.json', 'fallback')
        expect(data).toBe('fallback')
    })
})

describe('special folders', () => {
    test('creates the images folder once and reuses it afterwards', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [])

        const first = result.current.getOrCreateImagesFolder('content://repo')
        const second = result.current.getOrCreateImagesFolder('content://repo')

        expect(first.uri).toBe('content://repo/images')
        expect(second.uri).toBe(first.uri)
        expect(registry.get('content://repo').children).toHaveLength(1)
    })

    test('creates the templates folder when it is missing', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [])

        const folder = result.current.getOrCreateTemplatesFolder('content://repo')

        expect(folder.uri).toBe('content://repo/templates')
        expect(registry.has('content://repo/templates')).toBe(true)
    })
})

describe('delete directory', () => {
    test('removes the directory and reports it as missing', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo/Work', [])

        expect(result.current.directoryExists('content://repo/Work')).toBe(true)

        result.current.deleteDirectory('content://repo/Work')

        expect(result.current.directoryExists('content://repo/Work')).toBe(false)
    })
})

describe('rename directory', () => {
    const native = jest.requireMock('repository-fs').default

    test('renames through the native vault and returns the new uri', async () => {
        const { result } = await renderFileStorageHook()

        native.renameDirectory.mockResolvedValueOnce('content://repo/New/')

        const uri = await result.current.renameDirectory(
            'content://repo/Old',
            'content://repo',
            'New'
        )

        expect(uri).toBe('content://repo/New/')
        expect(native.renameDirectory).toHaveBeenCalledWith(
            'content://repo/Old',
            'content://repo',
            'New'
        )
    })

    test('propagates a failed rename', async () => {
        const { result } = await renderFileStorageHook()

        native.renameDirectory.mockRejectedValueOnce(new Error('cannot rename'))

        await expect(
            result.current.renameDirectory('content://repo/Old', 'content://repo', 'New')
        ).rejects.toThrow('cannot rename')
    })
})
