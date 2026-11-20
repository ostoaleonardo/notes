import RepositoryFs from 'repository-fs'

import { indexCoverage } from '@/shared/utils/index-coverage'
import { noteBodies } from '@/shared/utils/note-body'
import { buildNotePath } from '@/shared/utils/note-path'
import { findBacklinks as scanBacklinks, getAliases } from '@/shared/utils/wiki-links'

import { LINK_INDEX_MIN_NOTES, LINK_INDEX_UNCOVERED_RATIO } from '@/shared/constants/link-index'

const getNames = (target) => (
    [target.title, ...getAliases(target)].filter((name) => typeof name === 'string' && name.trim())
)

export const createLinkIndex = ({
    coverage,
    backlinkCandidates,
    mentionCandidates,
    loadBodies = async () => undefined
}) => {
    const selectPool = async (notes, fetchRefs) => {
        if (notes.length < LINK_INDEX_MIN_NOTES) return null

        const uncovered = notes.filter((note) => !coverage.isCovered(note))
        if (uncovered.length > notes.length * LINK_INDEX_UNCOVERED_RATIO) return null

        let refs = null

        try {
            refs = await fetchRefs()
        } catch {
            return null
        }

        if (!refs) return null

        const pool = new Set(uncovered.map((note) => note.path))
        refs.folderIds.forEach((folderId, index) => {
            pool.add(buildNotePath(folderId, refs.filenames[index]))
        })

        return pool
    }

    const findBacklinks = async (target, notes, notePaths) => {
        const names = getNames(target)
        const pool = names.length
            ? await selectPool(notes, () => backlinkCandidates(names, target.path))
            : null
        const candidates = pool ? notes.filter((note) => pool.has(note.path)) : notes

        const bodies = await loadBodies(candidates)

        return scanBacklinks(target.path, notes, notePaths, candidates, bodies)
    }

    return { findBacklinks, selectPool, mentionCandidates, loadBodies }
}

export const linkIndex = createLinkIndex({
    coverage: indexCoverage,
    backlinkCandidates: (names, path) => RepositoryFs.findBacklinkCandidates(names, path),
    mentionCandidates: (terms) => RepositoryFs.findMentionCandidates(terms),
    loadBodies: noteBodies.load
})
