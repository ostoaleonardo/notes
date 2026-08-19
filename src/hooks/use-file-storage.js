import { Directory, File } from 'expo-file-system'

const METADATA_FILENAME = '.notes-meta.json'
export const CATEGORIES_FILENAME = '.categories.json'
export const TRASH_FILENAME = '.trash.json'

const SIDECAR_FILENAMES = [METADATA_FILENAME, CATEGORIES_FILENAME, TRASH_FILENAME]

export function useFileStorage() {
    const listEntries = (directoryUri) => new Directory(directoryUri).list()

    const findFile = (directoryUri, filename) => (
        listEntries(directoryUri).find((entry) => (
            entry instanceof File && entry.name === filename
        ))
    )

    const listMarkdownFiles = (directoryUri) => (
        listEntries(directoryUri).filter((entry) => (
            entry instanceof File &&
            !SIDECAR_FILENAMES.includes(entry.name) &&
            entry.name.toLowerCase().endsWith('.md')
        ))
    )

    const writeNoteFile = (directoryUri, filename, content, mimeType = 'text/markdown') => {
        const existing = findFile(directoryUri, filename)
        if (existing) existing.delete()

        const file = new Directory(directoryUri).createFile(filename, mimeType)
        file.write(content)
        return file
    }

    const renameNoteFile = async (directoryUri, oldFilename, newFilename) => {
        const file = findFile(directoryUri, oldFilename)
        if (!file) return

        const content = await file.text()
        writeNoteFile(directoryUri, newFilename, content)
        file.delete()
    }

    const deleteNoteFile = (directoryUri, filename) => {
        const file = findFile(directoryUri, filename)
        if (file) file.delete()
    }

    const clearFolder = (directoryUri) => {
        listMarkdownFiles(directoryUri).forEach((file) => file.delete())
        SIDECAR_FILENAMES.forEach((filename) => deleteNoteFile(directoryUri, filename))
    }

    const readJson = async (directoryUri, filename, fallback) => {
        const file = findFile(directoryUri, filename)
        if (!file) return fallback

        try {
            return JSON.parse(await file.text())
        } catch {
            return fallback
        }
    }

    const writeJson = (directoryUri, filename, data) => {
        writeNoteFile(directoryUri, filename, JSON.stringify(data), 'application/json')
    }

    const readMetadata = (directoryUri) => readJson(directoryUri, METADATA_FILENAME, {})
    const writeMetadata = (directoryUri, metadata) => writeJson(directoryUri, METADATA_FILENAME, metadata)

    return {
        listMarkdownFiles,
        writeNoteFile,
        renameNoteFile,
        deleteNoteFile,
        clearFolder,
        readMetadata,
        writeMetadata,
        readJson,
        writeJson
    }
}
