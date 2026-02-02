import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { DeleteNote } from '../Modals'
import { useBottomSheet, useLocalAuthentication, useNotes, useUtils } from '@/hooks'
import { Delete, Keep, KeepFilled } from '@/icons'
import { ROUTES } from '@/constants'

export function NoteAction() {
    const { colors } = useTheme()
    const { t } = useTranslation()
    const { replace } = useRouter()
    const { slug } = useLocalSearchParams()

    const { pinned, updatePinned } = useUtils()
    const [isPinned, setIsPinned] = useState(pinned.has(slug))

    const { getNote, deleteNote } = useNotes()
    const { hasBiometrics } = useLocalAuthentication()
    const { ref, onOpen, onClose } = useBottomSheet()

    const goToHome = () => replace(ROUTES.HOME)

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
