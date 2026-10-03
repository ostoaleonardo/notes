import { useCallback, useState } from 'react'
import { router } from 'expo-router'

import { useNotes } from './use-notes'
import { useRepositories } from './use-repositories'
import { getEditorPath } from '@/utils/editor-path'
import { getDate } from '@/utils/date'
import { buildRepositoryPaths } from '@/utils/note-path'

export function useMissingNote() {
    const { saveNote } = useNotes()
    const { repositories } = useRepositories()

    const [missing, setMissing] = useState(null)

    const dismiss = useCallback(() => setMissing(null), [])

    const create = useCallback(async () => {
        const now = getDate()
        const repositoryPaths = buildRepositoryPaths(repositories)

        const targetRepository = repositories.find((repository) => (
            (repositoryPaths.get(repository.id) || '') === missing.path
        ))

        const { path } = await saveNote({
            title: missing.title,
            note: '',
            tags: [],
            createdAt: now,
            updatedAt: now
        }, targetRepository?.id)

        router.push(getEditorPath(path))
    }, [missing, repositories, saveNote])

    return { missing, setMissing, dismiss, create }
}
