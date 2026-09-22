import { useCallback } from 'react'
import { File } from 'expo-file-system'

import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { getUniqueFilename, stripNoteExtension } from '@/utils/note-filename'

export function useTemplates() {
    const { activeRepository, ensureTemplatesFolder } = useRepositories()
    const {
        findFile,
        listMarkdownFiles,
        writeNoteFile,
        renameNoteFile,
        deleteNoteFile
    } = useFileStorage()

    const getTemplatesUri = useCallback(async () => {
        if (!activeRepository) return null
        return await ensureTemplatesFolder(activeRepository)
    }, [activeRepository, ensureTemplatesFolder])

    const listTemplates = useCallback(async () => {
        const uri = await getTemplatesUri()
        if (!uri) return []

        const files = listMarkdownFiles(uri)

        return Promise.all(files.map(async (file) => ({
            filename: file.name,
            name: stripNoteExtension(file.name),
            content: await file.text()
        })))
    }, [getTemplatesUri, listMarkdownFiles])

    const getTemplate = useCallback(async (filename) => {
        const uri = await getTemplatesUri()
        if (!uri) return null

        const file = findFile(uri, filename)
        if (!file) return null

        return { filename, name: stripNoteExtension(filename), content: await file.text() }
    }, [getTemplatesUri, findFile])

    const updateTemplate = useCallback(async (currentFilename, name, content) => {
        const uri = await getTemplatesUri()
        const existingNames = listMarkdownFiles(uri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, name, currentFilename)

        if (filename !== currentFilename) {
            await renameNoteFile(uri, currentFilename, filename)
        }

        writeNoteFile(uri, filename, content)
        return filename
    }, [getTemplatesUri, listMarkdownFiles, renameNoteFile, writeNoteFile])

    const deleteTemplate = useCallback(async (filename) => {
        const uri = await getTemplatesUri()
        deleteNoteFile(uri, filename)
    }, [getTemplatesUri, deleteNoteFile])

    const addTemplate = useCallback(async (name, content = '') => {
        const uri = await getTemplatesUri()
        const existingNames = listMarkdownFiles(uri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, name, null)

        writeNoteFile(uri, filename, content)
        return filename
    }, [getTemplatesUri, listMarkdownFiles, writeNoteFile])

    const importTemplate = useCallback(async (fileUri, name) => {
        const file = new File(fileUri)
        const content = await file.text()
        const title = (name || file.name).replace(/\.(md|markdown|txt)$/i, '')

        return addTemplate(title, content)
    }, [addTemplate])

    return {
        listTemplates,
        getTemplate,
        updateTemplate,
        deleteTemplate,
        addTemplate,
        importTemplate
    }
}
