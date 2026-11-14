import { useCallback, useMemo, useState } from 'react'
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
import { findAdjacentDailyNote, pickRandomNote } from '@/utils/daily-note'
import { pushOnce } from '@/utils/navigation'

import { ArrowBack } from '@/icons/arrow-back'
import { ArrowForward } from '@/icons/arrow-forward'
import { Folder } from '@/icons/folder'
import { FormatListBulleted } from '@/icons/format-list-bulleted'
import { Keep } from '@/icons/keep'
import { KeepFilled } from '@/icons/keep-filled'
import { NoteStack } from '@/icons/note-stack'
import { Share as ShareIcon } from '@/icons/share'
import { Shuffle } from '@/icons/shuffle'
import { getMenuItemTestId } from '@/ui/utils/test-ids'

import { DAILY_DIRECTIONS } from '@/constants/daily-note'

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

    const { notes, getNote, saveNote } = useNotes()

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

    const current = getNote(currentId)
    const previousDaily = useMemo(
        () => findAdjacentDailyNote(notes, current, DAILY_DIRECTIONS.PREVIOUS),
        [notes, current]
    )
    const nextDaily = useMemo(
        () => findAdjacentDailyNote(notes, current, DAILY_DIRECTIONS.NEXT),
        [notes, current]
    )

    const openNote = useCallback((note) => note && pushOnce(getEditorPath(note.path)), [])
    const onOpenPreviousDaily = useCallback(() => openNote(previousDaily), [openNote, previousDaily])
    const onOpenNextDaily = useCallback(() => openNote(nextDaily), [openNote, nextDaily])
    const onOpenRandom = useCallback(() => openNote(pickRandomNote(notes, currentId)), [openNote, notes, currentId])

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
            previousDaily && (
                <ActionMenuItem
                    key='previous-daily'
                    testID={getMenuItemTestId('previous-daily')}
                    title={t('button.previous_daily')}
                    icon={ArrowBack}
                    action={onOpenPreviousDaily}
                    onTrigger={onTrigger}
                />
            ),
            nextDaily && (
                <ActionMenuItem
                    key='next-daily'
                    testID={getMenuItemTestId('next-daily')}
                    title={t('button.next_daily')}
                    icon={ArrowForward}
                    action={onOpenNextDaily}
                    onTrigger={onTrigger}
                />
            ),
            <ActionMenuItem
                key='random'
                testID={getMenuItemTestId('random')}
                title={t('button.random_note')}
                icon={Shuffle}
                action={onOpenRandom}
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
