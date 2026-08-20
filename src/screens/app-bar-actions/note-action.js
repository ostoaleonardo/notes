import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'
import { Appbar, Tooltip } from 'react-native-paper'
import { MenuContainer, MenuItem } from '@/components'
import { useFiles, useIconProps, useNotes, useTrash, useUtils } from '@/hooks'
import { Delete, FileExport, Keep, KeepFilled, Lock, Shapes, Unlock } from '@/icons'

export function NoteAction({ onOpenPassword, hasPassword, onOpenTemplates, onSaveAsTemplate }) {
    const iconProps = useIconProps()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()

    const [templatesMenuVisible, setTemplatesMenuVisible] = useState(false)

    const { exportFile } = useFiles()
    const { pinned, updatePinned } = useUtils()
    const [isPinned, setIsPinned] = useState(pinned.has(slug))

    const { addItem } = useTrash()
    const {
        getNote, deleteNote,
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
        const id = paramId || slug
        const note = getNote(id)

        if (Object.keys(note).length > 0) {
            deleteNote(id)
            addItem(note)
        }

        setParamId('')
        goToHome()
    }

    return (
        <View style={{ flexDirection: 'row' }}>
            {slug && (
                <Tooltip title={t('button.export')}>
                    <Appbar.Action
                        animated={false}
                        onPress={() => exportFile(slug)}
                        icon={() => <FileExport {...iconProps} />}
                    />
                </Tooltip>
            )}
            <MenuContainer
                visible={templatesMenuVisible}
                onClose={() => setTemplatesMenuVisible(false)}
                anchor={
                    <Tooltip title={t('drawer.templates')}>
                        <Appbar.Action
                            animated={false}
                            onPress={() => setTemplatesMenuVisible(true)}
                            icon={() => <Shapes {...iconProps} />}
                        />
                    </Tooltip>
                }
            >
                <MenuItem
                    title={t('templates.insert')}
                    leadingIcon={() => <Shapes {...iconProps} />}
                    onPress={() => {
                        setTemplatesMenuVisible(false)
                        onOpenTemplates()
                    }}
                />
                <MenuItem
                    title={t('templates.save_as_template')}
                    leadingIcon={() => <Shapes {...iconProps} />}
                    onPress={() => {
                        setTemplatesMenuVisible(false)
                        onSaveAsTemplate()
                    }}
                />
            </MenuContainer>
            <Tooltip title={t('button.pin')}>
                <Appbar.Action
                    animated={false}
                    onPress={toggleKeep}
                    icon={() => (
                        isPinned
                            ? <KeepFilled {...iconProps} />
                            : <Keep {...iconProps} />
                    )}
                />
            </Tooltip>
            <Tooltip title={t('button.lock')}>
                <Appbar.Action
                    animated={false}
                    onPress={onOpenPassword}
                    icon={() => hasPassword
                        ? <Lock {...iconProps} />
                        : <Unlock {...iconProps} />}
                />
            </Tooltip>
            <Tooltip title={t('button.delete')}>
                <Appbar.Action
                    animated={false}
                    onPress={onDelete}
                    icon={() => <Delete {...iconProps} />}
                />
            </Tooltip>
        </View>
    )
}
