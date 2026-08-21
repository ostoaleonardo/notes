import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { PasswordInput, Pressable } from '@/components'
import { useNoteAuthentication, useNotes, useTrash } from '@/hooks'
import { Fingerprint } from '@/icons'

export function DeleteNote({ id, onClose }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { addItem } = useTrash()
    const { getNote, deleteNote } = useNotes()

    const note = getNote(id)
    const { password, biometrics } = note || {}

    const {
        passwordValue,
        setPasswordValue,
        hasBiometrics,
        authenticated,
        authBiometrics,
        verifyPassword,
        resetError,
        message
    } = useNoteAuthentication(id, password)

    const hasBothLocks = (hasBiometrics && biometrics) && password

    useEffect(() => {
        if (authenticated) {
            const current = getNote(id)
            addItem(current)
            deleteNote(id)
            onClose()
        }
    }, [authenticated])

    if (!note || !note.id) return null

    return (
        <View style={styles.container}>
            <View style={styles.security}>
                {password || !biometrics ? (
                    <PasswordInput
                        modal={true}
                        value={passwordValue}
                        onChangeText={(text) => {
                            if (message) resetError()
                            setPasswordValue(text)
                        }}

                        onBlur={resetError}
                        message={t(message)}
                    />
                ) : (
                    <Fingerprint
                        width={64} height={64}
                        fill={colors.onSurface}
                    />
                )}
            </View>
            <View style={styles.buttons}>
                {password && (
                    <Pressable
                        mode='contained'
                        onPress={verifyPassword}
                    >
                        {t('button.delete')}
                    </Pressable>
                )}
                {biometrics && hasBiometrics && (
                    <Pressable
                        onPress={() => authBiometrics(t('notes.delete'))}
                        mode={hasBothLocks ? 'outlined' : 'contained'}
                    >
                        {t('biometric.use')}
                    </Pressable>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    security: {
        paddingTop: 32,
        paddingBottom: 48
    },
    buttons: {
        width: '100%',
        gap: 8
    }
})
