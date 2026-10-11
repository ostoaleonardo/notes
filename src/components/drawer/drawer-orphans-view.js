import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DrawerLinkList } from './drawer-link-list'
import { openEditor } from './drawer-open-editor'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useNotes } from '@/hooks/use-notes'
import { buildLinkGraph, findOrphanNotes } from '@/utils/link-graph'
import { stripNoteExtension } from '@/utils/note-filename'

export function DrawerOrphansView({ closeDrawer }) {
    const { t } = useTranslation()
    const { notes, notePaths } = useNotes()
    const { currentId } = useCurrentNote()

    const rows = useMemo(() => (
        findOrphanNotes(notes, buildLinkGraph(notes, notePaths)).map((note) => ({
            id: note.path,
            title: note.title || stripNoteExtension(note.filename),
            caption: notePaths.get(note.path) || ''
        }))
    ), [notes, notePaths])

    const onPress = useCallback((row) => {
        closeDrawer()
        if (row.id !== currentId) openEditor(row.id, currentId)
    }, [closeDrawer, currentId])

    return (
        <DrawerLinkList
            rows={rows}
            onPress={onPress}
            emptyMessage={t('message.orphans.empty')}
        />
    )
}
