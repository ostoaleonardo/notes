import { forwardRef, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import * as Animatable from 'react-native-animatable'
import { ModalSheet, PasswordInput, Pressable, Typography } from '@/components'
import { useHaptics, useLocalAuthentication, useNotes } from '@/hooks'
import { getEncryptedPassword } from '@/utils'
import { Fingerprint } from '@/icons'
import { COLORS, FEEDBACK_TYPES, FONTS } from '@/constants'

export const DeleteNote = forwardRef(({ id, onClose }, ref) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { vibrate } = useHaptics()
    const { getNote, deleteNote } = useNotes()
    const { password, biometrics } = getNote(id)
    const { hasBiometrics, authenticate } = useLocalAuthentication()

    const [passwordInput, setPasswordInput] = useState('')
    const [encryptedInput, setEncryptedInput] = useState('')
    const [encryptedPassword, setEncryptedPassword] = useState('')
    const [isWrongPassword, setIsWrongPassword] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        setEncryptedPassword(password)
    }, [password])

    useEffect(() => {
        (async () => {
            const digest = await getEncryptedPassword(passwordInput)
            setEncryptedInput(digest)
        })()
    }, [passwordInput])

    const handlePassword = () => {
        if (encryptedInput === encryptedPassword) {
            deleteNote(id)
            vibrate(FEEDBACK_TYPES.SUCCESS)
            onClose()
        } else {
            setIsWrongPassword(true)
            vibrate(FEEDBACK_TYPES.ERROR)
            setMessage(t('message.wrongPassword'))
        }
    }

    const handleBiometrics = async () => {
        const success = await authenticate(t('title.deleteNote'))

        if (success) {
            deleteNote(id)
            vibrate(FEEDBACK_TYPES.SUCCESS)
            onClose()
        }
    }

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            enableDynamicSizing
            title={t('title.deleteNote')}
            contentContainerStyle={styles.container}
        >
            <View style={styles.inputContainer}>
                {password || !biometrics ? (
                    <>
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
                        <Typography
                            variant='caption'
                            textAlign='center'
                            color={COLORS.base.accent}
                        >
                            {message && t('message.wrongPassword')}
                        </Typography>
                    </>
                ) : (
                    <Fingerprint
                        width={96}
                        height={96}
                        fill={colors.onBackground}
                    />
                )}
            </View>
            <View style={styles.buttons}>
                {password && (
                    <Pressable
                        mode='contained'
                        onPress={handlePassword}
                    >
                        {t('button.delete')}
                    </Pressable>
                )}
                {biometrics && hasBiometrics && (
                    <Pressable
                        mode='outlined'
                        onPress={handleBiometrics}
                    >
                        {t('biometric.use')}
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
        paddingBottom: 80,
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center'
    },
    buttons: {
        width: '100%',
        gap: 8
    },
    label: {
        fontSize: 12,
        paddingHorizontal: 8,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})
