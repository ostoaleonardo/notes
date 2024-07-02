import { forwardRef, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { ModalSheet, Button, PasswordInput, Typography } from '@/components'
import { useLocalAuthentication } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { COLORS } from '@/constants'

export const UpdatePassword = forwardRef(({ currentPassword, tooglePassword, onDelete, biometrics, setBiometrics, onClose }, ref) => {
    const { t } = useTranslation()
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
                setMessage('message.samePassword')
            } else if (newPassword.length < 4) {
                setIsInvalidPassword(true)
                setMessage('message.lengthPassword')
            } else {
                tooglePassword(encryptedNewPassword)
                onClose()
            }
        } else {
            setIsWrongPassword(true)
        }
    }

    const handleBiometrics = async () => {
        if (biometrics) {
            setBiometrics(false)
            return
        }

        const success = await authenticate()

        if (success) {
            setBiometrics(true)
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
            <View style={styles.passwordsContainer}>
                <View style={styles.inputContainer}>
                    <Typography variant='caption'>
                        {t('password.current')}
                    </Typography>
                    <Animatable.View animation={isWrongPassword ? 'shake' : undefined}>
                        <PasswordInput
                            password={oldPassword}
                            onChangeText={setOldPassword}
                            onChange={() => setIsWrongPassword(false)}
                        />
                    </Animatable.View>
                    <Typography
                        variant='caption'
                        textAlign='center'
                        color={COLORS.primary}
                    >
                        {isWrongPassword && t('message.wrongPassword')}
                    </Typography>
                </View>
                <View style={styles.inputContainer}>
                    <Typography variant='caption'>
                        {t('password.new')}
                    </Typography>
                    <Animatable.View animation={isInvalidPassword ? 'shake' : undefined}>
                        <PasswordInput
                            password={newPassword}
                            onChangeText={setNewPassword}
                            onChange={() => setIsInvalidPassword(false)}
                        />
                    </Animatable.View>
                    <Typography
                        variant='caption'
                        textAlign='center'
                        color={COLORS.primary}
                    >
                        {isInvalidPassword && t(message)}
                    </Typography>
                </View>
            </View>
            <Button
                onPress={canUpdate ? updatePassword : onDelete}
                label={canUpdate ? t('password.update') : t('password.remove')}
            />
            {hasBiometrics && (
                <Button
                    variant='outline'
                    onPress={handleBiometrics}
                    label={biometrics ? t('biometric.remove') : t('biometric.lock')}
                />
            )}
        </ModalSheet>
    )
})

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16,
        padding: 24,
        paddingBottom: 80,
        alignItems: 'center',
        justifyContent: 'center'
    },
    passwordsContainer: {
        width: '100%',
        gap: 32,
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
