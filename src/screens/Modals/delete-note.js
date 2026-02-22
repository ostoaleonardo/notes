import { forwardRef, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { ModalSheet, PasswordInput, Pressable } from '@/components'
import { useHaptics, useLocalAuthentication, useNotes, useTrash } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { Fingerprint } from '@/icons'
import { FEEDBACK_TYPES } from '@/constants'

export const DeleteNote = forwardRef(({ id, onClose }, ref) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { vibrate } = useHaptics()
    const { addItem } = useTrash()
    const { getNote, deleteNote } = useNotes()
    const { hasBiometrics, authenticate } = useLocalAuthentication()

    const [passwordInput, setPasswordInput] = useState('')
    const [encryptedInput, setEncryptedInput] = useState('')

    const [isInvalid, setIsInvalid] = useState(false)
    const [message, setMessage] = useState('')

    const note = getNote(id)
    const { password, biometrics } = note

    const hasBothLocks = (hasBiometrics && biometrics) && password

    useEffect(() => {
        setEncryptedInput('')
        setPasswordInput('')
        setIsInvalid(false)
        setMessage('')
    }, [id])

    useEffect(() => {
        const encryptedPassword = async () => {
            const digest = await getEncryptedPassword(passwordInput)
            setEncryptedInput(digest)
        }

        encryptedPassword()
    }, [passwordInput])

    const handlePassword = () => {
        if (encryptedInput === password) {
            vibrate(FEEDBACK_TYPES.SUCCESS)
            addItem(note)
            deleteNote(id)
            onClose()
        } else {
            setIsInvalid(true)
            vibrate(FEEDBACK_TYPES.ERROR)
            setMessage(t('message.password.wrong'))
        }
    }

    const handleBiometrics = async () => {
        const success = await authenticate(t('notes.delete'))

        if (success) {
            onClose()
            addItem(note)
            deleteNote(id)
            vibrate(FEEDBACK_TYPES.SUCCESS)
        }
    }

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            enableDynamicSizing
            title={t('notes.delete')}
            contentContainerStyle={styles.container}
        >
            <View style={styles.security}>
                {password || !biometrics ? (
                    <PasswordInput
                        modal={true}
                        value={passwordInput}
                        onChangeText={setPasswordInput}

                        onBlur={() => setMessage('')}
                        onChange={() => setMessage('')}

                        message={message}
                        isInvalid={isInvalid}
                        setIsInvalid={setIsInvalid}
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
                        onPress={handlePassword}
                    >
                        {t('button.delete')}
                    </Pressable>
                )}
                {biometrics && hasBiometrics && (
                    <Pressable
                        onPress={handleBiometrics}
                        mode={hasBothLocks ? 'outlined' : 'contained'}
                    >
                        {t('biometric.use')}
                    </Pressable>
                )}
            </View>
        </ModalSheet>
    )
})

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
