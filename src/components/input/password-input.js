import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { IconButton, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useAnimatedShake } from '@/hooks'
import { Typography } from '../typography'
import { LargeInput } from './large-input'
import { Eye } from '@/icons'
import { COLORS } from '@/constants'

export function PasswordInput({ message, ...props }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { shake, style } = useAnimatedShake()

    const [hide, setHide] = useState(true)
    const togglePassword = () => setHide(!hide)

    useEffect(() => {
        if (message) shake()
    }, [message])

    return (
        <View style={styles.container}>
            <Animated.View
                style={[styles.password, style]}
            >
                <LargeInput
                    {...props}
                    placeholder='••••••••'
                    minLength={4}
                    maxLength={8}
                    letterSpacing={2}
                    keyboardType='numeric'
                    secureTextEntry={hide}
                />
                <IconButton
                    onPress={togglePassword}
                    icon={() => <Eye color={colors.onSurface} opacity={hide ? 0.3 : 1} />}
                    accessibilityLabel={t(hide ? 'password.show' : 'password.hide')}
                />
            </Animated.View>
            <Typography
                variant='caption'
                textAlign='center'
                color={COLORS.base.accent}
            >
                {message}
            </Typography>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center'
    },
    password: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
