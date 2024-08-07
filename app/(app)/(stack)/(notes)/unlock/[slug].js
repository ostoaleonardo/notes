import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { Button, PasswordInput, Toast } from '@/components'
import { useHaptics, useLocalAuthentication, useNotes } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { Fingerprint } from '@/icons'
import { FEEDBACK_TYPES, ROUTES } from '@/constants'

export default function Password() {
    const router = useRouter()
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { getNote } = useNotes()
    const { vibrate } = useHaptics()
    const { slug } = useLocalSearchParams()
    const { isLoading, hasBiometrics, authenticate } = useLocalAuthentication()

    const [passwordInput, setPasswordInput] = useState('')
    const [encryptedInput, setEncryptedInput] = useState('')
    const [encryptedPassword, setEncryptedPassword] = useState('')
    const [isWrongPassword, setIsWrongPassword] = useState(false)
    const [message, setMessage] = useState('')

    const { biometrics, password } = getNote(slug)

    useEffect(() => {
        setEncryptedPassword(password)

        if (biometrics && hasBiometrics) {
            handleBiometrics()
        }
    }, [slug, hasBiometrics])

    useEffect(() => {
        (async () => {
            const digest = await getEncryptedPassword(passwordInput)
            setEncryptedInput(digest)
        })()
    }, [passwordInput])

    const handlePassword = () => {
        if (encryptedInput === encryptedPassword) {
            vibrate(FEEDBACK_TYPES.SUCCESS)
            router.replace(ROUTES.EDIT_NOTE + slug)
        } else {
            setIsWrongPassword(true)
            vibrate(FEEDBACK_TYPES.ERROR)
            setMessage(t('message.wrongPassword'))
        }
    }

    const handleBiometrics = async () => {
        const success = await authenticate(t('biometric.unlock'))

        if (success) {
            vibrate(FEEDBACK_TYPES.SUCCESS)
            router.replace(ROUTES.EDIT_NOTE + slug)
        }
    }

    if (biometrics && isLoading) return (
        <View style={styles.container}>
            <ActivityIndicator
                size='large'
                color={colors.onBackground}
            />
        </View>
    )

    return (
        <View style={styles.container}>
            <View style={styles.passwordContainer}>
                {password || !biometrics ? (
                    <Animatable.View
                        animation={isWrongPassword ? 'shake' : undefined}
                        onAnimationEnd={() => setIsWrongPassword(false)}
                    >
                        <PasswordInput
                            value={passwordInput}
                            onChangeText={setPasswordInput}
                            onBlur={() => setMessage('')}
                            autoFocus={!biometrics && !hasBiometrics}
                        />
                    </Animatable.View>
                ) : (
                    <Fingerprint
                        width={96}
                        height={96}
                        fill={colors.onBackground}
                    />
                )}
                <View style={styles.buttonsContainer}>
                    {password && (
                        <Button
                            onPress={handlePassword}
                            label={t('button.enter')}
                        />
                    )}
                    {biometrics && hasBiometrics && (
                        <Button
                            variant='flat'
                            onPress={handleBiometrics}
                            label={t('biometric.unlock')}
                        />
                    )}
                    <Button
                        variant='light'
                        label={t('button.cancel')}
                        onPress={() => router.back()}
                    />
                </View>
            </View>

            <Toast
                message={message}
                setMessage={setMessage}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    passwordContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24
    },
    buttonsContainer: {
        width: '100%',
        gap: 16,
        marginTop: 64
    }
})
