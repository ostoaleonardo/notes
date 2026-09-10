import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'

import { MenuItem } from '@/components/menu/menu-item'

import { useFiles } from '@/hooks/use-files'
import { useNotes } from '@/hooks/use-notes'
import { useUtils } from '@/hooks/use-utils'

import { Code } from '@/icons/code'
import { Commit } from '@/icons/commit'
import { Delete } from '@/icons/delete'
import { FileExport } from '@/icons/file-export'
import { Keep } from '@/icons/keep'
import { KeepFilled } from '@/icons/keep-filled'

export const useNoteActionsMenu = ({ onTrigger, onSetMode, onOpenVersionHistory }) => {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()

    const { exportFile } = useFiles()
    const { pinned, updatePinned } = useUtils()
    const [isPinned, setIsPinned] = useState(pinned.has(slug))

    const { deleteNote, paramId, setParamId } = useNotes()

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

    return (
        <>
            <MenuItem
                title={t('button.code')}
                leadingIcon={(props) => <Code {...props} />}
                onPress={() => onTrigger(() => onSetMode('code'))}
            />
            <MenuItem
                title={isPinned ? t('button.unpin') : t('button.pin')}
                leadingIcon={(props) => (isPinned ? <KeepFilled {...props} /> : <Keep {...props} />)}
                onPress={toggleKeep}
            />
            {slug && (
                <MenuItem
                    title={t('button.export')}
                    leadingIcon={(props) => <FileExport {...props} />}
                    onPress={() => onTrigger(() => exportFile(slug))}
                />
            )}
            <MenuItem
                title={t('title.version_history')}
                leadingIcon={(props) => <Commit {...props} />}
                onPress={() => onTrigger(onOpenVersionHistory)}
            />
            <MenuItem
                title={t('button.delete')}
                leadingIcon={(props) => <Delete {...props} />}
                onPress={onDelete}
            />
        </>
    )
}
