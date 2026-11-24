import RepositoryFs from 'repository-fs'

import { buildNotePath } from '@/shared/utils/note-path'

const createIndexCoverage = ({ listIndexedNotes }) => {
    let covered = new WeakSet()

    const refresh = async (notes) => {
        const { folderIds, filenames, modified } = await listIndexedNotes()
        const indexed = new Map(filenames.map((filename, index) => [
            buildNotePath(folderIds[index], filename),
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
