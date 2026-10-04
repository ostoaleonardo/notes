import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'

import { MenuItem } from '@/components/menu/menu-item'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useNotes } from '@/hooks/use-notes'
import { useUtils } from '@/hooks/use-utils'
import { getDate } from '@/utils/date'
import { getEditorPath } from '@/utils/editor-path'
import { buildDuplicateNote } from '@/utils/duplicate-note'

import { Code } from '@/icons/code'
import { Commit } from '@/icons/commit'
import { Delete } from '@/icons/delete'
import { Keep } from '@/icons/keep'
import { KeepFilled } from '@/icons/keep-filled'
import { FormatListBulleted } from '@/icons/format-list-bulleted'
import { Link } from '@/icons/link'
import { NoteStack } from '@/icons/note-stack'
import { Share as ShareIcon } from '@/icons/share'

import { EDITOR_MODES } from '@/constants/editor-modes'

export const useNoteActionsMenu = ({
    onTrigger,
    onSetMode,
    onOpenVersionHistory,
    onOpenOutline,
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

    const toggleKeep = () => onTrigger(() => {
        if (pinned.has(currentId)) {
            pinned.delete(currentId)
        } else {
            pinned.add(currentId)
        }

        setIsPinned(pinned.has(currentId))
        updatePinned(new Set(pinned))
    })

    const onDuplicate = () => onTrigger(async () => {
        const note = getNote(currentId)

        const duplicate = buildDuplicateNote(note, {
            createdAt: getDate(),
            copySuffix: t('notes.copy_suffix')
        })

        const { path } = await saveNote(duplicate, note.repositoryId)
        router.push(getEditorPath(path))
    })

    return [
        [
            <MenuItem
                key='code'
                title={t('button.code')}
                leadingIcon={(props) => <Code {...props} />}
                onPress={() => onTrigger(() => onSetMode(EDITOR_MODES.CODE))}
            />,
            <MenuItem
                key='outline'
                title={t('title.outline')}
                leadingIcon={(props) => <FormatListBulleted {...props} />}
                onPress={() => onTrigger(onOpenOutline)}
            />,
            slug && (
                <MenuItem
                    key='backlinks'
                    title={showBacklinks ? t('button.hide_backlinks') : t('button.show_backlinks')}
                    leadingIcon={(props) => <Link {...props} />}
                    onPress={() => onTrigger(onToggleShowBacklinks)}
                />
            )
        ].filter(Boolean),
        [
            <MenuItem
                key='pin'
                title={isPinned ? t('button.unpin') : t('button.pin')}
                leadingIcon={(props) => (isPinned ? <KeepFilled {...props} /> : <Keep {...props} />)}
                onPress={toggleKeep}
            />,
            slug && (
                <MenuItem
                    key='duplicate'
                    title={t('button.duplicate')}
                    leadingIcon={(props) => <NoteStack {...props} />}
                    onPress={onDuplicate}
                />
            ),
            slug && (
                <MenuItem
                    key='sharing'
                    title={t('button.export_share')}
                    leadingIcon={(props) => <ShareIcon {...props} />}
                    onPress={() => onTrigger(onOpenSharingDialog)}
                />
            ),
            <MenuItem
                key='version-history'
                title={t('title.version_history')}
                leadingIcon={(props) => <Commit {...props} />}
                onPress={() => onTrigger(onOpenVersionHistory)}
            />
        ].filter(Boolean),
        [
            <MenuItem
                key='delete'
                title={t('button.delete')}
                leadingIcon={(props) => <Delete {...props} />}
                onPress={() => onTrigger(onOpenDeleteDialog)}
            />
        ]
    ]
}
