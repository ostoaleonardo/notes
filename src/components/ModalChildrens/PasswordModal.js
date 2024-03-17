import { useEffect, useState } from 'react'
import * as Crypto from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { ModalSheet } from '../Modal'
import { Typography } from '../Text'
import { PasswordInput } from '../Input'
import { Button } from '../Button'
import { colors } from '@/constants'

export function PasswordModal({ isVisible, onClose, handlePassword }) {
    const { t } = useTranslation()
    const [passwordInput, setPasswordInput] = useState('')
    const [encryptedPassword, setEncryptedPassword] = useState('')
    const [isInvalidPassword, setIsInvalidPassword] = useState(false)

    useEffect(() => {
        (async () => {
            const digest = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                passwordInput
            )
            setEncryptedPassword(digest)
        })()
    }, [passwordInput])

    const checkPassword = () => {
        if (passwordInput.length < 4) {
            setIsInvalidPassword(true)
            return
        }

        handlePassword(encryptedPassword)
    }

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t('title.password')}
        >
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <Animatable.View animation={isInvalidPassword ? 'shake' : undefined}>
                        <PasswordInput
                            autoFocus
                            password={passwordInput}
                            onChangeText={setPasswordInput}
                            onChange={() => setIsInvalidPassword(false)}
                        />
                    </Animatable.View>
                    <Typography
                        variant='caption'
                        textAlign='center'
                        color={colors.primary}
                    >
                        {isInvalidPassword && t('messages.lengthPassword')}
                    </Typography>
                </View>
                <Button
                    onPress={checkPassword}
                    label={t('buttons.save')}
                />
            </View>
        </ModalSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 40,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
    },
})
