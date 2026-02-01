import { forwardRef, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { ModalSheet, PasswordInput, Pressable } from '@/components'
import { useHaptics, useLocalAuthentication, useNotes } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { Fingerprint } from '@/icons'
import { FEEDBACK_TYPES, ROUTES } from '@/constants'

export const UnlockNote = forwardRef(({ id, onClose }, ref) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { getNote } = useNotes()
    const { vibrate } = useHaptics()
    const { hasBiometrics, authenticate } = useLocalAuthentication()

    const [passwordInput, setPasswordInput] = useState('')
    const [encryptedInput, setEncryptedInput] = useState('')

    const [isInvalid, setIsInvalid] = useState(false)
    const [message, setMessage] = useState('')

    const { biometrics, password } = getNote(id)
    const hasBothLocks = (hasBiometrics && biometrics) && password

    useEffect(() => {
        setEncryptedInput('')
        setPasswordInput('')
        setIsInvalid(false)
        setMessage('')

        if (biometrics && hasBiometrics) {
            handleBiometrics()
        }
    }, [id, biometrics])

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
            router.push(ROUTES.EDIT_NOTE + id)
            onClose()
        } else {
            setIsInvalid(true)
            vibrate(FEEDBACK_TYPES.ERROR)
            setMessage(t('message.wrongPassword'))
        }
    }

    const handleBiometrics = async () => {
        const success = await authenticate(t('biometric.unlock'))

        if (success) {
            onClose()
            vibrate(FEEDBACK_TYPES.SUCCESS)
            router.push(ROUTES.EDIT_NOTE + id)
        }
    }

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            enableDynamicSizing
            title={t('title.unlock')}
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
                        {t('button.enter')}
                    </Pressable>
                )}
                {biometrics && hasBiometrics && (
                    <Pressable
                        onPress={handleBiometrics}
                        mode={hasBothLocks ? 'outlined' : 'contained'}
                    >
                        {t('biometric.unlock')}
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
