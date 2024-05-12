import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { Button, PasswordInput, Toast } from '@/components'
import { useHaptics, useHeaderTitle, useLocalAuthentication, useNotes } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { Fingerprint } from '@/icons'
import { COLORS, FEEDBACK_TYPES } from '@/constants'

export default function Password() {
    const router = useRouter()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote } = useNotes()
    const { vibrate } = useHaptics()
    const { isLoading, hasBiometrics, authenticate } = useLocalAuthentication()
    const [passwordInput, setPasswordInput] = useState('')
    const [encryptedInput, setEncryptedInput] = useState('')
    const [encryptedPassword, setEncryptedPassword] = useState('')
    const [isWrongPassword, setIsWrongPassword] = useState(false)
    const [message, setMessage] = useState('')

    useHeaderTitle(t('header.password'))

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
            router.replace('/note/edit/' + slug)
        } else {
            setIsWrongPassword(true)
            vibrate(FEEDBACK_TYPES.ERROR)
            handleToast(t('message.wrongPassword'))
        }
    }

    const handleBiometrics = async () => {
        const success = await authenticate()

        if (success) {
            router.replace('/note/edit/' + slug)
        }
    }

    const handleToast = (message) => {
        setMessage(message)
        setTimeout(() => setMessage(''), 3000)
    }

    if (biometrics && isLoading) return (
        <View style={styles.container}>
            <ActivityIndicator
                size='large'
                color={COLORS.primary}
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
                        fill={COLORS.text50}
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
            <Toast message={message} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    passwordContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    buttonsContainer: {
        width: '100%',
        gap: 16,
        marginTop: 64,
    },
})
