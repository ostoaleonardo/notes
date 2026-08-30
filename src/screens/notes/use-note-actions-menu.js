import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'
import { MenuItem } from '@/components'
import { useFiles, useIconProps, useNotes, useUtils } from '@/hooks'
import { Code, Delete, FileExport, Keep, KeepFilled, Lock, Shapes, Tag, Unlock } from '@/icons'

export const useNoteActionsMenu = ({ onClose, onSetMode, onOpenTags, onOpenTemplates, onOpenPassword, hasPassword }) => {
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
                title={t('title.templates')}
                leadingIcon={() => <Shapes {...iconProps} />}
                onPress={runAndClose(onOpenTemplates)}
            />
            <MenuItem
                title={t('title.tags')}
                leadingIcon={() => <Tag {...iconProps} />}
                onPress={runAndClose(onOpenTags)}
            />
            <MenuItem
                title={t('button.delete')}
                leadingIcon={() => <Delete {...iconProps} />}
                onPress={onDelete}
            />
            {slug && (
                <MenuItem
                    title={t('button.export')}
                    leadingIcon={() => <FileExport {...iconProps} />}
                    onPress={runAndClose(() => exportFile(slug))}
                />
            )}
            <MenuItem
                title={hasPassword ? t('password.remove') : t('button.lock')}
                leadingIcon={() => (hasPassword ? <Lock {...iconProps} /> : <Unlock {...iconProps} />)}
                onPress={runAndClose(onOpenPassword)}
            />
            <MenuItem
                title={isPinned ? t('button.unpin') : t('button.pin')}
                leadingIcon={() => (isPinned ? <KeepFilled {...iconProps} /> : <Keep {...iconProps} />)}
                onPress={toggleKeep}
            />
        </>
    )
}
