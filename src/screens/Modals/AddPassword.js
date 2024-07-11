import { forwardRef, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { ModalSheet, Button, PasswordInput, Typography } from '@/components'
import { useHaptics, useLocalAuthentication } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { COLORS, FEEDBACK_TYPES } from '@/constants'

export const AddPassword = forwardRef(({ setPassword, biometrics, setBiometrics, onClose }, ref) => {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { hasBiometrics, authenticate } = useLocalAuthentication()
    const [passwordInput, setPasswordInput] = useState('')
    const [encryptedPassword, setEncryptedPassword] = useState('')
    const [isInvalidPassword, setIsInvalidPassword] = useState(false)

    useEffect(() => {
        (async () => {
            const digest = await getEncryptedPassword(passwordInput)
            setEncryptedPassword(digest)
        })()
    }, [passwordInput])

    const checkPassword = () => {
        if (passwordInput.length < 4) {
            vibrate(FEEDBACK_TYPES.ERROR)
            setIsInvalidPassword(true)
            setPassword('')
            return
        }

        vibrate(FEEDBACK_TYPES.SUCCESS)
        setPassword(encryptedPassword)
        onClose()
    }

    const handleBiometrics = async () => {
        if (biometrics) {
            setBiometrics(false)
            vibrate(FEEDBACK_TYPES.SUCCESS)
            return
        }

        const success = await authenticate(t('biometric.lock'))

        if (success) {
            setBiometrics(true)
            vibrate(FEEDBACK_TYPES.SUCCESS)
        }
    }

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            enableDynamicSizing
            title={t('password.add')}
            contentContainerStyle={styles.container}
        >
            <View style={styles.inputContainer}>
                <Animatable.View animation={isInvalidPassword ? 'shake' : undefined}>
                    <PasswordInput
                        password={passwordInput}
                        onChangeText={setPasswordInput}
                        onChange={() => setIsInvalidPassword(false)}
                    />
                </Animatable.View>
                <Typography
                    variant='caption'
                    textAlign='center'
                    color={COLORS.primary}
                >
                    {isInvalidPassword && t('message.lengthPassword')}
                </Typography>
            </View>
            <View style={styles.buttonsContainer}>
                <Button
                    onPress={checkPassword}
                    label={t('button.save')}
                />
                {hasBiometrics && (
                    <Button
                        variant='outline'
                        onPress={handleBiometrics}
                        label={biometrics ? t('biometric.remove') : t('biometric.lock')}
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
