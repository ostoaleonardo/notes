import { fileStorage } from '../file-storage'
import { logError } from '../log-error'
import {
    CORRUPT_FILE_SUFFIX,
    IMAGES_FOLDER_NAME,
    NOTES_FOLDER_NAME,
    RESERVED_FOLDER_NAMES,
    TEMPLATES_FOLDER_NAME,
    VAULT_TRASH_FOLDER_NAME,
    VERSIONS_FILENAME_SUFFIX
} from '@/constants/file-storage'
import { MIME_TYPES } from '@/constants/mime-types'

const mockFs = new Map()
const mockState = { corruptWrites: 0, failBytes: false }

jest.mock('../log-error', () => ({
    logError: jest.fn()
}))

jest.mock('expo-file-system', () => {
    const nameOf = (uri) => uri.slice(uri.lastIndexOf('/') + 1)

    class Entry {
        constructor(uri) {
            this.uri = uri
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

        write(bytes) {
            mockFs.get(this.uri).bytes = bytes
        }

        open() {
            return {
                writeBytes: (bytes) => {
                    const corrupt = mockState.corruptWrites > 0
                    if (corrupt) mockState.corruptWrites--
                    mockFs.get(this.uri).bytes = corrupt ? bytes.slice(1) : bytes
                },
                close: () => {}
            }
        }
    }

    class Directory extends Entry {
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

    return { Directory, File, FileMode: { Truncate: 'truncate' } }
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

    test('moves a note to another folder', async () => {
        const destination = `${ROOT}/other`
        seedDir(destination)
        seedFile(`${FOLDER}/a.md`, 'body')

        const target = await fileStorage.moveNoteFiles(FOLDER, 'a.md', destination)

        expect(target).toBe('a.md')
        expect(mockFs.has(`${FOLDER}/a.md`)).toBe(false)
        expect(readText(`${destination}/a.md`)).toBe('body')
    })

    test('moves a note under a unique name when the destination has the same one', async () => {
        const destination = `${ROOT}/other`
        seedDir(destination)
        seedFile(`${FOLDER}/a.md`, 'incoming')
        seedFile(`${destination}/a.md`, 'existing')

        const target = await fileStorage.moveNoteFiles(FOLDER, 'a.md', destination)

        expect(target).toBe('a (2).md')
        expect(readText(`${destination}/a.md`)).toBe('existing')
        expect(readText(`${destination}/a (2).md`)).toBe('incoming')
    })
})

describe('clearing a repository', () => {
    test('deletes every note and its versions but keeps other files', () => {
        seedDir(NOTES)
        seedFile(`${FOLDER}/a.md`)
        seedFile(`${FOLDER}/b.md`)
        seedFile(`${FOLDER}/keep.txt`)
        seedFile(`${NOTES}/${encodeURIComponent('work/a.md')}${VERSIONS_FILENAME_SUFFIX}`, '[]')

        fileStorage.clearRepository(FOLDER, { rootUri: ROOT, folderPath: 'work' })

        expect(names(fileStorage.listMarkdownFiles(FOLDER))).toEqual([])
        expect(mockFs.has(`${FOLDER}/keep.txt`)).toBe(true)
        expect(fileStorage.listMarkdownFiles(NOTES)).toEqual([])
        expect(names(fileStorage.listSubdirectories(ROOT))).toEqual(['work'])
        expect(mockFs.size).toBe(4)
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
    const versionsFile = (key) => `${NOTES}/${encodeURIComponent(key)}${VERSIONS_FILENAME_SUFFIX}`

    test('returns an empty list when a note has no versions', async () => {
        expect(await fileStorage.readVersions(ROOT, 'a.md')).toEqual([])
    })

    test('stores versions under an encoded key', async () => {
        fileStorage.writeVersions(ROOT, 'work/a.md', [{ title: 'v1' }])

        expect(mockFs.has(versionsFile('work/a.md'))).toBe(true)
        expect(await fileStorage.readVersions(ROOT, 'work/a.md')).toEqual([{ title: 'v1' }])
    })

    test('deletes the versions of a note', () => {
        fileStorage.writeVersions(ROOT, 'a.md', [1])

        fileStorage.deleteVersions(ROOT, 'a.md')

        expect(mockFs.has(versionsFile('a.md'))).toBe(false)
    })

    test('moves versions to a new key', async () => {
        fileStorage.writeVersions(ROOT, 'old.md', [{ title: 'v1' }])

        await fileStorage.renameVersions(ROOT, 'old.md', 'new.md')

        expect(mockFs.has(versionsFile('old.md'))).toBe(false)
        expect(await fileStorage.readVersions(ROOT, 'new.md')).toEqual([{ title: 'v1' }])
    })

    test('moves versions stored as an object with entries', async () => {
        fileStorage.writeVersions(ROOT, 'old.md', { entries: [{ title: 'v1' }] })

        await fileStorage.renameVersions(ROOT, 'old.md', 'new.md')

        expect(await fileStorage.readVersions(ROOT, 'new.md')).toEqual({
            entries: [{ title: 'v1' }]
        })
    })

    test('skips renaming when there are no versions', async () => {
        fileStorage.writeVersions(ROOT, 'old.md', [])

        await fileStorage.renameVersions(ROOT, 'old.md', 'new.md')

        expect(mockFs.has(versionsFile('old.md'))).toBe(true)
        expect(mockFs.has(versionsFile('new.md'))).toBe(false)
    })

    test('renames every version under a folder prefix', async () => {
        fileStorage.writeVersions(ROOT, 'old/a.md', [1])
        fileStorage.writeVersions(ROOT, 'old/sub/b.md', [2])
        fileStorage.writeVersions(ROOT, 'other/c.md', [3])

        await fileStorage.renameVersionsUnder(ROOT, 'old', 'new')

        expect(await fileStorage.readVersions(ROOT, 'new/a.md')).toEqual([1])
        expect(await fileStorage.readVersions(ROOT, 'new/sub/b.md')).toEqual([2])
        expect(await fileStorage.readVersions(ROOT, 'other/c.md')).toEqual([3])
        expect(mockFs.has(versionsFile('old/a.md'))).toBe(false)
    })

    test('deletes every version under a folder prefix', () => {
        fileStorage.writeVersions(ROOT, 'old/a.md', [1])
        fileStorage.writeVersions(ROOT, 'old/sub/b.md', [2])
        fileStorage.writeVersions(ROOT, 'other/c.md', [3])

        fileStorage.deleteVersionsUnder(ROOT, 'old')

        expect(mockFs.has(versionsFile('old/a.md'))).toBe(false)
        expect(mockFs.has(versionsFile('old/sub/b.md'))).toBe(false)
        expect(mockFs.has(versionsFile('other/c.md'))).toBe(true)
    })

    test('ignores prefixes when there is no notes folder', async () => {
        await fileStorage.renameVersionsUnder(ROOT, 'old', 'new')
        fileStorage.deleteVersionsUnder(ROOT, 'old')

        expect(mockFs.has(NOTES)).toBe(false)
    })

    test('migrates legacy versions next to the note into the notes folder', async () => {
        seedFile(`${FOLDER}/a.md${VERSIONS_FILENAME_SUFFIX}`, '[{"title":"v1"}]')
        seedFile(`${FOLDER}/b.md${VERSIONS_FILENAME_SUFFIX}`, '{broken')

        await fileStorage.migrateLegacyVersions(FOLDER, ROOT, 'work')

        expect(await fileStorage.readVersions(ROOT, 'work/a.md')).toEqual([{ title: 'v1' }])
        expect(await fileStorage.readVersions(ROOT, 'work/b.md')).toEqual([])
        expect(mockFs.has(`${FOLDER}/a.md${VERSIONS_FILENAME_SUFFIX}`)).toBe(false)
        expect(mockFs.has(`${FOLDER}/b.md${VERSIONS_FILENAME_SUFFIX}`)).toBe(false)
    })
})

describe('special folders', () => {
    test.each([
        ['templates', 'getOrCreateTemplatesFolder', TEMPLATES_FOLDER_NAME],
        ['images', 'getOrCreateImagesFolder', IMAGES_FOLDER_NAME],
        ['vault trash', 'getOrCreateVaultTrashFolder', VAULT_TRASH_FOLDER_NAME],
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

    test('renames a directory copying nested content and removing the old one', async () => {
        seedFile(`${FOLDER}/a.md`, 'a', MIME_TYPES.MARKDOWN)
        seedDir(`${FOLDER}/sub`)
        seedFile(`${FOLDER}/sub/b.md`, 'b')

        const uri = await fileStorage.renameDirectory(FOLDER, ROOT, 'renamed')

        expect(uri).toBe(`${ROOT}/renamed`)
        expect(readText(`${ROOT}/renamed/a.md`)).toBe('a')
        expect(readText(`${ROOT}/renamed/sub/b.md`)).toBe('b')
        expect(mockFs.has(FOLDER)).toBe(false)
    })

    test('removes the partial copy and keeps the original when copying fails', async () => {
        seedFile(`${FOLDER}/a.md`, 'a')
        mockState.failBytes = true

        await expect(fileStorage.renameDirectory(FOLDER, ROOT, 'renamed')).rejects.toThrow(
            'read failed'
        )

        expect(mockFs.has(`${ROOT}/renamed`)).toBe(false)
        expect(readText(`${FOLDER}/a.md`)).toBe('a')
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
