import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { DeleteNote } from '../Modals'
import { useBottomSheet, useLocalAuthentication, useMarkdown, useNotes, useUtils } from '@/hooks'
import { Delete, Keep, KeepFilled, Markdown, MarkdownFilled } from '@/icons'
import { ROUTES } from '@/constants'

export function NoteAction() {
    const { colors } = useTheme()
    const { t } = useTranslation()
    const { replace, setParams } = useRouter()
    const { slug } = useLocalSearchParams()

    const { markdown: active } = useMarkdown()
    const [markdown, setMarkdown] = useState(active)

    const { pinned, updatePinned } = useUtils()
    const [isPinned, setIsPinned] = useState(pinned.has(slug))

    const { getNote, deleteNote } = useNotes()
    const { hasBiometrics } = useLocalAuthentication()
    const { ref, onOpen, onClose } = useBottomSheet()

    const goToHome = () => replace(ROUTES.HOME)

    const toggleMarkdown = () => {
        setParams({ md: !markdown })
        setMarkdown(!markdown)
    }

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
        const note = getNote(slug)
        const { password, biometrics } = note
        const isLocked = password || (biometrics && hasBiometrics)

        if (isLocked) {
            onOpen()
        } else {
            deleteNote(slug)
            goToHome()
        }
    }

    const { onBackground } = colors
    const iconProps = { color: onBackground }

    return (
        <>
            <View style={styles.container}>
                <Tooltip title={t('appbar.markdown')}>
                    <Appbar.Action
                        animated={false}
                        onPress={toggleMarkdown}
                        icon={() => (
                            markdown
                                ? <MarkdownFilled {...iconProps} />
                                : <Markdown {...iconProps} />
                        )}
                    />
                </Tooltip>
                <Tooltip title={t('appbar.keep')}>
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
                <Tooltip title={t('appbar.delete')}>
                    <Appbar.Action
                        animated={false}
                        onPress={onDelete}
                        icon={() => <Delete {...iconProps} />}
                    />
                </Tooltip>
            </View>

            <DeleteNote
                ref={ref}
                id={slug}
                onClose={() => {
                    onClose()
                    goToHome()
                }}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row'
    }
})
