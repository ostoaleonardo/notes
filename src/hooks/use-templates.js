import { File } from 'expo-file-system'
import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { getUniqueFilename } from '@/utils'

export function useTemplates() {
    const { activeRepository, ensureTemplatesFolder } = useRepositories()
    const {
        findFile,
        listMarkdownFiles,
        writeNoteFile,
        renameNoteFile,
        deleteNoteFile
    } = useFileStorage()

    const getTemplatesUri = async () => {
        if (!activeRepository) return null
        return await ensureTemplatesFolder(activeRepository)
    }

    const listTemplates = async () => {
        const uri = await getTemplatesUri()
        if (!uri) return []

        const files = listMarkdownFiles(uri)

        return Promise.all(files.map(async (file) => ({
            filename: file.name,
            name: file.name.replace(/\.md$/i, ''),
            content: await file.text()
        })))
    }

    const getTemplate = async (filename) => {
        const uri = await getTemplatesUri()
        if (!uri) return null

        const file = findFile(uri, filename)
        if (!file) return null

        return { filename, name: filename.replace(/\.md$/i, ''), content: await file.text() }
    }

    const updateTemplate = async (currentFilename, name, content) => {
        const uri = await getTemplatesUri()
        const existingNames = listMarkdownFiles(uri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, name, currentFilename)

        if (filename !== currentFilename) {
            await renameNoteFile(uri, currentFilename, filename)
        }

        writeNoteFile(uri, filename, content)
        return filename
    }

    const deleteTemplate = async (filename) => {
        const uri = await getTemplatesUri()
        deleteNoteFile(uri, filename)
    }

    const addTemplate = async (name, content = '') => {
        const uri = await getTemplatesUri()
        const existingNames = listMarkdownFiles(uri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, name, null)

        writeNoteFile(uri, filename, content)
        return filename
    }

    const importTemplate = async (fileUri, name) => {
        const file = new File(fileUri)
        const content = await file.text()
        const title = (name || file.name).replace(/\.(md|markdown|txt)$/i, '')

        return addTemplate(title, content)
    }

    return {
        listTemplates,
        getTemplate,
        updateTemplate,
        deleteTemplate,
        addTemplate,
        importTemplate
    }
}
