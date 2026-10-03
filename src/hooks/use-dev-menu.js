import { useEffect } from 'react'
import { DevSettings } from 'react-native'
import { registerDevMenuItems } from 'expo-dev-menu'
import { Directory, File, Paths } from 'expo-file-system'
import { useTheme } from 'react-native-paper'
import legacyNotes from '../../legacy/notes.json'
import legacyTags from '../../legacy/categories.json'

import { useStorage } from './use-storage'
import { usePro } from './use-pro'
import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'

import { getWelcomeNote } from '@/utils/welcome-note'
import { sanitizeFilename } from '@/utils/note-filename'
import { getVersionLocation } from '@/utils/note-version-location'
import { buildNoteFileContent, parseFrontmatter } from '@/utils/frontmatter'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { MIME_TYPES } from '@/constants/mime-types'
import { NOTE_FILE_EXTENSION } from '@/constants/file-storage'
import {
    TREE_BRANCHING,
    NOTES_PER_FOLDER,
    LEGACY_SEED_IMAGE_FILENAME,
    LEGACY_SEED_IMAGE_BASE64
} from '@/constants/dev-menu'
import {
    SYNTAX_IMAGE_FILENAME,
    SYNTAX_IMAGE_BASE64,
    SYNTAX_LINKED_TITLE,
    SYNTAX_LINKED_TAGS,
    SYNTAX_LINKED_PROPERTIES,
    SYNTAX_LINKED_BODY,
    SYNTAX_EMBED_TITLE,
    SYNTAX_EMBED_TAGS,
    SYNTAX_EMBED_BODY,
    SYNTAX_MAIN_TITLE,
    SYNTAX_MAIN_TAGS,
    SYNTAX_MAIN_PROPERTIES,
    SYNTAX_MAIN_BODY
} from '@/constants/syntax-note'

export function useDevMenu() {
    const { setItem } = useStorage()
    const { pro, setPro } = usePro()
    const { colors } = useTheme()

    const {
        writeNoteFile,
        findFile,
        clearRepository,
        createSubdirectory,
        getOrCreateTemplatesFolder,
        getOrCreateNotesFolder,
        deleteDirectory
    } = useFileStorage()

    const {
        repositories,
        activeRepository,
        activeRepositoryId,
        buildRepository,
        ensureImagesFolder
    } = useRepositories()

    const resetApp = async () => {
        if (activeRepository) {
            clearRepository(activeRepository.uri, getVersionLocation(repositories, activeRepository.id))
            deleteDirectory(getOrCreateTemplatesFolder(activeRepository.uri).uri)
            deleteDirectory(getOrCreateNotesFolder(activeRepository.uri).uri)
        }

        await setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify([]))
        await setItem(STORAGE_KEYS.ACTIVE_REPOSITORY, '')

        DevSettings.reload()
    }

    const seedLegacyDump = async () => {
        const image = new File(Paths.cache, LEGACY_SEED_IMAGE_FILENAME)
        if (!image.exists) image.create()
        image.write(Uint8Array.from(atob(LEGACY_SEED_IMAGE_BASE64), (char) => char.charCodeAt(0)))

        const notes = legacyNotes.map((note) => ({
            ...note,
            images: note.images.map(() => image.uri)
        }))

        await setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes))
        await setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(legacyTags))
        console.debug('seeded legacy dump')
    }

    const seedFolderNotes = (uri, label) => {
        for (let i = 1; i <= NOTES_PER_FOLDER; i++) {
            writeNoteFile(uri, `${label} note ${i}.md`, `# ${label} note ${i}\n\nExample content.`)
        }
    }

    const generateRepositoryTree = async () => {
        try {
            const directory = await Directory.pickDirectoryAsync()

            if (repositories.some((repository) => repository.uri === directory.uri)) return

            const root = buildRepository(directory, null, true)
            seedFolderNotes(root.uri, root.alias)

            const generated = [root]

            for (let f = 1; f <= TREE_BRANCHING; f++) {
                const folderDirectory = createSubdirectory(directory.uri, `Folder ${f}`)
                const folder = buildRepository(folderDirectory, root.id, false)
                seedFolderNotes(folder.uri, folder.alias)
                generated.push(folder)

                for (let s = 1; s <= TREE_BRANCHING; s++) {
                    const subfolderDirectory = createSubdirectory(folderDirectory.uri, `Subfolder ${f}.${s}`)
                    const subfolder = buildRepository(subfolderDirectory, folder.id, false)
                    seedFolderNotes(subfolder.uri, subfolder.alias)
                    generated.push(subfolder)
                }
            }

            await setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify([...repositories, ...generated]))
            if (!activeRepositoryId) await setItem(STORAGE_KEYS.ACTIVE_REPOSITORY, root.id)

            DevSettings.reload()
        } catch (error) {
            console.debug('error generating repository tree', error)
        }
    }

    const createWelcomeNote = async () => {
        if (!activeRepository) return

        const uri = activeRepository.uri
        const { title, content } = getWelcomeNote(colors)
        const filename = `${sanitizeFilename(title)}.md`

        const existing = findFile(uri, filename)
        const previous = existing ? parseFrontmatter(await existing.text()).frontmatter : null

        writeNoteFile(uri, filename, buildNoteFileContent({ tags: previous?.tags || [] }, content))

        DevSettings.reload()
    }

    const createSyntaxNote = () => {
        if (!activeRepository) return

        const uri = activeRepository.uri

        const notes = [
            {
                title: SYNTAX_LINKED_TITLE,
                tags: SYNTAX_LINKED_TAGS,
                properties: SYNTAX_LINKED_PROPERTIES,
                body: SYNTAX_LINKED_BODY
            },
            {
                title: SYNTAX_EMBED_TITLE,
                tags: SYNTAX_EMBED_TAGS,
                body: SYNTAX_EMBED_BODY
            },
            {
                title: SYNTAX_MAIN_TITLE,
                tags: SYNTAX_MAIN_TAGS,
                properties: SYNTAX_MAIN_PROPERTIES,
                body: SYNTAX_MAIN_BODY
            }
        ]

        notes.forEach(({ title, tags, properties, body }) => {
            writeNoteFile(
                uri,
                `${sanitizeFilename(title)}${NOTE_FILE_EXTENSION}`,
                buildNoteFileContent({ tags, properties }, body)
            )
        })

        const imagesUri = ensureImagesFolder(activeRepository)

        if (!findFile(imagesUri, SYNTAX_IMAGE_FILENAME)) {
            new Directory(imagesUri)
                .createFile(SYNTAX_IMAGE_FILENAME, MIME_TYPES.PNG)
                .write(Uint8Array.from(atob(SYNTAX_IMAGE_BASE64), (char) => char.charCodeAt(0)))
        }

        DevSettings.reload()
    }

    useEffect(() => {
        if (!__DEV__) return

        registerDevMenuItems([
            {
                name: 'Reset app (no repository selected)',
                callback: resetApp,
                shouldCollapse: true
            },
            {
                name: 'Seed legacy dump',
                callback: seedLegacyDump,
                shouldCollapse: true
            },
            {
                name: 'Generate repository with folders and subfolders',
                callback: generateRepositoryTree,
                shouldCollapse: true
            },
            {
                name: 'Create/replace welcome note',
                callback: createWelcomeNote,
                shouldCollapse: true
            },
            {
                name: 'Create/replace syntax test notes',
                callback: createSyntaxNote,
                shouldCollapse: true
            },
            {
                name: pro ? 'Disable (Pro)' : 'Enable (Pro)',
                callback: () => setPro(!pro),
                shouldCollapse: true
            }
        ])
    }, [
        pro,
        colors,
        repositories,
        activeRepository,
        activeRepositoryId
    ])
}
