import {
    buildFileRows,
    buildMediaUris,
    filterFileEntries,
    findFileByTarget,
    getFileKind,
    readAttachmentSettings,
    resolveAttachmentTarget,
    sanitizeFolderName
} from '../attachments'

import { ATTACHMENT_LOCATIONS, DEFAULT_ATTACHMENT_FOLDER } from '@/shared/constants/attachments'
import { FILE_KINDS } from '@/shared/constants/file-types'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

const paths = { rootUri: 'root', noteFolderUri: 'root/notes' }

describe('resolve attachment target', () => {
    test('uses the repository root for the repository location', () => {
        const target = resolveAttachmentTarget(
            { location: ATTACHMENT_LOCATIONS.REPOSITORY, folderName: 'files' },
            paths
        )

        expect(target).toEqual({ parentUri: 'root', folderName: null })
    })

    test('uses the note folder for the same folder location', () => {
        const target = resolveAttachmentTarget(
            { location: ATTACHMENT_LOCATIONS.SAME_FOLDER, folderName: 'files' },
            paths
        )

        expect(target).toEqual({ parentUri: 'root/notes', folderName: null })
    })

    test('nests the folder inside the note folder for the subfolder location', () => {
        const target = resolveAttachmentTarget(
            { location: ATTACHMENT_LOCATIONS.SUBFOLDER, folderName: 'files' },
            paths
        )

        expect(target).toEqual({ parentUri: 'root/notes', folderName: 'files' })
    })

    test('puts the folder in the repository root for the folder location', () => {
        const target = resolveAttachmentTarget(
            { location: ATTACHMENT_LOCATIONS.FOLDER, folderName: 'files' },
            paths
        )

        expect(target).toEqual({ parentUri: 'root', folderName: 'files' })
    })
})

describe('attachment settings', () => {
    test('falls back to the default folder location', async () => {
        const settings = await readAttachmentSettings(async () => null)

        expect(settings).toEqual({
            location: ATTACHMENT_LOCATIONS.FOLDER,
            folderName: DEFAULT_ATTACHMENT_FOLDER
        })
    })

    test('reads the stored location and folder name', async () => {
        const stored = {
            [STORAGE_KEYS.ATTACHMENT_LOCATION]: ATTACHMENT_LOCATIONS.REPOSITORY,
            [STORAGE_KEYS.ATTACHMENT_FOLDER]: 'files'
        }

        const settings = await readAttachmentSettings(async (key) => stored[key])

        expect(settings).toEqual({ location: ATTACHMENT_LOCATIONS.REPOSITORY, folderName: 'files' })
    })

    test('ignores an unknown stored location', async () => {
        const settings = await readAttachmentSettings(async () => 'elsewhere')

        expect(settings.location).toBe(ATTACHMENT_LOCATIONS.FOLDER)
    })

    test('strips invalid characters from the folder name', () => {
        expect(sanitizeFolderName(' a/b:c ')).toBe('abc')
        expect(sanitizeFolderName('..')).toBe(DEFAULT_ATTACHMENT_FOLDER)
        expect(sanitizeFolderName('   ')).toBe(DEFAULT_ATTACHMENT_FOLDER)
    })
})

const entry = (filename, folder = '') => ({
    filename,
    folder,
    uri: `root/${folder ? folder + '/' : ''}${filename}`
})

describe('build media uris', () => {
    const entries = [
        entry('pasted.png'),
        entry('doc.pdf'),
        entry('notes.txt'),
        entry('deep.JPG', 'files'),
        entry('song.mp3', 'files'),
        entry('clip.webm', 'files'),
        entry('pasted.png', 'files')
    ]

    test('finds images by name anywhere in the repository', () => {
        const found = buildMediaUris(entries)

        expect(found.get('deep.JPG')).toBe('root/files/deep.JPG')
        expect(found.get('pasted.png')).toBe('root/pasted.png')
    })

    test('finds pdf files', () => {
        expect(buildMediaUris(entries).get('doc.pdf')).toBe('root/doc.pdf')
    })

    test('finds audio and video files', () => {
        const found = buildMediaUris(entries)

        expect(found.get('song.mp3')).toBe('root/files/song.mp3')
        expect(found.get('clip.webm')).toBe('root/files/clip.webm')
    })

    test('skips files that cannot be previewed', () => {
        expect(buildMediaUris(entries).has('notes.txt')).toBe(false)
    })
})

describe('filter file entries', () => {
    const entries = [
        entry('song.mp3'),
        entry('readme'),
        entry('data.bin'),
        entry('doc.PDF', 'files/deep')
    ]

    test('keeps the supported files with their folder', () => {
        expect(filterFileEntries(entries)).toEqual([
            { filename: 'song.mp3', uri: 'root/song.mp3', folder: '' },
            { filename: 'doc.PDF', uri: 'root/files/deep/doc.PDF', folder: 'files/deep' }
        ])
    })

    test('drops names without a supported extension', () => {
        const names = filterFileEntries(entries).map((file) => file.filename)

        expect(names).not.toContain('readme')
        expect(names).not.toContain('data.bin')
    })
})

describe('file kind', () => {
    test('detects the kind from the extension ignoring case', () => {
        expect(getFileKind('a.PNG')).toBe(FILE_KINDS.IMAGE)
        expect(getFileKind('a.m4a')).toBe(FILE_KINDS.AUDIO)
        expect(getFileKind('a.mov')).toBe(FILE_KINDS.VIDEO)
        expect(getFileKind('a.pdf')).toBe(FILE_KINDS.PDF)
        expect(getFileKind('tags.TXT')).toBe(FILE_KINDS.TEXT)
    })

    test('returns null for unsupported files and names without extension', () => {
        expect(getFileKind('a.md')).toBeNull()
        expect(getFileKind('png')).toBeNull()
    })
})

describe('build file rows', () => {
    test('splits the extension from the name and sorts by name then folder', () => {
        const rows = buildFileRows([
            { filename: 'b.png', uri: 'root/b.png', folder: '' },
            { filename: 'a.photo.JPG', uri: 'root/z/a.photo.JPG', folder: 'z' },
            { filename: 'a.photo.JPG', uri: 'root/y/a.photo.JPG', folder: 'y' }
        ])

        expect(rows.map((row) => [row.name, row.folder])).toEqual([
            ['a.photo', 'y'],
            ['a.photo', 'z'],
            ['b', '']
        ])
        expect(rows[0]).toEqual({
            id: 'file:root/y/a.photo.JPG',
            uri: 'root/y/a.photo.JPG',
            folder: 'y',
            filename: 'a.photo.JPG',
            name: 'a.photo',
            extension: 'JPG',
            kind: FILE_KINDS.IMAGE,
            mimeType: 'image/jpeg'
        })
    })

    test('returns no rows when there are no files', () => {
        expect(buildFileRows([])).toEqual([])
    })
})

describe('find file by target', () => {
    const rows = [
        { folder: '', filename: 'sample.pdf' },
        { folder: 'docs', filename: 'sample.pdf' },
        { folder: 'docs/deep', filename: 'Photo.JPG' }
    ]

    test('matches a bare filename case-insensitively', () => {
        expect(findFileByTarget(rows, 'photo.jpg')).toBe(rows[2])
    })

    test('matches a relative path to the right folder', () => {
        expect(findFileByTarget(rows, 'docs/sample.pdf')).toBe(rows[1])
    })

    test('does not match a partial filename', () => {
        expect(findFileByTarget(rows, 'ample.pdf')).toBeUndefined()
    })
})
