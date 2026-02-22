import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useFiles, useNotes, useTrash, useUtils } from '@/hooks'
import { Delete, FileExport, Keep, KeepFilled } from '@/icons'

export function NoteAction() {
    const { colors } = useTheme()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()

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

    const { onBackground } = colors
    const iconProps = { color: onBackground }

    return (
        <View style={styles.container}>
            {slug && (
                <Tooltip title={t('button.export')}>
                    <Appbar.Action
                        animated={false}
                        onPress={() => exportFile(slug)}
                        icon={() => <FileExport {...iconProps} />}
                    />
                </Tooltip>
            )}
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

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row'
    }
})
