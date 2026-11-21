import { useEffect, useEffectEvent } from 'react'
import { AppState, DevSettings } from 'react-native'
import { registerDevMenuItems } from 'expo-dev-menu'
import { Directory, File, Paths } from 'expo-file-system'
import legacyNotes from '../../../legacy/notes.json'
import legacyTags from '../../../legacy/categories.json'

import { useStorage } from './use-storage'
import { usePro } from './use-pro'
import { useFileStorage } from './use-file-storage'
import { useFolders } from './use-folders'

import { getWelcomeNote } from '@/shared/utils/welcome-note'
import { hasDirectAccess, requestDirectAccess } from '@/shared/utils/direct-access'
import { revokePermissions } from '@/shared/utils/permissions'
import { startStallDetector } from '@/shared/utils/stall-detector'
import { sanitizeFilename } from '@/shared/utils/note-filename'
import { getVersionLocation } from '@/shared/utils/note-version-location'
import { composeNoteFile, decomposeNoteFile } from '@/shared/utils/note-file-content'
import { buildDevTestPlan, groupDevData, parseDevDataKey } from '@/shared/utils/dev-test-data'
import { readBundledBytes, readBundledText } from '@/shared/utils/bundled-asset'
import { getFileMimeType } from '@/shared/utils/attachments'
import { buildNotePath } from '@/shared/utils/note-path'
import { invalidateMediaIndex } from '@/shared/utils/media-index'
import { checkIndex } from '@/shared/utils/index-check'
import { checkScale } from '@/shared/utils/scale-check'

import { APP_STATES } from '@/shared/constants/app-state'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'
import { NOTE_FILE_EXTENSION } from '@/shared/constants/file-storage'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import {
    DEV_DATA_KINDS,
    DEV_TEST_PINNED_TITLES,
    STALL_CHECK_INTERVAL_MS,
    STALL_THRESHOLD_MS,
    LEGACY_SEED_IMAGE_BASE64,
    LEGACY_SEED_IMAGE_FILENAME
} from '@/shared/constants/dev-menu'
import { logError } from '@/shared/utils/log-error'

const devData = require.context('../../dev-data', true, /\.(md|png|txt|pdf|wav|mp4)$/)

const loadDevData = () => Promise.all(devData.keys().map(async (key) => {
    const entry = parseDevDataKey(key)
    const module = devData(key)

    return entry.kind === DEV_DATA_KINDS.ATTACHMENTS
        ? { ...entry, bytes: await readBundledBytes(module) }
        : { ...entry, content: await readBundledText(module) }
}))

export function useDevMenu() {
    const { getItem, setItem, removeItem } = useStorage()
    const { pro, setPro } = usePro()

    const {
        writeNoteFile,
        scanMarkdownFiles,
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
        folders,
        activeFolder,
        activeFolderId,
        buildFolder
    } = useFolders()

    const resetApp = async () => {
        if (activeFolder) {
            await clearRepository(activeFolder.uri, getVersionLocation(folders, activeFolder.id))
            deleteDirectory(getOrCreateTemplatesFolder(activeFolder.uri).uri)
            deleteDirectory(getOrCreateNotesFolder(activeFolder.uri).uri)
        }

        await setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify([]))
        await setItem(STORAGE_KEYS.ACTIVE_REPOSITORY, '')

        DevSettings.reload()
    }

    const resetPermissions = async () => {
        revokePermissions()
        await removeItem(STORAGE_KEYS.DIRECT_ACCESS_DISMISSED)

        if (hasDirectAccess()) requestDirectAccess()
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
        notes.forEach(({ folder, filename, content }) => {
            writeNoteFile(uriByFolder.get(folder.join('/')), filename, content)
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

        files.forEach(({ filename, bytes }) => {
            if (findFile(imagesUri, filename)) return

            new Directory(imagesUri).createFile(filename, getFileMimeType(filename)).write(bytes)
        })

        invalidateMediaIndex()
    }

    const generateTestData = async () => {
        try {
            const plan = buildDevTestPlan(groupDevData(await loadDevData()))
            const generated = []

            let root = activeFolder
            if (!root) {
                const directory = await Directory.pickDirectoryAsync()
                if (folders.some((folder) => folder.uri === directory.uri)) return

                root = buildFolder(directory, null, true)
                generated.push(root)
            }

            const uriByFolder = new Map([['', root.uri]])
            const folderByPath = new Map([['', root]])

            plan.folders.forEach((segments) => {
                const parentKey = segments.slice(0, -1).join('/')
                const parentUri = uriByFolder.get(parentKey)
                const name = segments.at(-1)

                const directory = findDirectory(parentUri, name) || createSubdirectory(parentUri, name)
                const existing = folders.find((folder) => folder.uri === directory.uri)
                const folder = existing || buildFolder(directory, folderByPath.get(parentKey).id, false)
                if (!existing) generated.push(folder)

                uriByFolder.set(segments.join('/'), folder.uri)
                folderByPath.set(segments.join('/'), folder)
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
                await setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify([...folders, ...generated]))
            }
            if (!activeFolderId) await setItem(STORAGE_KEYS.ACTIVE_REPOSITORY, root.id)

            DevSettings.reload()
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_GENERATING_TEST_DATA, error)
        }
    }

    const createWelcomeNote = async () => {
        if (!activeFolder) return

        const uri = activeFolder.uri
        const { title, content } = getWelcomeNote()
        const filename = `${sanitizeFilename(title)}${NOTE_FILE_EXTENSION}`

        const existing = findFile(uri, filename)
        const previous = existing ? decomposeNoteFile(await existing.text()) : null

        writeNoteFile(uri, filename, composeNoteFile({ tags: previous?.tags || [] }, content))

        DevSettings.reload()
    }

    const registerItems = useEffectEvent(() => {
        registerDevMenuItems([
            {
                name: 'Reset app',
                callback: resetApp,
                shouldCollapse: true
            },
            {
                name: 'Revoke permissions',
                callback: resetPermissions,
                shouldCollapse: true
            },
            {
                name: 'Check native index',
                callback: () => checkIndex(folders, scanMarkdownFiles).catch((error) => console.log('[index] failed', error)),
                shouldCollapse: true
            },
            {
                name: 'Check scale',
                callback: () => checkScale().catch((error) => console.log('[scale] failed', error)),
                shouldCollapse: true
            },
            {
                name: 'Seed legacy dump',
                callback: seedLegacyDump,
                shouldCollapse: true
            },
            {
                name: 'Generate test data',
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
        const start = () => startStallDetector({
            intervalMs: STALL_CHECK_INTERVAL_MS,
            thresholdMs: STALL_THRESHOLD_MS,
            onStall: (ms) => console.log(`[stall] JS thread blocked for ${ms} ms`)
        })

        let stop = start()

        const subscription = AppState.addEventListener('change', (state) => {
            stop()
            if (state === APP_STATES.ACTIVE) stop = start()
        })

        return () => {
            stop()
            subscription.remove()
        }
    }, [])

    useEffect(() => {
        registerItems()
    }, [
        pro,
        folders,
        activeFolder,
        activeFolderId
    ])
}
