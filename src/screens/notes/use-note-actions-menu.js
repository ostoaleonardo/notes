import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'
import { randomUUID } from 'expo-crypto'

import { MenuItem } from '@/components/menu/menu-item'

import { useNotes } from '@/hooks/use-notes'
import { useUtils } from '@/hooks/use-utils'
import { getDate } from '@/utils/date'
import { getEditorPath } from '@/utils/editor-path'
import { buildDuplicateNote } from '@/utils/duplicate-note'

import { Code } from '@/icons/code'
import { Commit } from '@/icons/commit'
import { Delete } from '@/icons/delete'
import { FileExport } from '@/icons/file-export'
import { Keep } from '@/icons/keep'
import { KeepFilled } from '@/icons/keep-filled'
import { NoteStack } from '@/icons/note-stack'
import { Share as ShareIcon } from '@/icons/share'

export const useNoteActionsMenu = ({
    onTrigger,
    onSetMode,
    onOpenVersionHistory,
    onOpenExportDialog,
    onOpenShareDialog
}) => {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()

    const { pinned, updatePinned } = useUtils()
    const [isPinned, setIsPinned] = useState(pinned.has(slug))

    const { deleteNote, getNote, saveNote, paramId, setParamId } = useNotes()

    const toggleKeep = () => onTrigger(() => {
        if (pinned.has(slug)) {
            pinned.delete(slug)
        } else {
            pinned.add(slug)
        }

        setIsPinned(pinned.has(slug))
        updatePinned(new Set(pinned))
    })

    const onDelete = () => onTrigger(() => {
        deleteNote(paramId || slug)
        setParamId('')
        router.back()
    })

    const onDuplicate = () => onTrigger(() => {
        const note = getNote(paramId || slug)

        const duplicate = buildDuplicateNote(note, {
            id: randomUUID(),
            createdAt: getDate(),
            copySuffix: t('notes.copy_suffix')
        })

        saveNote(duplicate, note.repositoryId)
        router.push(getEditorPath(duplicate.id))
    })

    return [
        [
            <MenuItem
                key='code'
                title={t('button.code')}
                leadingIcon={(props) => <Code {...props} />}
                onPress={() => onTrigger(() => onSetMode('code'))}
            />,
            <MenuItem
                key='pin'
                title={isPinned ? t('button.unpin') : t('button.pin')}
                leadingIcon={(props) => (isPinned ? <KeepFilled {...props} /> : <Keep {...props} />)}
                onPress={toggleKeep}
            />,
            slug && (
                <MenuItem
                    key='export'
                    title={t('button.export')}
                    leadingIcon={(props) => <FileExport {...props} />}
                    onPress={() => onTrigger(onOpenExportDialog)}
                />
            ),
            slug && (
                <MenuItem
                    key='share'
                    title={t('button.share')}
                    leadingIcon={(props) => <ShareIcon {...props} />}
                    onPress={() => onTrigger(onOpenShareDialog)}
                />
            ),
            slug && (
                <MenuItem
                    key='duplicate'
                    title={t('button.duplicate')}
                    leadingIcon={(props) => <NoteStack {...props} />}
                    onPress={onDuplicate}
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
                onPress={onDelete}
            />
        ]
    ]
}
