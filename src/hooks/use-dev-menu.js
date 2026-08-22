import { useEffect } from 'react'
import { DevSettings } from 'react-native'
import { registerDevMenuItems } from 'expo-dev-menu'
import { Directory } from 'expo-file-system'
import { useStorage } from './use-storage'
import { usePremium } from './use-premium'
import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import {
    STORAGE_KEYS,
    TREE_BRANCHING,
    NOTES_PER_FOLDER
} from '@/constants'

import legacyNotes from '../../legacy/notes.json'
import legacyTags from '../../legacy/categories.json'

export function useDevMenu() {
    const { setItem } = useStorage()
    const { premium, setPremium } = usePremium()

    const {
        writeNoteFile,
        clearRepository,
        createSubdirectory,
        getOrCreateTemplatesFolder,
        getOrCreateTrashFolder,
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
            deleteDirectory(getOrCreateTrashFolder(activeRepository.uri).uri)
        }

        await setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify([]))
        await setItem(STORAGE_KEYS.ACTIVE_REPOSITORY, '')

        DevSettings.reload()
    }

    const seedLegacyDump = async () => {
        await setItem(STORAGE_KEYS.NOTES, JSON.stringify(legacyNotes))
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
                name: premium ? 'Disable (Pro)' : 'Enable (Pro)',
                callback: () => setPremium(!premium),
                shouldCollapse: true
            }
        ])
    }, [
        premium,
        repositories,
        activeRepository,
        activeRepositoryId
    ])
}
