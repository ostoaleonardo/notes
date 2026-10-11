import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DrawerLinkList } from './drawer-link-list'
import { MissingNoteDialog } from '@/components/missing-note-dialog'

import { useMissingNote } from '@/hooks/use-missing-note'
import { useNotes } from '@/hooks/use-notes'
import { buildLinkGraph, listUnresolvedLinks } from '@/utils/link-graph'

export function DrawerUnresolvedView({ closeDrawer }) {
    const { t } = useTranslation()
    const { notes, notePaths } = useNotes()
    const missingNote = useMissingNote()
    const { setMissing, create } = missingNote

    const rows = useMemo(() => (
        listUnresolvedLinks(buildLinkGraph(notes, notePaths)).map((link) => ({
            id: link.id,
            title: link.title,
            caption: t('count.notes', { count: link.count })
        }))
    ), [notes, notePaths, t])

    const onPress = useCallback((row) => setMissing({ title: row.title, path: '' }), [setMissing])

    const onConfirm = useCallback(async () => {
        closeDrawer()
        await create()
    }, [closeDrawer, create])

    return (
        <>
            <DrawerLinkList
                rows={rows}
                onPress={onPress}
                emptyMessage={t('message.unresolved.empty')}
            />

            <MissingNoteDialog
                missing={missingNote.missing}
                onDismiss={missingNote.dismiss}
                onConfirm={onConfirm}
            />
        </>
    )
}
