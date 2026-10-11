import { useEffect, useEffectEvent } from 'react'
import { DevSettings } from 'react-native'
import { registerDevMenuItems } from 'expo-dev-menu'
import { Directory, File, Paths } from 'expo-file-system'
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
import { buildDevTestPlan } from '@/utils/dev-test-data'
import { buildNotePath } from '@/utils/note-path'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { NOTE_FILE_EXTENSION } from '@/constants/file-storage'
import { LOG_MESSAGES } from '@/constants/log-messages'
import { LEGACY_SEED_IMAGE_FILENAME, LEGACY_SEED_IMAGE_BASE64 } from '@/constants/dev-menu'
import { DEV_TEST_PINNED_TITLES } from '@/constants/dev-test-data'
import { logError } from '@/utils/log-error'

export function useDevMenu() {
    const { getItem, setItem } = useStorage()
    const { pro, setPro } = usePro()

    const {
        writeNoteFile,
        findFile,
        clearRepository,
        createSubdirectory,
        findDirectory,
        getOrCreateTemplatesFolder,
        getOrCreateImagesFolder,
        getOrCreateNotesFolder,
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
    }

    const writeTestNotes = (notes, uriByFolder) => {
        notes.forEach(({ folder, title, tags, properties, body }) => {
            writeNoteFile(
                uriByFolder.get(folder.join('/')),
                `${sanitizeFilename(title)}${NOTE_FILE_EXTENSION}`,
                buildNoteFileContent({ tags, properties }, body)
            )
        })
    }

    const writeTestTemplates = (templates, rootUri) => {
        const templatesUri = getOrCreateTemplatesFolder(rootUri).uri

        templates.forEach(({ folder, filename, content }) => {
            const uri = folder.reduce((parentUri, name) => (
                (findDirectory(parentUri, name) || createSubdirectory(parentUri, name)).uri
            ), templatesUri)

            writeNoteFile(uri, filename, content)
        })
    }

    const writeTestFiles = (files, rootUri) => {
        const imagesUri = getOrCreateImagesFolder(rootUri).uri

        files.forEach(({ filename, mimeType, base64, text }) => {
            if (findFile(imagesUri, filename)) return

            const file = new Directory(imagesUri).createFile(filename, mimeType)
            file.write(text ?? Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)))
        })
    }

    const generateTestData = async () => {
        try {
            const plan = buildDevTestPlan()
            const generated = []

            let root = activeRepository
            if (!root) {
                const directory = await Directory.pickDirectoryAsync()
                if (repositories.some((repository) => repository.uri === directory.uri)) return

                root = buildRepository(directory, null, true)
                generated.push(root)
            }

            const uriByFolder = new Map([['', root.uri]])
            const repositoryByFolder = new Map([['', root]])

            plan.folders.forEach((folder) => {
                const parentKey = folder.slice(0, -1).join('/')
                const parentUri = uriByFolder.get(parentKey)
                const name = folder.at(-1)

                const directory = findDirectory(parentUri, name) || createSubdirectory(parentUri, name)
                const existing = repositories.find((repository) => repository.uri === directory.uri)
                const repository = existing || buildRepository(directory, repositoryByFolder.get(parentKey).id, false)
                if (!existing) generated.push(repository)

                uriByFolder.set(folder.join('/'), repository.uri)
                repositoryByFolder.set(folder.join('/'), repository)
            })

            writeTestNotes(plan.notes, uriByFolder)
            writeTestTemplates(plan.templates, root.uri)
            writeTestFiles(plan.files, root.uri)

            const pinned = new Set(JSON.parse((await getItem(STORAGE_KEYS.PINNED)) || '[]'))
            DEV_TEST_PINNED_TITLES.forEach((title) => {
                pinned.add(buildNotePath(root.id, `${sanitizeFilename(title)}${NOTE_FILE_EXTENSION}`))
            })
            await setItem(STORAGE_KEYS.PINNED, JSON.stringify([...pinned]))

            if (generated.length) {
                await setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify([...repositories, ...generated]))
            }
            if (!activeRepositoryId) await setItem(STORAGE_KEYS.ACTIVE_REPOSITORY, root.id)

            DevSettings.reload()
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_GENERATING_TEST_DATA, error)
        }
    }

    const createWelcomeNote = async () => {
        if (!activeRepository) return

        const uri = activeRepository.uri
        const { title, content } = getWelcomeNote()
        const filename = `${sanitizeFilename(title)}.md`

        const existing = findFile(uri, filename)
        const previous = existing ? parseFrontmatter(await existing.text()).frontmatter : null

        writeNoteFile(uri, filename, buildNoteFileContent({ tags: previous?.tags || [] }, content))

        DevSettings.reload()
    }

    const registerItems = useEffectEvent(() => {
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
                name: 'Generate test data (folders, notes, tags, templates, files, links)',
                callback: generateTestData,
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
    })

    useEffect(() => {
        registerItems()
    }, [
        pro,
        repositories,
        activeRepository,
        activeRepositoryId
    ])
}
