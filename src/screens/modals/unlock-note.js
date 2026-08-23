import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { PasswordInput } from '@/components/input'
import { Pressable } from '@/components/button'
import { useNoteAuthentication, useNotes, useTabs } from '@/hooks'
import { Fingerprint } from '@/icons'

export function UnlockNote() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { getNote } = useNotes()
    const { pendingUnlockId: id, confirmUnlock } = useTabs()

    const { biometrics, password } = getNote(id) || {}

    const {
        passwordValue,
        setPasswordValue,
        hasBiometrics,
        authenticated,
        authBiometrics,
        verifyPassword,
        resetError,
        message
    } = useNoteAuthentication(id, password)

    const hasBothLocks = (hasBiometrics && biometrics) && password

    useEffect(() => {
        if (biometrics && hasBiometrics) {
            authBiometrics(t('biometric.unlock'))
        }
    }, [id])

    useEffect(() => {
        if (authenticated) confirmUnlock()
    }, [authenticated])

    return (
        <View style={styles.container}>
            <View style={styles.security}>
                {password || !biometrics ? (
                    <PasswordInput
                        modal={true}
                        value={passwordValue}
                        onChangeText={(text) => {
                            if (message) resetError()
                            setPasswordValue(text)
                        }}

                        onBlur={resetError}
                        message={t(message)}
                    />
                ) : (
                    <Fingerprint
                        width={64} height={64}
                        fill={colors.onSurface}
                    />
                )}
            </View>

            <View style={styles.buttons}>
                {password && (
                    <Pressable
                        mode='contained'
                        onPress={verifyPassword}
                    >
                        {t('button.enter')}
                    </Pressable>
                )}
                {biometrics && hasBiometrics && (
                    <Pressable
                        onPress={() => authBiometrics(t('biometric.unlock'))}
                        mode={hasBothLocks ? 'outlined' : 'contained'}
                    >
                        {t('biometric.unlock')}
                    </Pressable>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    security: {
        paddingTop: 32,
        paddingBottom: 48
    },
    buttons: {
        width: '100%',
        gap: 8
    }
})
