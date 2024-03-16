import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ModalSheet } from '../Modal'
import { LargeInput, PasswordInput } from '../Input'
import { Button } from '../Button'

export function PasswordModal({ isVisible, onClose, handlePassword }) {
    const { t } = useTranslation()
    const [password, setPassword] = useState('')
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t('title.password')}
        >
            <View style={styles.container}>
                <PasswordInput
                    password={password}
                    onChangeText={setPassword}
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
