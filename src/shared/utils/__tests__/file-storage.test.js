import RepositoryFs from 'repository-fs'
import { fileStorage } from '../file-storage'
import { logError } from '../log-error'
import { getNoteLinkTexts } from '../note-links'
import { getNoteTags } from '../note-tags'
import {
    CORRUPT_FILE_SUFFIX,
    IMAGES_FOLDER_NAME,
    NOTES_FOLDER_NAME,
    RESERVED_FOLDER_NAMES,
    TEMPLATES_FOLDER_NAME,
    REPOSITORY_INDEX_FOLDER_NAME,
    REPOSITORY_INDEX_VERSION
} from '@/shared/constants/file-storage'
import { MIME_TYPES } from '@/shared/constants/mime-types'

const mockFs = new Map()
const mockState = { corruptWrites: 0, failBytes: false }

jest.mock('../log-error', () => ({
    logError: jest.fn()
}))

jest.mock('expo-file-system', () => {
    const nameOf = (uri) => uri.slice(uri.lastIndexOf('/') + 1)

    class Entry {
        constructor(...parts) {
            this.uri = parts.join('/')
        }

        get name() {
            return nameOf(this.uri)
        }

        get exists() {
            return mockFs.has(this.uri)
        }

        delete() {
            for (const key of [...mockFs.keys()]) {
                if (key === this.uri || key.startsWith(this.uri + '/')) mockFs.delete(key)
            }
        }
    }

    class File extends Entry {
        get size() {
            return mockFs.get(this.uri).bytes.length
        }

        get type() {
            return mockFs.get(this.uri).mime
        }

        async text() {
            return new TextDecoder().decode(mockFs.get(this.uri).bytes)
        }

        async bytes() {
            if (mockState.failBytes) throw new Error('read failed')
            return mockFs.get(this.uri).bytes
        }

        write(content) {
            mockFs.get(this.uri).bytes = typeof content === 'string'
                ? new TextEncoder().encode(content)
                : content
        }

        create() {
            mockFs.set(this.uri, { bytes: new Uint8Array() })
        }

        open() {
            return {
                writeBytesSync: (bytes) => {
                    const corrupt = mockState.corruptWrites > 0
                    if (corrupt) mockState.corruptWrites--
                    mockFs.get(this.uri).bytes = corrupt ? bytes.slice(1) : bytes
                },
                close: () => {}
            }
        }
    }

    class Directory extends Entry {
        create() {
            mockFs.set(this.uri, { dir: true })
        }

        list() {
            const prefix = this.uri + '/'

            return [...mockFs.keys()]
                .filter((key) => key.startsWith(prefix) && !key.slice(prefix.length).includes('/'))
                .map((key) => (
                    mockFs.get(key).dir ? new Directory(key) : new File(key)
                ))
        }

        createDirectory(name) {
            const uri = `${this.uri}/${name}`
            mockFs.set(uri, { dir: true })
            return new Directory(uri)
        }

        createFile(name, mime) {
            const uri = `${this.uri}/${name}`
            mockFs.set(uri, { bytes: new Uint8Array(), mime })
            return new File(uri)
        }
    }

    return {
        Directory,
        File,
        FileMode: { Truncate: 'truncate' },
        Paths: { document: 'documents' }
    }
})

const ROOT = 'root'
const FOLDER = `${ROOT}/work`
const NOTES = `${ROOT}/${NOTES_FOLDER_NAME}`

const seedDir = (uri) => mockFs.set(uri, { dir: true })

const seedFile = (uri, text = '', mime = MIME_TYPES.MARKDOWN) => (
    mockFs.set(uri, { bytes: new TextEncoder().encode(text), mime })
)

const readText = (uri) => new TextDecoder().decode(mockFs.get(uri).bytes)

const names = (entries) => entries.map((entry) => entry.name).sort()

beforeEach(() => {
    jest.clearAllMocks()
    mockFs.clear()
    mockState.corruptWrites = 0
    mockState.failBytes = false
    seedDir(ROOT)
    seedDir(FOLDER)
})

describe('finding entries', () => {
    test('finds a file by exact name and ignores directories', () => {
        seedFile(`${FOLDER}/a.md`)
        seedDir(`${FOLDER}/a.md.d`)

        expect(fileStorage.findFile(FOLDER, 'a.md').name).toBe('a.md')
        expect(fileStorage.findFile(FOLDER, 'a.md.d')).toBeUndefined()
        expect(fileStorage.findFile(FOLDER, 'missing.md')).toBeUndefined()
    })

    test('finds a directory by exact name and ignores files', () => {
        seedDir(`${FOLDER}/sub`)
        seedFile(`${FOLDER}/file.md`)

        expect(fileStorage.findDirectory(FOLDER, 'sub').name).toBe('sub')
        expect(fileStorage.findDirectory(FOLDER, 'file.md')).toBeUndefined()
    })

    test('returns an existing file only when it exists', () => {
        seedFile(`${FOLDER}/a.md`)

        expect(fileStorage.getExistingFile(`${FOLDER}/a.md`).name).toBe('a.md')
        expect(fileStorage.getExistingFile(`${FOLDER}/b.md`)).toBeUndefined()
    })

    test('reports whether a directory exists', () => {
        expect(fileStorage.directoryExists(FOLDER)).toBe(true)
        expect(fileStorage.directoryExists(`${ROOT}/nope`)).toBe(false)
    })

    test('lists markdown files case-insensitively and skips other entries', () => {
        seedFile(`${FOLDER}/a.md`)
        seedFile(`${FOLDER}/B.MD`)
        seedFile(`${FOLDER}/c.txt`)
        seedDir(`${FOLDER}/d.md`)

        expect(names(fileStorage.listMarkdownFiles(FOLDER))).toEqual(['B.MD', 'a.md'])
    })

    test('lists subdirectories without hidden or reserved folders', () => {
        seedDir(`${FOLDER}/visible`)
        seedDir(`${FOLDER}/.hidden`)
        seedDir(`${FOLDER}/${RESERVED_FOLDER_NAMES[0]}`)
        seedFile(`${FOLDER}/file.md`)

        expect(names(fileStorage.listSubdirectories(FOLDER))).toEqual(['visible'])
    })
})

describe('writing note files', () => {
    test('creates the file with the given mime type and content', () => {
        const file = fileStorage.writeNoteFile(FOLDER, 'new.md', 'hello')

        expect(file.name).toBe('new.md')
        expect(readText(`${FOLDER}/new.md`)).toBe('hello')
        expect(mockFs.get(`${FOLDER}/new.md`).mime).toBe(MIME_TYPES.MARKDOWN)
    })

    test('overwrites an existing file in place', () => {
        seedFile(`${FOLDER}/a.md`, 'old content that is longer')

        fileStorage.writeNoteFile(FOLDER, 'a.md', 'new')

        expect(readText(`${FOLDER}/a.md`)).toBe('new')
    })

    test('retries once when the written size does not match', () => {
        mockState.corruptWrites = 1

        fileStorage.writeNoteFile(FOLDER, 'a.md', 'hello')

        expect(readText(`${FOLDER}/a.md`)).toBe('hello')
    })

    test('throws when verification keeps failing', () => {
        mockState.corruptWrites = 2

        expect(() => fileStorage.writeNoteFile(FOLDER, 'a.md', 'hello')).toThrow(
            'write verification failed for a.md'
        )
    })
})

describe('renaming, moving and deleting notes', () => {
    test('renames a note file keeping its content', async () => {
        seedFile(`${FOLDER}/old.md`, 'body')

        await fileStorage.renameNoteFile(FOLDER, 'old.md', 'new.md')

        expect(mockFs.has(`${FOLDER}/old.md`)).toBe(false)
        expect(readText(`${FOLDER}/new.md`)).toBe('body')
    })

    test('does nothing when the file to rename is missing', async () => {
        await fileStorage.renameNoteFile(FOLDER, 'old.md', 'new.md')

        expect(mockFs.has(`${FOLDER}/new.md`)).toBe(false)
    })

    test('deletes a note file and ignores missing ones', () => {
        seedFile(`${FOLDER}/a.md`)

        fileStorage.deleteNoteFile(FOLDER, 'a.md')
        fileStorage.deleteNoteFile(FOLDER, 'a.md')

        expect(mockFs.has(`${FOLDER}/a.md`)).toBe(false)
    })

    test('moves a note natively and maps the result', async () => {
        const native = jest.requireMock('repository-fs').default

        native.moveNote.mockResolvedValueOnce({ status: 'moved', uri: 'content://x/a.md', modified: 7 })

        const moved = await fileStorage.moveNote({
            rootUri: ROOT,
            filename: 'a.md',
            from: { folderId: 'f', path: 'Folder' },
            to: { folderId: 'o', path: 'Other', uri: `${ROOT}/other` }
        })

        expect(moved).toEqual({ status: 'moved', fileUri: 'content://x/a.md', updatedAt: 7 })
        expect(native.moveNote).toHaveBeenCalledWith(
            ROOT,
            'a.md',
            'f',
            'Folder',
            'o',
            'Other',
            `${ROOT}/other`
        )
    })

    test('trashes a note natively into the repository trash folder', async () => {
        const native = jest.requireMock('repository-fs').default

        native.trashNote.mockResolvedValueOnce('a (2).md')

        const target = await fileStorage.trashNote({
            rootUri: ROOT,
            folderId: 'f',
            folderPath: 'Folder',
            filename: 'a.md'
        })

        expect(target).toBe('a (2).md')
        expect(native.trashNote).toHaveBeenCalledWith(ROOT, 'f', 'Folder', 'a.md', '.trash')
    })
})

describe('clearing a repository', () => {
    test('deletes every note and its versions but keeps other files', async () => {
        const native = jest.requireMock('repository-fs').default

        seedDir(NOTES)
        seedFile(`${FOLDER}/a.md`)
        seedFile(`${FOLDER}/b.md`)
        seedFile(`${FOLDER}/keep.txt`)

        await fileStorage.clearRepository(FOLDER, { rootUri: ROOT, folderPath: 'work' })

        expect(names(fileStorage.listMarkdownFiles(FOLDER))).toEqual([])
        expect(mockFs.has(`${FOLDER}/keep.txt`)).toBe(true)
        expect(native.versionsDelete).toHaveBeenCalledWith(ROOT, 'work/a.md')
        expect(native.versionsDelete).toHaveBeenCalledWith(ROOT, 'work/b.md')
    })
})

describe('json files', () => {
    test('returns the fallback when the file is missing', async () => {
        expect(await fileStorage.readJson(FOLDER, 'x.json', 'fallback')).toBe('fallback')
    })

    test('writes and reads json back', async () => {
        fileStorage.writeJson(FOLDER, 'x.json', { a: 1 })

        expect(await fileStorage.readJson(FOLDER, 'x.json', null)).toEqual({ a: 1 })
        expect(mockFs.get(`${FOLDER}/x.json`).mime).toBe(MIME_TYPES.JSON)
    })

    test('keeps a copy of corrupt json and returns the fallback', async () => {
        seedFile(`${FOLDER}/x.json`, '{broken', MIME_TYPES.JSON)

        const result = await fileStorage.readJson(FOLDER, 'x.json', [])

        expect(result).toEqual([])
        expect(logError).toHaveBeenCalledTimes(1)
        expect(readText(`${FOLDER}/x.json${CORRUPT_FILE_SUFFIX}`)).toBe('{broken')
    })
})

describe('notes folder json', () => {
    test('returns the fallback when the notes folder does not exist', async () => {
        expect(await fileStorage.readNotesJson(ROOT, 'x.json', 'fallback')).toBe('fallback')
    })

    test('creates the notes folder on the first write', async () => {
        fileStorage.writeNotesJson(ROOT, 'x.json', [1])

        expect(mockFs.get(NOTES).dir).toBe(true)
        expect(await fileStorage.readNotesJson(ROOT, 'x.json', null)).toEqual([1])
    })

    test('deletes a notes file and ignores a missing notes folder', () => {
        fileStorage.deleteNotesFile(ROOT, 'x.json')
        fileStorage.writeNotesJson(ROOT, 'x.json', [1])

        fileStorage.deleteNotesFile(ROOT, 'x.json')

        expect(mockFs.has(`${NOTES}/x.json`)).toBe(false)
    })
})

describe('note versions', () => {
    const native = jest.requireMock('repository-fs').default

    test('returns an empty list when a note has no versions', async () => {
        native.versionsRead.mockResolvedValueOnce(null)

        expect(await fileStorage.readVersions(ROOT, 'a.md')).toEqual([])
    })

    test('parses the stored versions of a note', async () => {
        native.versionsRead.mockResolvedValueOnce('[{"title":"v1"}]')

        expect(await fileStorage.readVersions(ROOT, 'work/a.md')).toEqual([{ title: 'v1' }])
        expect(native.versionsRead).toHaveBeenCalledWith(ROOT, 'work/a.md')
    })

    test('writes versions as json under the note key', async () => {
        await fileStorage.writeVersions(ROOT, 'work/a.md', [{ title: 'v1' }])

        expect(native.versionsWrite).toHaveBeenCalledWith(ROOT, 'work/a.md', '[{"title":"v1"}]')
    })

    test('commits a version with the version cap', async () => {
        await fileStorage.commitVersion(ROOT, 'work/a.md', 'Title', 'body')

        const [root, key, title, body, , createdAt, cap, maxAge] = native.versionsCommit.mock.calls[0]

        expect([root, key, title, body, cap, maxAge]).toEqual([ROOT, 'work/a.md', 'Title', 'body', 200, 0])
        expect(createdAt).toEqual(expect.any(Number))
    })

    test('commits a version with the limits chosen in the settings', async () => {
        await fileStorage.commitVersion(
            ROOT,
            'work/a.md',
            'Title',
            'body',
            { maxVersions: 25, maxAgeMs: 604800000 }
        )

        const [, , , , , , cap, maxAge] = native.versionsCommit.mock.calls[0]

        expect([cap, maxAge]).toEqual([25, 604800000])
    })

    test('forwards deletes and legacy migration to the native repository', async () => {
        await fileStorage.deleteVersions(ROOT, 'a.md')
        await fileStorage.migrateLegacyVersions(FOLDER, ROOT, 'work')

        expect(native.versionsDelete).toHaveBeenCalledWith(ROOT, 'a.md')
        expect(native.versionsMigrateLegacy).toHaveBeenCalledWith(ROOT, 'work')
    })
})

describe('special folders', () => {
    test.each([
        ['templates', 'getOrCreateTemplatesFolder', TEMPLATES_FOLDER_NAME],
        ['images', 'getOrCreateImagesFolder', IMAGES_FOLDER_NAME],
        ['notes', 'getOrCreateNotesFolder', NOTES_FOLDER_NAME]
    ])('creates the %s folder once and reuses it', (_label, method, folderName) => {
        const created = fileStorage[method](ROOT)
        const reused = fileStorage[method](ROOT)

        expect(created.name).toBe(folderName)
        expect(reused.uri).toBe(created.uri)
        expect(
            [...mockFs.keys()].filter((key) => key === `${ROOT}/${folderName}`)
        ).toHaveLength(1)
    })

    test('creates a subdirectory', () => {
        const created = fileStorage.createSubdirectory(ROOT, 'sub')

        expect(created.uri).toBe(`${ROOT}/sub`)
        expect(mockFs.get(`${ROOT}/sub`).dir).toBe(true)
    })
})

describe('directories', () => {
    test('deletes a directory with its content', () => {
        seedFile(`${FOLDER}/a.md`)

        fileStorage.deleteDirectory(FOLDER)

        expect(mockFs.has(FOLDER)).toBe(false)
        expect(mockFs.has(`${FOLDER}/a.md`)).toBe(false)
    })

    test('renames a folder through the native repository and returns its new uri', async () => {
        const native = jest.requireMock('repository-fs').default

        native.renameFolder.mockResolvedValueOnce({ path: 'renamed', uri: `${ROOT}/renamed/` })

        const renamed = await fileStorage.renameFolder({
            rootUri: ROOT,
            path: 'old',
            newName: 'renamed',
            folderIds: ['a', 'b'],
            parentUri: ROOT
        })

        expect(renamed).toEqual({ path: 'renamed', uri: `${ROOT}/renamed/` })
        expect(native.renameFolder).toHaveBeenCalledWith(ROOT, 'old', 'renamed', ['a', 'b'], ROOT)
    })

    test('propagates a failed folder rename', async () => {
        const native = jest.requireMock('repository-fs').default

        native.renameFolder.mockRejectedValueOnce(new Error('cannot rename'))

        await expect(
            fileStorage.renameFolder({
                rootUri: ROOT,
                path: 'old',
                newName: 'renamed',
                folderIds: [],
                parentUri: ROOT
            })
        ).rejects.toThrow('cannot rename')
    })

    test('removes a folder natively', async () => {
        const native = jest.requireMock('repository-fs').default

        await fileStorage.removeFolder({
            rootUri: ROOT,
            path: 'old',
            folderIds: ['a'],
            dropVersions: true
        })

        expect(native.removeFolder).toHaveBeenCalledWith(ROOT, 'old', ['a'], true)
    })
})

describe('copying images', () => {
    test('copies the bytes keeping the source mime type', async () => {
        seedFile('picked/photo.png', 'png-bytes', MIME_TYPES.PNG)
        seedDir(`${ROOT}/images`)

        const file = await fileStorage.copyImageFile('picked/photo.png', `${ROOT}/images`, 'p.png')

        expect(file.uri).toBe(`${ROOT}/images/p.png`)
        expect(readText(`${ROOT}/images/p.png`)).toBe('png-bytes')
        expect(mockFs.get(`${ROOT}/images/p.png`).mime).toBe(MIME_TYPES.PNG)
    })

    test('falls back to jpeg when the source has no mime type', async () => {
        seedFile('picked/photo', 'bytes', null)
        seedDir(`${ROOT}/images`)

        await fileStorage.copyImageFile('picked/photo', `${ROOT}/images`, 'p.jpg')

        expect(mockFs.get(`${ROOT}/images/p.jpg`).mime).toBe(MIME_TYPES.JPEG)
    })
})

describe('looking up entries by name', () => {
    test('finds a file without listing the folder', () => {
        const listDirectory = jest.spyOn(RepositoryFs, 'listDirectorySync')
        seedFile(`${FOLDER}/a.md`)

        expect(fileStorage.findFile(FOLDER, 'a.md').name).toBe('a.md')
        expect(listDirectory).not.toHaveBeenCalled()
    })

    test('reports whether a note file exists, ignoring folders and missing names', () => {
        seedFile(`${FOLDER}/a.md`)
        seedDir(`${FOLDER}/sub`)

        expect(fileStorage.fileExists(FOLDER, 'a.md')).toBe(true)
        expect(fileStorage.fileExists(FOLDER, 'sub')).toBe(false)
        expect(fileStorage.fileExists(FOLDER, 'missing.md')).toBe(false)
    })
})

describe('scanning a folder', () => {
    test('lists markdown files and note folders without blocking', async () => {
        seedFile(`${FOLDER}/a.md`)
        seedFile(`${FOLDER}/data.json`)
        seedDir(`${FOLDER}/sub`)
        seedDir(`${FOLDER}/.hidden`)
        seedDir(`${FOLDER}/${IMAGES_FOLDER_NAME}`)

        expect(names(await fileStorage.scanMarkdownFiles(FOLDER))).toEqual(['a.md'])
        expect(names(await fileStorage.scanSubdirectories(FOLDER))).toEqual(['sub'])
    })

    test('shares one listing between scans of the same folder that overlap', async () => {
        const listDirectory = jest.spyOn(RepositoryFs, 'listDirectory')
        seedFile(`${FOLDER}/a.md`)

        await Promise.all([
            fileStorage.scanMarkdownFiles(FOLDER),
            fileStorage.scanSubdirectories(FOLDER)
        ])
        await fileStorage.scanMarkdownFiles(FOLDER)

        expect(listDirectory).toHaveBeenCalledTimes(2)
    })

    test('lists the files that are not notes through the whole tree', async () => {
        seedFile(`${FOLDER}/a.md`)
        seedFile(`${FOLDER}/pic.png`)
        seedDir(`${FOLDER}/files`)
        seedFile(`${FOLDER}/files/doc.pdf`)
        seedDir(`${FOLDER}/.trash`)
        seedFile(`${FOLDER}/.trash/gone.png`)

        const found = await fileStorage.scanAttachments(FOLDER)

        expect(found).toEqual([
            { filename: 'pic.png', uri: `${FOLDER}/pic.png`, folder: '' },
            { filename: 'doc.pdf', uri: `${FOLDER}/files/doc.pdf`, folder: 'files' }
        ])
    })

    test('reads several files at once', async () => {
        seedFile(`${FOLDER}/a.md`, 'first')
        seedFile(`${FOLDER}/b.md`, 'second')

        const contents = await fileStorage.readTextFiles([`${FOLDER}/a.md`, `${FOLDER}/b.md`])

        expect(contents).toEqual(['first', 'second'])
    })
})

describe('repository index', () => {
    const INDEX = `documents/${REPOSITORY_INDEX_FOLDER_NAME}/repo.json`
    const notes = [{ path: 'repo::a.md', note: 'body' }]

    test('returns no notes when the folder was never indexed', async () => {
        expect(await fileStorage.readRepositoryIndex('repo')).toEqual([])
    })

    test('reads back the notes it stored', async () => {
        fileStorage.writeRepositoryIndex('repo', notes)

        expect(await fileStorage.readRepositoryIndex('repo')).toEqual(notes)
    })

    test('stores the computed tags and restores them without rescanning the body', async () => {
        const note = { path: 'repo::a.md', note: 'body #inline', tags: ['front'] }

        fileStorage.writeRepositoryIndex('repo', [note])
        expect(JSON.parse(readText(INDEX)).tags).toEqual([['front', 'inline']])
        expect(JSON.parse(readText(INDEX)).links).toEqual([[]])

        seedFile(INDEX, JSON.stringify({
            version: REPOSITORY_INDEX_VERSION,
            notes: [note],
            tags: [['seeded']]
        }))
        const [restored] = await fileStorage.readRepositoryIndex('repo')

        expect(getNoteTags(restored)).toEqual(['seeded'])
        expect(restored).toEqual(note)
    })

    test('restores the link texts without rescanning the body', async () => {
        const note = { path: 'repo::a.md', note: 'body [[Real]]' }

        seedFile(INDEX, JSON.stringify({
            version: REPOSITORY_INDEX_VERSION,
            notes: [note],
            tags: [[]],
            links: [['Seeded']]
        }))
        const [restored] = await fileStorage.readRepositoryIndex('repo')

        expect(getNoteLinkTexts(restored)).toEqual(['Seeded'])
    })

    test('ignores an index written by another version', async () => {
        seedFile(INDEX, JSON.stringify({ version: REPOSITORY_INDEX_VERSION + 1, notes }))

        expect(await fileStorage.readRepositoryIndex('repo')).toEqual([])
    })

    test('ignores a corrupt index and logs it', async () => {
        seedFile(INDEX, '{broken')

        expect(await fileStorage.readRepositoryIndex('repo')).toEqual([])
        expect(logError).toHaveBeenCalled()
    })

    test('deletes the index of a repository', async () => {
        fileStorage.writeRepositoryIndex('repo', notes)

        fileStorage.deleteFolderIndex('repo')

        expect(mockFs.has(INDEX)).toBe(false)
    })
})
