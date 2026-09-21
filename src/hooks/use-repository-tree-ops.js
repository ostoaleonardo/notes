import { useCallback } from 'react'
import { randomUUID } from 'expo-crypto'

import { getDefaultTemplates } from '@/utils/default-templates'

export function useRepositoryTreeOps({ repositories, fileStorage }) {
    const {
        listMarkdownFiles,
        listSubdirectories,
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

    const discoverSubfolders = useCallback((directory, parentId) => (
        listSubdirectories(directory.uri).flatMap((subdirectory) => {
            const entry = buildRepository(subdirectory, parentId, false)
            return [entry, ...discoverSubfolders(subdirectory, entry.id)]
        })
    ), [listSubdirectories, buildRepository])

    const relinkUris = useCallback((repository) => {
        let diskChildren

        try {
            diskChildren = listSubdirectories(repository.uri)
        } catch {
            diskChildren = []
        }

        const trackedChildren = repositories.filter((r) => r.parentId === repository.id)
        const diskByName = new Map(diskChildren.map((d) => [d.name, d]))

        return trackedChildren.flatMap((child) => {
            const disk = diskByName.get(child.alias)
            if (!disk) return []

            const relinkedChild = { ...child, uri: disk.uri }
            return [relinkedChild, ...relinkUris(relinkedChild)]
        })
    }, [listSubdirectories, repositories])

    return {
        seedTemplates,
        buildRepository,
        discoverSubfolders,
        relinkUris
    }
}
