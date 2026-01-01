import { useState } from 'react'
import { StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'
import { IconButton, useTheme } from 'react-native-paper'
import { useAnimatedShake } from '@/hooks/useAnimatedShake'
import { LargeInput } from './LargeInput'
import { Eye } from '@/icons'

export function PasswordInput({ password, onChangeText, isInvalid, ...props }) {
    const { colors } = useTheme()
    const { shake, style } = useAnimatedShake()
    const [hidePassword, setHidePassword] = useState(true)

    const togglePassword = () => setHidePassword(!hidePassword)

    if (isInvalid) { shake() }

    return (
        <Animated.View style={[styles.container, style]}>
            <LargeInput
                {...props}
                value={password}
                onChangeText={onChangeText}
                placeholder='••••••••'
                minLength={4}
                maxLength={8}
                letterSpacing={2}
                keyboardType='numeric'
                secureTextEntry={hidePassword}
            />
            <IconButton
                icon={() => (
                    <Eye
                        color={colors.onBackground}
                        opacity={hidePassword ? 0.3 : 1}
                    />
                )}
                onPress={togglePassword}
            />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
