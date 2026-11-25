import { repositoryEngine } from '@/shared/utils/repository-engine'

import { splitBody } from '@/shared/utils/note-body-of'

import { NOTE_READ_BATCH_SIZE } from '@/shared/constants/file-storage'
import {
    NOTE_BODY_CACHE_MAX_NOTES,
    NOTE_BODY_KEY_SEPARATOR,
    NOTE_BODY_PIN_MAX_NOTES
} from '@/shared/constants/note-body'

const getKey = (note) => `${note.path}${NOTE_BODY_KEY_SEPARATOR}${note.updatedAt}`

export const createNoteBodyLoader = ({
    readTextFiles,
    maxNotes = NOTE_BODY_CACHE_MAX_NOTES,
    maxPinned = NOTE_BODY_PIN_MAX_NOTES
}) => {
    const cache = new Map()
    const pinned = new Map()

    const pin = (note, body) => {
        pinned.delete(note.path)
        pinned.set(note.path, { updatedAt: note.updatedAt, body })

        while (pinned.size > maxPinned) pinned.delete(pinned.keys().next().value)
    }

    const peek = (note) => {
        if (note.note !== undefined) return note.note

        const entry = pinned.get(note.path)

        return entry?.updatedAt === note.updatedAt ? entry.body : undefined
    }

    const remember = (key, body) => {
        cache.delete(key)
        cache.set(key, body)

        while (cache.size > maxNotes) cache.delete(cache.keys().next().value)
    }

    const readMissing = async (missing, bodies) => {
        for (let start = 0; start < missing.length; start += NOTE_READ_BATCH_SIZE) {
            const batch = missing.slice(start, start + NOTE_READ_BATCH_SIZE)
            const texts = await readTextFiles(batch.map((note) => note.fileUri))

            batch.forEach((note, index) => {
                const body = texts[index] == null ? '' : splitBody(texts[index])

                remember(getKey(note), body)
                bodies.set(note.path, body)
            })
        }
    }

    const load = async (notes) => {
        const bodies = new Map()
        const missing = []

        for (const note of notes) {
            const key = getKey(note)
            const known = peek(note)

            if (known !== undefined) {
                bodies.set(note.path, known)
            } else if (cache.has(key)) {
                bodies.set(note.path, cache.get(key))
                remember(key, cache.get(key))
            } else {
                missing.push(note)
            }
        }

        await readMissing(missing, bodies)

        return bodies
    }

    const get = async (note) => (await load([note])).get(note.path)

    return { load, get, pin, peek }
}

export const noteBodies = createNoteBodyLoader({
    readTextFiles: (uris) => repositoryEngine.readTextFiles(uris)
})
