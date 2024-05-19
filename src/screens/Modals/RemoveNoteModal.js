import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { Button, ModalSheet, PasswordInput, Typography } from '@/components'
import { useHaptics, useLocalAuthentication, useNotes } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { Fingerprint } from '@/icons'
import { COLORS, FEEDBACK_TYPES } from '@/constants'

export function RemoveNoteModal({ isVisible, onClose, id, onDelete }) {
    const { t } = useTranslation()
    const { getNote } = useNotes()
    const { vibrate } = useHaptics()
    const { hasBiometrics, authenticate } = useLocalAuthentication()
    const [passwordInput, setPasswordInput] = useState('')
    const [encryptedInput, setEncryptedInput] = useState('')
    const [encryptedPassword, setEncryptedPassword] = useState('')
    const [isWrongPassword, setIsWrongPassword] = useState(false)
    const [message, setMessage] = useState('')

    const { biometrics, password } = getNote(id)

    useEffect(() => {
        setEncryptedPassword(password)

        if (isVisible && biometrics && hasBiometrics) {
            handleBiometrics()
        }
    }, [password, hasBiometrics])

    useEffect(() => {
        (async () => {
            const digest = await getEncryptedPassword(passwordInput)
            setEncryptedInput(digest)
        })()
    }, [passwordInput])

    const handlePassword = () => {
        if (encryptedInput === encryptedPassword) {
            onDelete()
            onClose()
        } else {
            setIsWrongPassword(true)
            vibrate(FEEDBACK_TYPES.ERROR)
            setMessage(t('message.wrongPassword'))
        }
    }

    const handleBiometrics = async () => {
        const success = await authenticate()

        if (success) {
            onDelete()
            onClose()
        }
    }

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t('header.removeNote')}
        >
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    {password || !biometrics ? (
                        <>
                            <Animatable.View
                                animation={isWrongPassword ? 'shake' : undefined}
                                onAnimationEnd={() => setIsWrongPassword(false)}
                            >
                                <PasswordInput
                                    value={passwordInput}
                                    onChangeText={setPasswordInput}
                                    onBlur={() => setMessage('')}
                                    autoFocus={!biometrics && !hasBiometrics}
                                />
                            </Animatable.View>
                            <Typography
                                variant='caption'
                                textAlign='center'
                                color={COLORS.primary}
                            >
                                {message && t('message.wrongPassword')}
                            </Typography>
                        </>
                    ) : (
                        <Fingerprint
                            width={96}
                            height={96}
                            fill={COLORS.text50}
                        />
                    )}
                </View>
                <View style={styles.buttonsContainer}>
                    {password && (
                        <Button
                            onPress={handlePassword}
                            label={t('button.delete')}
                        />
                    )}
                    {biometrics && hasBiometrics && (
                        <Button
                            variant='outline'
                            onPress={handleBiometrics}
                            label={t('biometric.use')}
                        />
                    )}
                </View>
            </View>
        </ModalSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 40,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
    },
    buttonsContainer: {
        width: '100%',
        gap: 16,
    },
})
