import { useCallback, useMemo, useState } from 'react'

import { useNotes } from './use-notes'
import { useFolders } from './use-folders'
import { getEditorPath } from '@/shared/utils/editor-path'
import { getDate } from '@/shared/utils/date'
import { buildFolderPaths } from '@/shared/utils/note-path'
import { pushOnce } from '@/shared/utils/navigation'

export function useMissingNote() {
    const { saveNote } = useNotes()
    const { folders, activeFolderTree } = useFolders()

    const [missing, setMissing] = useState(null)

    const dismiss = useCallback(() => setMissing(null), [])

    const create = useCallback(async () => {
        const now = getDate()
        const folderPaths = buildFolderPaths(folders)

        const targetFolder = activeFolderTree.find((folder) => (
            (folderPaths.get(folder.id) || '') === missing.path
        ))

        const { path } = await saveNote({
            title: missing.title,
            note: '',
            tags: [],
            createdAt: now,
            updatedAt: now
        }, targetFolder?.id)

        pushOnce(getEditorPath(path))
    }, [missing, folders, activeFolderTree, saveNote])

    return useMemo(
        () => ({ missing, setMissing, dismiss, create }),
        [missing, dismiss, create]
    )
}
