import { randomUUID } from 'expo-crypto'

import { applyLineDelta, buildLineDelta } from './line-delta'
import { buildVersionKey } from './note-version-location'

import { MAX_STORED_VERSIONS } from '@/constants/default-values'

const EMPTY_STORE = { head: '', entries: [] }

export const packVersions = (versions) => {
    if (versions.length === 0) return EMPTY_STORE

    const lastIndex = versions.length - 1

    return {
        head: versions[lastIndex].content,
        entries: versions.map(({ id, title, createdAt }, index) => ({
            id,
            title,
            createdAt,
            delta: index === lastIndex
                ? null
                : buildLineDelta(versions[index + 1].content, versions[index].content)
        }))
    }
}

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

export const commitNoteVersion = async (fileStorage, location, filename, title, content) => {
    if (!fileStorage.findFile(location.folderUri, filename)) return false

    const key = buildVersionKey(location.folderPath, filename)
    const raw = await fileStorage.readVersions(location.rootUri, key)
    const store = Array.isArray(raw) ? packVersions(raw) : raw
    const last = store.entries[store.entries.length - 1]

    if (last && last.title === title && store.head === content) return false

    const previous = last
        ? [...store.entries.slice(0, -1), { ...last, delta: buildLineDelta(content, store.head) }]
        : []

    fileStorage.writeVersions(location.rootUri, key, {
        head: content,
        entries: [...previous, { id: randomUUID(), title, createdAt: Date.now(), delta: null }]
            .slice(-MAX_STORED_VERSIONS)
    })

    return true
}
