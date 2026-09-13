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

    return { File: MockFile, Directory: MockDirectory, __registry: registry }
})

const registry = require('expo-file-system').__registry

const seedDirectory = (uri, children) => registry.set(uri, { children })
const setFileContent = (uri, content) => registry.set(uri, { ...registry.get(uri), content })

const renderFileStorageHook = () => renderHook(() => useFileStorage())

beforeEach(() => {
    registry.clear()
})

describe('listMarkdownFiles', () => {
    test('keeps only .md files and excludes sidecar json files', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [
            new File('content://repo/note.md'),
            new File('content://repo/NOTE-UPPER.MD'),
            new File('content://repo/.notes-meta.json'),
            new File('content://repo/.tags.json'),
            new File('content://repo/image.png'),
            new Directory('content://repo/templates')
        ])

        const files = result.current.listMarkdownFiles('content://repo')

        expect(files.map((f) => f.name)).toEqual(['note.md', 'NOTE-UPPER.MD'])
    })
})

describe('listSubdirectories', () => {
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

describe('writeNoteFile', () => {
    test('replaces an existing file with the same name', async () => {
        const { result } = await renderFileStorageHook()

        seedDirectory('content://repo', [new File('content://repo/note.md')])
        setFileContent('content://repo/note.md', 'old content')

        result.current.writeNoteFile('content://repo', 'note.md', 'new content')

        const children = registry.get('content://repo').children
        expect(children).toHaveLength(1)
        expect(registry.get('content://repo/note.md').content).toBe('new content')
    })
})

describe('renameNoteFile', () => {
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
