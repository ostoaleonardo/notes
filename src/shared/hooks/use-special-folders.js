import { useCallback } from 'react'

import { resolveAttachmentTarget } from '@/shared/utils/attachments'
import { withBusy } from '@/shared/utils/with-busy'
import { TEMPLATES_FOLDER_NAME } from '@/shared/constants/file-storage'

export function useSpecialFolders({
    folders,
    busyRef,
    fileStorage,
    persistFolders,
    getRootRepository,
    seedTemplates
}) {
    const {
        createSubdirectory,
        findDirectory,
        getOrCreateTemplatesFolder,
        getOrCreateImagesFolder
    } = fileStorage

    const ensureTemplatesFolder = useCallback(async (folder) => {
        const root = getRootRepository(folder)
        const existing = findDirectory(root.uri, TEMPLATES_FOLDER_NAME)

        if (existing) {
            if (root.templatesUri !== existing.uri) {
                await persistFolders(folders.map((r) => (
                    r.id === root.id ? { ...r, templatesUri: existing.uri } : r
                )))
            }

            return existing.uri
        }

        return withBusy(busyRef, async () => {
            const templatesDirectory = getOrCreateTemplatesFolder(root.uri)
            seedTemplates(templatesDirectory.uri)

            await persistFolders(folders.map((r) => (
                r.id === root.id ? { ...r, templatesUri: templatesDirectory.uri } : r
            )))

            return templatesDirectory.uri
        })
    }, [
        getRootRepository,
        findDirectory,
        getOrCreateTemplatesFolder,
        seedTemplates,
        persistFolders,
        folders,
        busyRef
    ])

    const ensureImagesFolder = useCallback((folder) => {
        const root = getRootRepository(folder)
        return getOrCreateImagesFolder(root.uri).uri
    }, [getRootRepository, getOrCreateImagesFolder])

    const ensureAttachmentsFolder = useCallback((folder, settings) => {
        const { parentUri, folderName } = resolveAttachmentTarget(settings, {
            rootUri: getRootRepository(folder).uri,
            noteFolderUri: folder.uri
        })

        if (!folderName) return parentUri

        return (findDirectory(parentUri, folderName) || createSubdirectory(parentUri, folderName)).uri
    }, [getRootRepository, findDirectory, createSubdirectory])

    return { ensureTemplatesFolder, ensureImagesFolder, ensureAttachmentsFolder }
}
