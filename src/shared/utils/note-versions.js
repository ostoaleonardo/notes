import { applyLineDelta } from './line-delta'
import { buildVersionKey } from './note-version-location'

export const unpackVersions = (raw, limit = Infinity) => {
    if (Array.isArray(raw)) return raw.slice(-limit)

    const { head, entries } = raw
    const stop = Math.max(0, entries.length - limit)
    const versions = []
    let content = head

    for (let index = entries.length - 1; index >= stop; index--) {
        const { id, title, createdAt } = entries[index]
        versions.push({ id, title, createdAt, content })

        if (index > stop) content = applyLineDelta(content, entries[index - 1].delta)
    }

    return versions.reverse()
}

export const loadNoteVersions = async (fileStorage, location, filename, limit) => {
    const key = buildVersionKey(location.folderPath, filename)
    return unpackVersions(await fileStorage.readVersions(location.rootUri, key), limit)
}

export const commitNoteVersion = async (fileStorage, location, filename, title, content, limits) => {
    if (!fileStorage.findFile(location.folderUri, filename)) return false

    return fileStorage.commitVersion(
        location.rootUri,
        buildVersionKey(location.folderPath, filename),
        title,
        content,
        limits
    )
}
