import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { Button, ModalSheet, PasswordInput, Typography } from '@/components'
import { getEncryptedPassword } from '@/utils'
import { COLORS } from '@/constants'

export function UpdatePasswordModal({ isVisible, onClose, currentPassword, handlePassword, onDelete }) {
    const { t } = useTranslation()
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [encryptedOldPassword, setEncryptedOldPassword] = useState('')
    const [encryptedNewPassword, setEncryptedNewPassword] = useState('')
    const [isWrongPassword, setIsWrongPassword] = useState(false)
    const [isInvalidPassword, setIsInvalidPassword] = useState(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        setIsButtonDisabled(!oldPassword || !newPassword)
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

    const checkPassword = () => {
        if (encryptedOldPassword === currentPassword) {
            if (encryptedOldPassword === encryptedNewPassword) {
                setIsInvalidPassword(true)
                setMessage('message.samePassword')
            } else if (newPassword.length < 4) {
                setIsInvalidPassword(true)
                setMessage('message.lengthPassword')
            } else {
                handlePassword(encryptedNewPassword)
                onClose()
            }
        } else {
            setIsWrongPassword(true)
        }
    }

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t('password.update')}
        >
            <View style={styles.container}>
                <View style={styles.passwordsContainer}>
                    <View style={styles.inputContainer}>
                        <Typography variant='caption'>
                            {t('password.current')}
                        </Typography>
                        <Animatable.View animation={isWrongPassword ? 'shake' : undefined}>
                            <PasswordInput
                                autoFocus
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
                    label={t('button.update')}
                    disabled={isButtonDisabled}
                    onPress={checkPassword}
                />
                <Button
                    variant='outline'
                    label={t('password.remove')}
                    onPress={onDelete}
                />
            </View>
        </ModalSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    passwordsContainer: {
        width: '100%',
        gap: 32,
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
