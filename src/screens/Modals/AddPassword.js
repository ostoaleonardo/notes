import { forwardRef, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ModalSheet, PasswordInput, Pressable } from '@/components'
import { useHaptics, useLocalAuthentication } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { FEEDBACK_TYPES } from '@/constants'

export const AddPassword = forwardRef(({ setPassword, biometrics, setBiometrics, onClose }, ref) => {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { hasBiometrics, authenticate } = useLocalAuthentication()

    const [passwordInput, setPasswordInput] = useState('')
    const [encryptedInput, setEncryptedInput] = useState('')

    const [isInvalid, setIsInvalid] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const encryptedPassword = async () => {
            const digest = await getEncryptedPassword(passwordInput)
            setEncryptedInput(digest)
        }

        encryptedPassword()
    }, [passwordInput])

    const checkPassword = () => {
        if (passwordInput.length < 4) {
            vibrate(FEEDBACK_TYPES.ERROR)
            setMessage(t('message.lengthPassword'))
            setIsInvalid(true)
            setPassword('')
            return
        }

        vibrate(FEEDBACK_TYPES.SUCCESS)
        setPassword(encryptedInput)
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
            <PasswordInput
                modal={true}
                password={passwordInput}
                onChangeText={setPasswordInput}

                onChange={() => setMessage('')}

                message={message}
                isInvalid={isInvalid}
                setIsInvalid={setIsInvalid}
            />
            <View style={styles.buttons}>
                <Pressable
                    mode='contained'
                    onPress={checkPassword}
                >
                    {t('button.save')}
                </Pressable>
                {hasBiometrics && (
                    <Pressable
                        mode='outlined'
                        onPress={handleBiometrics}
                    >
                        {biometrics ? t('biometric.remove') : t('biometric.lock')}
                    </Pressable>
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
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttons: {
        width: '100%',
        gap: 8
    }
})
