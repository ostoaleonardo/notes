import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { ModalSheet } from '../Modal'
import { Typography } from '../Text'
import { PasswordInput } from '../Input'
import { Button } from '../Button'
import { getEncryptedPassword } from '@/utils'
import { colors } from '@/constants'

export function UpdatePasswordModal({ isVisible, onClose, currentPassword, handlePassword }) {
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
                setMessage('messages.samePassword')
            } else if (newPassword.length < 4) {
                setIsInvalidPassword(true)
                setMessage('messages.lengthPassword')
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
            title={t('password.updatePassword')}
        >
            <View style={styles.container}>
                <View style={styles.passwordsContainer}>
                    <View style={styles.inputContainer}>
                        <Typography
                            uppercase
                            variant='caption'
                        >
                            Old Password
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
                            color={colors.primary}
                        >
                            {isWrongPassword && t('messages.wrongPassword')}
                        </Typography>
                    </View>
                    <View style={styles.inputContainer}>
                        <Typography
                            uppercase
                            variant='caption'
                        >
                            New Password
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
                            color={colors.primary}
                        >
                            {isInvalidPassword && t(message)}
                        </Typography>
                    </View>
                </View>
                <Button
                    label={t('buttons.update')}
                    disabled={isButtonDisabled}
                    onPress={checkPassword}
                />
            </View>
        </ModalSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    passwordsContainer: {
        width: '100%',
        gap: 32,
        marginTop: 24,
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
