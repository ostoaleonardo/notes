import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams } from 'expo-router'

import { useCommonActionsMenu } from './use-common-actions-menu'
import { ActionMenuItem } from '@/ui/menu/action-menu-item'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useNotes } from '@/hooks/use-notes'
import { useUtils } from '@/hooks/use-utils'
import { useSingleFlight } from '@/hooks/use-single-flight'
import { toggleInSet } from '@/utils/toggle-in-set'
import { getDate } from '@/utils/date'
import { getEditorPath } from '@/utils/editor-path'
import { buildDuplicateNote } from '@/utils/duplicate-note'
import { pushOnce } from '@/utils/navigation'

import { Folder } from '@/icons/folder'
import { FormatListBulleted } from '@/icons/format-list-bulleted'
import { Keep } from '@/icons/keep'
import { KeepFilled } from '@/icons/keep-filled'
import { NoteStack } from '@/icons/note-stack'
import { Share as ShareIcon } from '@/icons/share'
import { getMenuItemTestId } from '@/ui/utils/test-ids'

export const useNoteActionsMenu = ({
    onTrigger,
    onSetMode,
    onOpenVersionHistory,
    onOpenDetails,
    onOpenMove,
    onOpenSharingDialog,
    onOpenDeleteDialog
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

    const [onDuplicate] = useSingleFlight(async () => {
        const note = getNote(currentId)

        const duplicate = buildDuplicateNote(note, {
            createdAt: getDate(),
            copySuffix: t('notes.copy_suffix')
        })

        const { path } = await saveNote(duplicate, note.repositoryId)
        pushOnce(getEditorPath(path))
    })

    return [
        [
            common.code,
            <ActionMenuItem
                key='pin'
                testID={getMenuItemTestId('pin')}
                title={isPinned ? t('button.unpin') : t('button.pin')}
                icon={isPinned ? KeepFilled : Keep}
                action={toggleKeep}
                onTrigger={onTrigger}
            />,
            slug && (
                <ActionMenuItem
                    key='duplicate'
                    testID={getMenuItemTestId('duplicate')}
                    title={t('button.duplicate')}
                    icon={NoteStack}
                    action={onDuplicate}
                    onTrigger={onTrigger}
                />
            ),
            slug && (
                <ActionMenuItem
                    key='move'
                    testID={getMenuItemTestId('move')}
                    title={t('button.move')}
                    icon={Folder}
                    action={onOpenMove}
                    onTrigger={onTrigger}
                />
            ),
            slug && (
                <ActionMenuItem
                    key='sharing'
                    testID={getMenuItemTestId('sharing')}
                    title={t('button.export_share')}
                    icon={ShareIcon}
                    action={onOpenSharingDialog}
                    onTrigger={onTrigger}
                />
            ),
            <ActionMenuItem
                key='details'
                testID={getMenuItemTestId('details')}
                title={t('title.details')}
                icon={FormatListBulleted}
                action={onOpenDetails}
                onTrigger={onTrigger}
            />
        ].filter(Boolean),
        [common.remove]
    ]
}
