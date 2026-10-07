import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'

import { useCommonActionsMenu } from './use-common-actions-menu'
import { ActionMenuItem } from '@/components/menu/action-menu-item'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useNotes } from '@/hooks/use-notes'
import { useUtils } from '@/hooks/use-utils'
import { toggleInSet } from '@/utils/toggle-in-set'
import { getDate } from '@/utils/date'
import { getEditorPath } from '@/utils/editor-path'
import { buildDuplicateNote } from '@/utils/duplicate-note'

import { FormatListBulleted } from '@/icons/format-list-bulleted'
import { Keep } from '@/icons/keep'
import { KeepFilled } from '@/icons/keep-filled'
import { Link } from '@/icons/link'
import { NoteStack } from '@/icons/note-stack'
import { OpenInNew } from '@/icons/open-in-new'
import { Share as ShareIcon } from '@/icons/share'

export const useNoteActionsMenu = ({
    onTrigger,
    onSetMode,
    onOpenVersionHistory,
    onOpenOutline,
    onOpenOutgoingLinks,
    onOpenSharingDialog,
    onOpenDeleteDialog,
    showBacklinks,
    onToggleShowBacklinks
}) => {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { currentId } = useCurrentNote()

    const { pinned, updatePinned } = useUtils()
    const [isPinned, setIsPinned] = useState(pinned.has(slug))

    const { getNote, saveNote } = useNotes()

    const common = useCommonActionsMenu({
        onTrigger,
        onSetMode,
        onOpenVersionHistory,
        onOpenDeleteDialog
    })

    const toggleKeep = useCallback(() => {
        const next = toggleInSet(pinned, currentId)

        setIsPinned(next.has(currentId))
        updatePinned(next)
    }, [pinned, currentId, updatePinned])

    const onDuplicate = useCallback(async () => {
        const note = getNote(currentId)

        const duplicate = buildDuplicateNote(note, {
            createdAt: getDate(),
            copySuffix: t('notes.copy_suffix')
        })

        const { path } = await saveNote(duplicate, note.repositoryId)
        router.push(getEditorPath(path))
    }, [getNote, currentId, saveNote, t])

    return [
        [
            common.code,
            <ActionMenuItem
                key='outline'
                title={t('title.outline')}
                icon={FormatListBulleted}
                action={onOpenOutline}
                onTrigger={onTrigger}
            />,
            <ActionMenuItem
                key='outgoing-links'
                title={t('title.outgoing_links')}
                icon={OpenInNew}
                action={onOpenOutgoingLinks}
                onTrigger={onTrigger}
            />,
            slug && (
                <ActionMenuItem
                    key='backlinks'
                    title={showBacklinks ? t('button.hide_backlinks') : t('button.show_backlinks')}
                    icon={Link}
                    action={onToggleShowBacklinks}
                    onTrigger={onTrigger}
                />
            )
        ].filter(Boolean),
        [
            <ActionMenuItem
                key='pin'
                title={isPinned ? t('button.unpin') : t('button.pin')}
                icon={isPinned ? KeepFilled : Keep}
                action={toggleKeep}
                onTrigger={onTrigger}
            />,
            slug && (
                <ActionMenuItem
                    key='duplicate'
                    title={t('button.duplicate')}
                    icon={NoteStack}
                    action={onDuplicate}
                    onTrigger={onTrigger}
                />
            ),
            slug && (
                <ActionMenuItem
                    key='sharing'
                    title={t('button.export_share')}
                    icon={ShareIcon}
                    action={onOpenSharingDialog}
                    onTrigger={onTrigger}
                />
            ),
            common.versionHistory
        ].filter(Boolean),
        [common.remove]
    ]
}
