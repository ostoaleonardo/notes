import { randomUUID } from 'expo-crypto'

export const loadNoteVersions = (fileStorage, directoryUri, noteId) => (
    fileStorage.readVersions(directoryUri, noteId)
)

export const commitNoteVersion = async (fileStorage, directoryUri, noteId, title, content) => {
    const versions = await fileStorage.readVersions(directoryUri, noteId)
    const last = versions[versions.length - 1]

    if (last && last.title === title && last.content === content) return versions

    const next = [...versions, { id: randomUUID(), title, content, createdAt: Date.now() }]
    fileStorage.writeVersions(directoryUri, noteId, next)

    return next
}
