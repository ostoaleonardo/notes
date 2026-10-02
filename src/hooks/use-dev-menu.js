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
import { buildNoteFileContent, parseFrontmatter } from '@/utils/frontmatter'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import {
    TREE_BRANCHING,
    NOTES_PER_FOLDER,
    LEGACY_SEED_IMAGE_FILENAME,
    LEGACY_SEED_IMAGE_BASE64
} from '@/constants/dev-menu'

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
        deleteDirectory
    } = useFileStorage()

    const {
        repositories,
        activeRepository,
        activeRepositoryId,
        buildRepository
    } = useRepositories()

    const resetApp = async () => {
        if (activeRepository) {
            clearRepository(activeRepository.uri)
            deleteDirectory(getOrCreateTemplatesFolder(activeRepository.uri).uri)
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
