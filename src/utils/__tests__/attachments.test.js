import {
    collectImageUris,
    readAttachmentSettings,
    resolveAttachmentTarget,
    sanitizeFolderName
} from '../attachments'

import { ATTACHMENT_LOCATIONS, DEFAULT_ATTACHMENT_FOLDER } from '@/constants/attachments'
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
