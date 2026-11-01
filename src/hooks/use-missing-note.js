import { useCallback, useMemo, useState } from 'react'

import { useNotes } from './use-notes'
import { useRepositories } from './use-repositories'
import { getEditorPath } from '@/utils/editor-path'
import { getDate } from '@/utils/date'
import { buildRepositoryPaths } from '@/utils/note-path'
import { pushOnce } from '@/utils/navigation'

export function useMissingNote() {
    const { saveNote } = useNotes()
    const { repositories, activeRepositoryTree } = useRepositories()

    const [missing, setMissing] = useState(null)

    const dismiss = useCallback(() => setMissing(null), [])

    const create = useCallback(async () => {
        const now = getDate()
        const repositoryPaths = buildRepositoryPaths(repositories)

        const targetRepository = activeRepositoryTree.find((repository) => (
            (repositoryPaths.get(repository.id) || '') === missing.path
        ))

        const { path } = await saveNote({
            title: missing.title,
            note: '',
            tags: [],
            createdAt: now,
            updatedAt: now
        }, targetRepository?.id)

        pushOnce(getEditorPath(path))
    }, [missing, repositories, activeRepositoryTree, saveNote])

    return useMemo(
        () => ({ missing, setMissing, dismiss, create }),
        [missing, dismiss, create]
    )
}
