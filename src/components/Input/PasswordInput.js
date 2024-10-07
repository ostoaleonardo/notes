import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { LargeInput } from './LargeInput'
import { Eye } from '@/icons'

export function PasswordInput({ password, onChangeText, ...props }) {
    const { colors } = useTheme()
    const [hidePassword, setHidePassword] = useState(true)

    const togglePassword = () => setHidePassword(!hidePassword)

    return (
        <View style={styles.container}>
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
        </View>
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
