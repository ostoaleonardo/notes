import RepositoryFs from 'repository-fs'

import { buildNotePath } from '@/shared/utils/note-path'

export const createIndexCoverage = ({ listIndexedNotes }) => {
    let covered = new WeakSet()

    const refresh = async (notes) => {
        const { repositoryIds, filenames, modified } = await listIndexedNotes()
        const indexed = new Map(filenames.map((filename, index) => [
            buildNotePath(repositoryIds[index], filename),
            modified[index]
        ]))

        covered = new WeakSet(notes.filter((note) => indexed.get(note.path) === note.updatedAt))
    }

    const isCovered = (note) => covered.has(note)

    return { refresh, isCovered }
}

export const indexCoverage = createIndexCoverage({
    listIndexedNotes: () => RepositoryFs.listIndexedNotes()
})
