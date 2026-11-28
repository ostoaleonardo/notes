import { repositoryEngine } from '@/shared/utils/repository-engine'
import { getAliases } from '@/shared/utils/wiki-links'

export const renameLinksInBodies = ({
    notes,
    notePaths,
    resolvePaths = null,
    targetPath,
    newTitle,
    bodies
}) => (
    repositoryEngine.renameLinksInBodies(
        notes.map((note) => note.title || ''),
        notes.map(getAliases),
        notes.map((note) => note.path),
        Object.fromEntries(notePaths),
        resolvePaths && Object.fromEntries(resolvePaths),
        targetPath,
        newTitle,
        bodies
    )
)
