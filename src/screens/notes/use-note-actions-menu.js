import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'
import { MenuItem } from '@/components'
import { useFiles, useIconProps, useNotes, useUtils } from '@/hooks'
import { Code, Commit, Delete, FileExport, Keep, KeepFilled } from '@/icons'

export const useNoteActionsMenu = ({ onClose, onSetMode, onOpenVersionHistory }) => {
    const iconProps = useIconProps()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()

    const { exportFile } = useFiles()
    const { pinned, updatePinned } = useUtils()
    const [isPinned, setIsPinned] = useState(pinned.has(slug))

    const { deleteNote, paramId, setParamId } = useNotes()

    const runAndClose = (action) => () => {
        onClose?.()
        action?.()
    }

    const toggleKeep = runAndClose(() => {
        if (pinned.has(slug)) {
            pinned.delete(slug)
        } else {
            pinned.add(slug)
        }

        setIsPinned(pinned.has(slug))
        updatePinned(new Set(pinned))
    })

    const onDelete = runAndClose(() => {
        deleteNote(paramId || slug)
        setParamId('')
        router.back()
    })

    return (
        <>
            <MenuItem
                title={t('button.code')}
                leadingIcon={() => <Code {...iconProps} />}
                onPress={runAndClose(() => onSetMode('code'))}
            />
            <MenuItem
                title={isPinned ? t('button.unpin') : t('button.pin')}
                leadingIcon={() => (isPinned ? <KeepFilled {...iconProps} /> : <Keep {...iconProps} />)}
                onPress={toggleKeep}
            />
            {slug && (
                <MenuItem
                    title={t('button.export')}
                    leadingIcon={() => <FileExport {...iconProps} />}
                    onPress={runAndClose(() => exportFile(slug))}
                />
            )}
            <MenuItem
                title={t('title.version_history')}
                leadingIcon={() => <Commit {...iconProps} />}
                onPress={runAndClose(onOpenVersionHistory)}
            />
            <MenuItem
                title={t('button.delete')}
                leadingIcon={() => <Delete {...iconProps} />}
                onPress={onDelete}
            />
        </>
    )
}
