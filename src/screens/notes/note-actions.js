import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'
import { IconButton, Tooltip } from 'react-native-paper'
import { MenuContainer, MenuItem } from '@/components'
import { useFiles, useIconProps, useNotes, useUtils } from '@/hooks'
import { Delete, FileExport, Keep, KeepFilled, Lock, Shapes, Tag, Unlock } from '@/icons'

export function NoteActions({ onOpenPassword, hasPassword, onOpenTags, onOpenTemplates, onSaveAsTemplate }) {
    const iconProps = useIconProps()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()

    const [templatesVisible, setTemplatesVisible] = useState(false)

    const { exportFile } = useFiles()
    const { pinned, updatePinned } = useUtils()
    const [isPinned, setIsPinned] = useState(pinned.has(slug))

    const {
        deleteNote,
        paramId, setParamId
    } = useNotes()

    const goToHome = () => router.back()

    const toggleKeep = () => {
        if (pinned.has(slug)) {
            pinned.delete(slug)
        } else {
            pinned.add(slug)
        }

        setIsPinned(pinned.has(slug))
        updatePinned(new Set(pinned))
    }

    const onDelete = () => {
        deleteNote(paramId || slug)
        setParamId('')
        goToHome()
    }

    const runFromTemplates = (action) => {
        setTemplatesVisible(false)
        action()
    }

    return (
        <>
            <Tooltip title={t('title.tags')}>
                <IconButton
                    onPress={onOpenTags}
                    icon={() => <Tag {...iconProps} />}
                />
            </Tooltip>

            <MenuContainer
                visible={templatesVisible}
                onClose={() => setTemplatesVisible(false)}
                anchor={
                    <Tooltip title={t('drawer.templates')}>
                        <IconButton
                            onPress={() => setTemplatesVisible(true)}
                            icon={() => <Shapes {...iconProps} />}
                        />
                    </Tooltip>
                }
            >
                <MenuItem
                    title={t('templates.insert')}
                    leadingIcon={() => <Shapes {...iconProps} />}
                    onPress={() => runFromTemplates(onOpenTemplates)}
                />
                <MenuItem
                    title={t('templates.save_as_template')}
                    leadingIcon={() => <Shapes {...iconProps} />}
                    onPress={() => runFromTemplates(onSaveAsTemplate)}
                />
            </MenuContainer>

            <Tooltip title={isPinned ? t('button.unpin') : t('button.pin')}>
                <IconButton
                    onPress={toggleKeep}
                    icon={() => (isPinned ? <KeepFilled {...iconProps} /> : <Keep {...iconProps} />)}
                />
            </Tooltip>

            <Tooltip title={hasPassword ? t('password.remove') : t('button.lock')}>
                <IconButton
                    onPress={onOpenPassword}
                    icon={() => (hasPassword ? <Lock {...iconProps} /> : <Unlock {...iconProps} />)}
                />
            </Tooltip>

            {slug && (
                <Tooltip title={t('button.export')}>
                    <IconButton
                        onPress={() => exportFile(slug)}
                        icon={() => <FileExport {...iconProps} />}
                    />
                </Tooltip>
            )}

            <Tooltip title={t('button.delete')}>
                <IconButton
                    onPress={onDelete}
                    icon={() => <Delete {...iconProps} />}
                />
            </Tooltip>
        </>
    )
}
