import { useCallback } from 'react'
import { File } from 'expo-file-system'

import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { getUniqueFilename, sanitizeFilename, stripNoteExtension } from '@/utils/note-filename'
import { joinTemplatePath, splitTemplatePath } from '@/utils/template-path'
import { notifyTemplatesChanged } from '@/utils/templates-events'

import { TEMPLATE_FILE_EXTENSION_PATTERN } from '@/constants/markdown-patterns'

export function useTemplates() {
    const { activeRepository, ensureTemplatesFolder } = useRepositories()
    const {
        findFile,
        findDirectory,
        listMarkdownFiles,
        listSubdirectories,
        createSubdirectory,
        writeNoteFile,
        renameNoteFile,
        deleteNoteFile
    } = useFileStorage()

    const getTemplatesUri = useCallback(async () => {
        if (!activeRepository) return null
        return await ensureTemplatesFolder(activeRepository)
    }, [activeRepository, ensureTemplatesFolder])

    const getFolderUri = useCallback(async (dir = '') => {
        let uri = await getTemplatesUri()

        for (const segment of dir.split('/').filter(Boolean)) {
            if (!uri) return null
            uri = findDirectory(uri, segment)?.uri
        }

        return uri || null
    }, [getTemplatesUri, findDirectory])

    const collectTemplates = useCallback(async (uri, dir, withContent) => {
        const own = await Promise.all(listMarkdownFiles(uri).map(async (file) => ({
            filename: joinTemplatePath(dir, file.name),
            name: stripNoteExtension(file.name),
            folder: dir,
            content: withContent ? await file.text() : ''
        })))

        const nested = await Promise.all(listSubdirectories(uri).map((directory) => (
            collectTemplates(directory.uri, joinTemplatePath(dir, directory.name), withContent)
        )))

        return [...own, ...nested.flat()]
    }, [listMarkdownFiles, listSubdirectories])

    const collectFolders = useCallback((uri, dir) => (
        listSubdirectories(uri).flatMap((directory) => {
            const path = joinTemplatePath(dir, directory.name)
            return [path, ...collectFolders(directory.uri, path)]
        })
    ), [listSubdirectories])

    const listTemplates = useCallback(async ({ withContent = true } = {}) => {
        const uri = await getTemplatesUri()
        if (!uri) return []

        return collectTemplates(uri, '', withContent)
    }, [getTemplatesUri, collectTemplates])

    const listTemplateFolders = useCallback(async () => {
        const uri = await getTemplatesUri()
        return uri ? collectFolders(uri, '') : []
    }, [getTemplatesUri, collectFolders])

    const getTemplate = useCallback(async (path) => {
        const { dir, base } = splitTemplatePath(path)
        const uri = await getFolderUri(dir)
        if (!uri) return null

        const file = findFile(uri, base)
        if (!file) return null

        return { filename: path, name: stripNoteExtension(base), content: await file.text() }
    }, [getFolderUri, findFile])

    const updateTemplate = useCallback(async (currentPath, name, content) => {
        const { dir, base } = splitTemplatePath(currentPath)
        const uri = await getFolderUri(dir)
        if (!uri || !findFile(uri, base)) return currentPath

        const existingNames = listMarkdownFiles(uri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, name, base)

        if (filename !== base) {
            await renameNoteFile(uri, base, filename)
        }

        writeNoteFile(uri, filename, content)
        notifyTemplatesChanged()
        return joinTemplatePath(dir, filename)
    }, [getFolderUri, findFile, listMarkdownFiles, renameNoteFile, writeNoteFile])

    const deleteTemplate = useCallback(async (path) => {
        const { dir, base } = splitTemplatePath(path)
        const uri = await getFolderUri(dir)
        deleteNoteFile(uri, base)
        notifyTemplatesChanged()
    }, [getFolderUri, deleteNoteFile])

    const addTemplate = useCallback(async (name, content = '', folder = '') => {
        const uri = await getFolderUri(folder)
        const existingNames = listMarkdownFiles(uri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, name, null)

        writeNoteFile(uri, filename, content)
        notifyTemplatesChanged()
        return joinTemplatePath(folder, filename)
    }, [getFolderUri, listMarkdownFiles, writeNoteFile])

    const importTemplate = useCallback(async (fileUri, name, folder = '') => {
        const file = new File(fileUri)
        const content = await file.text()
        const title = (name || file.name).replace(TEMPLATE_FILE_EXTENSION_PATTERN, '')

        return addTemplate(title, content, folder)
    }, [addTemplate])

    const addTemplateFolder = useCallback(async (name, parent = '') => {
        const uri = await getFolderUri(parent)
        const folderName = sanitizeFilename(name)

        if (!findDirectory(uri, folderName)) createSubdirectory(uri, folderName)
        notifyTemplatesChanged()

        return joinTemplatePath(parent, folderName)
    }, [getFolderUri, findDirectory, createSubdirectory])

    return {
        listTemplates,
        listTemplateFolders,
        getTemplate,
        getFolderUri,
        updateTemplate,
        deleteTemplate,
        addTemplate,
        importTemplate,
        addTemplateFolder
    }
}
