import { useEffect, useState } from 'react'
import * as Crypto from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ModalSheet } from '../Modal'
import { Typography } from '../Text'
import { PasswordInput } from '../Input'
import { Button } from '../Button'

export function UpdatePasswordModal({ isVisible, onClose, password, handlePassword }) {
    const { t } = useTranslation()
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [encryptedOldPassword, setEncryptedOldPassword] = useState('')
    const [encryptedNewPassword, setEncryptedNewPassword] = useState('')
    const [isWrongPassword, setIsWrongPassword] = useState(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    useEffect(() => {
        setIsButtonDisabled(!oldPassword || !newPassword)
    }, [oldPassword, newPassword])

    useEffect(() => {
        (async () => {
            const oldDigest = await encryptPassword(oldPassword)
            setEncryptedOldPassword(oldDigest)
        })()
    }, [oldPassword])

    useEffect(() => {
        (async () => {
            const newDigest = await encryptPassword(newPassword)
            setEncryptedNewPassword(newDigest)
        })()
    }, [newPassword])

    const encryptPassword = async (password) => {
        const digest = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            password
        )
        return digest
    }

    const checkPassword = () => {
        if (encryptedOldPassword === password) {
            handlePassword(encryptedNewPassword)
            onClose()
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
                <View style={styles.inputContainer}>
                    <Typography
                        uppercase
                        variant='caption'
                    >
                        Old Password
                    </Typography>
                    <PasswordInput
                        autoFocus
                        password={oldPassword}
                        onChangeText={setOldPassword}
                    />
                    <Typography
                        uppercase
                        variant='caption'
                    >
                        New Password
                    </Typography>
                    <PasswordInput
                        password={newPassword}
                        onChangeText={setNewPassword}
                    />
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
        gap: 36,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        width: '100%',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
