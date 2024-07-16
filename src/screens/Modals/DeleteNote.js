import { forwardRef, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { ModalSheet, Button, PasswordInput, Typography } from '@/components'
import { useHaptics, useLocalAuthentication, useNotes } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { Fingerprint } from '@/icons'
import { COLORS, FEEDBACK_TYPES } from '@/constants'
import { useTheme } from 'react-native-paper'

export const DeleteNote = forwardRef(({ id, onClose }, ref) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { vibrate } = useHaptics()
    const { getNote, deleteNote } = useNotes()
    const { password, biometrics } = getNote(id)
    const { hasBiometrics, authenticate } = useLocalAuthentication()

    const [passwordInput, setPasswordInput] = useState('')
    const [encryptedInput, setEncryptedInput] = useState('')
    const [encryptedPassword, setEncryptedPassword] = useState('')
    const [isWrongPassword, setIsWrongPassword] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        setEncryptedPassword(password)
    }, [password])

    useEffect(() => {
        (async () => {
            const digest = await getEncryptedPassword(passwordInput)
            setEncryptedInput(digest)
        })()
    }, [passwordInput])

    const handlePassword = () => {
        if (encryptedInput === encryptedPassword) {
            deleteNote(id)
            vibrate(FEEDBACK_TYPES.SUCCESS)
            onClose()
        } else {
            setIsWrongPassword(true)
            vibrate(FEEDBACK_TYPES.ERROR)
            setMessage(t('message.wrongPassword'))
        }
    }

    const handleBiometrics = async () => {
        const success = await authenticate(t('header.deleteNote'))

        if (success) {
            deleteNote(id)
            vibrate(FEEDBACK_TYPES.SUCCESS)
            onClose()
        }
    }

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            enableDynamicSizing
            title={t('header.deleteNote')}
            contentContainerStyle={styles.container}
        >
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
                            color={COLORS.common.accent}
                        >
                            {message && t('message.wrongPassword')}
                        </Typography>
                    </>
                ) : (
                    <Fingerprint
                        width={96}
                        height={96}
                        fill={colors.onBackground}
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
        </ModalSheet>
    )
})

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 40,
        padding: 24,
        paddingBottom: 80,
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center'
    },
    buttonsContainer: {
        width: '100%',
        gap: 16
    }
})
