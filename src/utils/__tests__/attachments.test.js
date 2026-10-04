import {
    buildFileRows,
    collectFiles,
    collectImageUris,
    findFileByTarget,
    getFileKind,
    readAttachmentSettings,
    resolveAttachmentTarget,
    sanitizeFolderName
} from '../attachments'

import { ATTACHMENT_LOCATIONS, DEFAULT_ATTACHMENT_FOLDER } from '@/constants/attachments'
import { FILE_KINDS } from '@/constants/file-types'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const paths = { rootUri: 'root', noteFolderUri: 'root/notes' }

describe('resolve attachment target', () => {
    test('uses the vault root for the vault location', () => {
        const target = resolveAttachmentTarget(
            { location: ATTACHMENT_LOCATIONS.VAULT, folderName: 'files' },
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

    test('puts the folder in the vault root for the folder location', () => {
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
            [STORAGE_KEYS.ATTACHMENT_LOCATION]: ATTACHMENT_LOCATIONS.VAULT,
            [STORAGE_KEYS.ATTACHMENT_FOLDER]: 'files'
        }

        const settings = await readAttachmentSettings(async (key) => stored[key])

        expect(settings).toEqual({ location: ATTACHMENT_LOCATIONS.VAULT, folderName: 'files' })
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

describe('collect image uris', () => {
    const tree = {
        root: [
            { name: 'pasted.png', uri: 'root/pasted.png' },
            { name: 'note.md', uri: 'root/note.md' },
            { name: '.trash', uri: 'root/.trash', isDirectory: true },
            { name: 'files', uri: 'root/files', isDirectory: true }
        ],
        'root/.trash': [{ name: 'gone.png', uri: 'root/.trash/gone.png' }],
        'root/files': [
            { name: 'deep.JPG', uri: 'root/files/deep.JPG' },
            { name: 'pasted.png', uri: 'root/files/pasted.png' }
        ]
    }

    test('finds images by name anywhere in the vault', () => {
        const found = collectImageUris('root', (uri) => tree[uri])

        expect(found.get('deep.JPG')).toBe('root/files/deep.JPG')
        expect(found.get('pasted.png')).toBe('root/pasted.png')
    })

    test('skips hidden folders and non image files', () => {
        const found = collectImageUris('root', (uri) => tree[uri])

        expect(found.has('gone.png')).toBe(false)
        expect(found.has('note.md')).toBe(false)
    })
})

describe('collect files', () => {
    const tree = {
        root: [
            { name: 'song.mp3', uri: 'root/song.mp3' },
            { name: 'note.md', uri: 'root/note.md' },
            { name: '.trash', uri: 'root/.trash', isDirectory: true },
            { name: 'files', uri: 'root/files', isDirectory: true }
        ],
        'root/.trash': [{ name: 'gone.pdf', uri: 'root/.trash/gone.pdf' }],
        'root/files': [
            { name: 'song.mp3', uri: 'root/files/song.mp3' },
            { name: 'deep', uri: 'root/files/deep', isDirectory: true }
        ],
        'root/files/deep': [{ name: 'doc.PDF', uri: 'root/files/deep/doc.PDF' }]
    }

    test('lists every supported file with its folder', () => {
        const found = collectFiles('root', (uri) => tree[uri])

        expect(found).toEqual([
            { filename: 'song.mp3', uri: 'root/song.mp3', folder: '' },
            { filename: 'song.mp3', uri: 'root/files/song.mp3', folder: 'files' },
            { filename: 'doc.PDF', uri: 'root/files/deep/doc.PDF', folder: 'files/deep' }
        ])
    })

    test('skips hidden folders and unsupported files', () => {
        const names = collectFiles('root', (uri) => tree[uri]).map((file) => file.filename)

        expect(names).not.toContain('gone.pdf')
        expect(names).not.toContain('note.md')
    })
})

describe('file kind', () => {
    test('detects the kind from the extension ignoring case', () => {
        expect(getFileKind('a.PNG')).toBe(FILE_KINDS.IMAGE)
        expect(getFileKind('a.m4a')).toBe(FILE_KINDS.AUDIO)
        expect(getFileKind('a.mov')).toBe(FILE_KINDS.VIDEO)
        expect(getFileKind('a.pdf')).toBe(FILE_KINDS.PDF)
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
