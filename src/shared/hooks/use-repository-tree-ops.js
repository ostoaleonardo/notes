import { useCallback } from 'react'
import { randomUUID } from 'expo-crypto'

import { getDefaultTemplates } from '@/shared/utils/default-templates'

export function useRepositoryTreeOps({ repositories, fileStorage }) {
    const {
        listMarkdownFiles,
        scanSubdirectories,
        writeNoteFile,
        getOrCreateTemplatesFolder
    } = fileStorage

    const seedTemplates = useCallback((templatesUri) => {
        const existingNames = new Set(listMarkdownFiles(templatesUri).map((file) => file.name))
        getDefaultTemplates().forEach(({ filename, content }) => {
            if (!existingNames.has(filename)) writeNoteFile(templatesUri, filename, content)
        })
    }, [listMarkdownFiles, writeNoteFile])

    const buildRepository = useCallback((
        directory,
        parentId = null,
        seedTemplatesFolder = true
    ) => {
        let templatesUri = null

        if (seedTemplatesFolder) {
            const templatesDirectory = getOrCreateTemplatesFolder(directory.uri)
            seedTemplates(templatesDirectory.uri)
            templatesUri = templatesDirectory.uri
        }

        return {
            id: randomUUID(),
            uri: directory.uri,
            alias: directory.name,
            createdAt: Date.now(),
            templatesUri,
            parentId
        }
    }, [getOrCreateTemplatesFolder, seedTemplates])

    const discoverSubfolders = useCallback(async (directory, parentId) => {
        const subdirectories = await scanSubdirectories(directory.uri)

        const discovered = await Promise.all(subdirectories.map(async (subdirectory) => {
            const entry = buildRepository(subdirectory, parentId, false)
            return [entry, ...await discoverSubfolders(subdirectory, entry.id)]
        }))

        return discovered.flat()
    }, [scanSubdirectories, buildRepository])

    const relinkUris = useCallback(async (repository) => {
        let diskChildren

        try {
            diskChildren = await scanSubdirectories(repository.uri)
        } catch {
            diskChildren = []
        }

        const trackedChildren = repositories.filter((r) => r.parentId === repository.id)
        const diskByName = new Map(diskChildren.map((d) => [d.name, d]))

        const relinked = await Promise.all(trackedChildren.map(async (child) => {
            const disk = diskByName.get(child.alias)
            if (!disk) return []

            const relinkedChild = { ...child, uri: disk.uri }
            return [relinkedChild, ...await relinkUris(relinkedChild)]
        }))

        return relinked.flat()
    }, [scanSubdirectories, repositories])

    return {
        seedTemplates,
        buildRepository,
        discoverSubfolders,
        relinkUris
    }
}
