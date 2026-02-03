import { forwardRef, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ModalSheet, PasswordInput, Typography, Pressable } from '@/components'
import { useHaptics, useLocalAuthentication } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { COLORS, FEEDBACK_TYPES } from '@/constants'

export const UpdatePassword = forwardRef(({ currentPassword, tooglePassword, onDelete, biometrics, setBiometrics, onClose }, ref) => {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { hasBiometrics, authenticate } = useLocalAuthentication()

    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [encryptedOldPassword, setEncryptedOldPassword] = useState('')
    const [encryptedNewPassword, setEncryptedNewPassword] = useState('')
    const [isWrongPassword, setIsWrongPassword] = useState(false)
    const [isInvalidPassword, setIsInvalidPassword] = useState(false)
    const [canUpdate, setCanUpdate] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        setCanUpdate(oldPassword && newPassword)
    }, [oldPassword, newPassword])

    useEffect(() => {
        (async () => {
            const oldDigest = await getEncryptedPassword(oldPassword)
            setEncryptedOldPassword(oldDigest)
        })()
    }, [oldPassword])

    useEffect(() => {
        (async () => {
            const newDigest = await getEncryptedPassword(newPassword)
            setEncryptedNewPassword(newDigest)
        })()
    }, [newPassword])

    const updatePassword = () => {
        if (!canUpdate) {
            onDelete()
            onClose()
            return
        }

        if (encryptedOldPassword === currentPassword) {
            if (encryptedOldPassword === encryptedNewPassword) {
                setIsInvalidPassword(true)
                vibrate(FEEDBACK_TYPES.WARNING)
                setMessage('message.password.same')
            } else if (newPassword.length < 4) {
                setIsInvalidPassword(true)
                vibrate(FEEDBACK_TYPES.WARNING)
                setMessage('message.password.lenght')
            } else {
                tooglePassword(encryptedNewPassword)
                vibrate(FEEDBACK_TYPES.SUCCESS)
                onClose()
            }
        } else {
            setIsWrongPassword(true)
            vibrate(FEEDBACK_TYPES.ERROR)
        }
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
            title={t('password.update')}
            contentContainerStyle={styles.container}
        >
            <View style={styles.passwords}>
                <View style={styles.input}>
                    <Typography variant='caption'>
                        {t('password.current')}
                    </Typography>
                    <PasswordInput
                        modal={true}
                        password={oldPassword}
                        onChangeText={setOldPassword}
                        onChange={() => setIsWrongPassword(false)}

                        isInvalid={isWrongPassword}
                        setIsInvalid={setIsWrongPassword}
                        message={isWrongPassword && t('message.password.wrong')}
                    />
                </View>
                <View style={styles.input}>
                    <Typography variant='caption'>
                        {t('password.new')}
                    </Typography>
                    <PasswordInput
                        modal={true}
                        password={newPassword}
                        onChangeText={setNewPassword}
                        onChange={() => setIsInvalidPassword(false)}

                        isInvalid={isInvalidPassword}
                        setIsInvalid={setIsInvalidPassword}
                        message={isInvalidPassword && t('message')}
                    />
                </View>
            </View>
            <View style={styles.buttons}>
                <Pressable
                    mode='contained'
                    onPress={canUpdate ? updatePassword : onDelete}
                >
                    {canUpdate ? t('password.update') : t('password.remove')}
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
    passwords: {
        width: '100%',
        gap: 32,
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttons: {
        width: '100%',
        gap: 8
    }
})
