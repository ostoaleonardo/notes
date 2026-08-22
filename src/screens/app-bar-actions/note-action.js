import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'
import { AppBarAction, MenuContainer, MenuItem } from '@/components'
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
                <AppBarAction
                    tooltip={t('button.export')}
                    onPress={() => exportFile(slug)}
                    icon={FileExport}
                />
            )}

            <MenuContainer
                visible={templatesMenuVisible}
                onClose={() => setTemplatesMenuVisible(false)}
                anchor={
                    <AppBarAction
                        tooltip={t('drawer.templates')}
                        onPress={() => setTemplatesMenuVisible(true)}
                        icon={Shapes}
                    />
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
            <AppBarAction
                tooltip={t('button.pin')}
                onPress={toggleKeep}
                icon={isPinned ? KeepFilled : Keep}
            />
            <AppBarAction
                tooltip={t('button.lock')}
                onPress={onOpenPassword}
                icon={hasPassword ? Lock : Unlock}
            />
            <AppBarAction
                tooltip={t('button.delete')}
                onPress={onDelete}
                icon={Delete}
            />
        </View>
    )
}
