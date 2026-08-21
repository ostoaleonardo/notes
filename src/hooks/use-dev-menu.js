import { useEffect } from 'react'
import { DevSettings } from 'react-native'
import { registerDevMenuItems } from 'expo-dev-menu'
import { randomUUID } from 'expo-crypto'
import { Directory } from 'expo-file-system'
import { useStorage } from './use-storage'
import { TAGS_FILENAME, useFileStorage } from './use-file-storage'
import { usePremium } from './use-premium'
import { DEFAULT_TAGS, STORAGE_KEYS, getDefaultTemplates } from '@/constants'
import { getDate } from '@/utils'

const TREE_BRANCHING = 2
const NOTES_PER_FOLDER = 2

export function useDevMenu() {
    const { getItem, setItem } = useStorage()
    const { premium, setPremium } = usePremium()

    const {
        clearRepository,
        writeNoteFile,
        writeJson,
        createSubdirectory,
        getOrCreateTemplatesFolder
    } = useFileStorage()

    const getRepositories = async () => {
        const json = await getItem(STORAGE_KEYS.REPOSITORIES)
        return json ? JSON.parse(json) : []
    }

    const getActiveRepository = async () => {
        const repositories = await getRepositories()
        const activeRepositoryId = await getItem(STORAGE_KEYS.ACTIVE_REPOSITORY)
        return repositories.find((repository) => repository.id === activeRepositoryId)
    }

    const getActiveRootRepository = async () => {
        const repositories = await getRepositories()
        let repository = await getActiveRepository()

        while (repository?.parentId) {
            repository = repositories.find((r) => r.id === repository.parentId)
        }

        return repository
    }

    const deleteAll = async () => {
        const repository = await getActiveRepository()
        if (repository) clearRepository(repository.uri)
        DevSettings.reload()
    }

    const deleteAllTags = async () => {
        const repository = await getActiveRootRepository()
        if (repository) writeJson(repository.uri, TAGS_FILENAME, DEFAULT_TAGS)
        DevSettings.reload()
    }

    const addLegacyNotes = async () => {
        const legacy = await getItem(STORAGE_KEYS.NOTES)
        const existing = legacy ? JSON.parse(legacy) : []

        const seeded = [1, 2, 3].map((n) => ({
            id: randomUUID(),
            title: `Legacy note ${n}`,
            note: `Legacy note content ${n}`,
            tags: [],
            images: [],
            password: '',
            biometrics: false,
            createdAt: getDate()
        }))

        await setItem(STORAGE_KEYS.NOTES, JSON.stringify([...existing, ...seeded]))
        DevSettings.reload()
    }

    const addLegacyTags = async () => {
        const legacy = await getItem(STORAGE_KEYS.TAGS)
        const existing = legacy ? JSON.parse(legacy) : []

        const seeded = ['Legacy work', 'Legacy personal', 'Legacy ideas'].map((name) => ({
            id: randomUUID(),
            name
        }))

        await setItem(STORAGE_KEYS.TAGS, JSON.stringify([...existing, ...seeded]))
        DevSettings.reload()
    }

    const seedFolderNotes = (uri, label) => {
        for (let i = 1; i <= NOTES_PER_FOLDER; i++) {
            writeNoteFile(uri, `${label} note ${i}.md`, `# ${label} note ${i}\n\nExample content.`)
        }
    }

    const buildRepositoryEntry = (directory, parentId, withTemplates) => {
        const templatesUri = withTemplates
            ? getOrCreateTemplatesFolder(directory.uri).uri
            : null

        if (withTemplates) {
            getDefaultTemplates().forEach(({ filename, content }) => writeNoteFile(templatesUri, filename, content))
        }

        return {
            id: randomUUID(),
            uri: directory.uri,
            alias: directory.name,
            createdAt: Date.now(),
            templatesUri,
            parentId
        }
    }

    const generateRepositoryTree = async () => {
        try {
            const directory = await Directory.pickDirectoryAsync()
            const repositories = await getRepositories()

            if (repositories.some((repository) => repository.uri === directory.uri)) return

            const root = buildRepositoryEntry(directory, null, true)
            seedFolderNotes(root.uri, root.alias)

            const generated = [root]

            for (let f = 1; f <= TREE_BRANCHING; f++) {
                const folderDirectory = createSubdirectory(directory.uri, `Folder ${f}`)
                const folder = buildRepositoryEntry(folderDirectory, root.id, false)
                seedFolderNotes(folder.uri, folder.alias)
                generated.push(folder)

                for (let s = 1; s <= TREE_BRANCHING; s++) {
                    const subfolderDirectory = createSubdirectory(folderDirectory.uri, `Subfolder ${f}.${s}`)
                    const subfolder = buildRepositoryEntry(subfolderDirectory, folder.id, false)
                    seedFolderNotes(subfolder.uri, subfolder.alias)
                    generated.push(subfolder)
                }
            }

            await setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify([...repositories, ...generated]))

            const activeRepositoryId = await getItem(STORAGE_KEYS.ACTIVE_REPOSITORY)
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
                name: 'Delete all notes',
                callback: deleteAll,
                shouldCollapse: true
            },
            {
                name: 'Delete all tags',
                callback: deleteAllTags,
                shouldCollapse: true
            },
            {
                name: 'Add legacy notes',
                callback: addLegacyNotes,
                shouldCollapse: true
            },
            {
                name: 'Add legacy tags',
                callback: addLegacyTags,
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
    }, [premium])
}
