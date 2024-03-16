import { useEffect, useState } from 'react'
import * as Crypto from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ModalSheet } from '../Modal'
import { PasswordInput } from '../Input'
import { Button } from '../Button'

export function PasswordModal({ isVisible, onClose, handlePassword }) {
    const { t } = useTranslation()
    const [password, setPassword] = useState('')
    const [passwordInput, setPasswordInput] = useState('')
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    useEffect(() => {
        (async () => {
            const digest = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                passwordInput
            )
            setPassword(digest)
        })()
    }, [passwordInput])

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t('title.password')}
        >
            <View style={styles.container}>
                <PasswordInput
                    autoFocus
                    password={passwordInput}
                    onChangeText={setPasswordInput}
                />
                <Button
                    disabled={isButtonDisabled}
                    label={t('buttons.save')}
                    onPress={() => handlePassword(password)}
                />
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
})
