import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { LargeInput } from './LargeInput'
import { IconButton } from '../Button'
import { Eye } from '@/icons'

export function PasswordInput({ password, onChangeText, ...props }) {
    const { colors } = useTheme()
    const [showPassword, setShowPassword] = useState(false)

    const handlePassword = () => setShowPassword(!showPassword)

    return (
        <View style={styles.container}>
            <LargeInput
                {...props}
                value={password}
                onChangeText={onChangeText}
                placeholder='········'
                minLength={4}
                maxLength={8}
                autoCorrect={false}
                keyboardType='numeric'
                secureTextEntry={!showPassword}
            />
            <IconButton
                variant='light'
                onPress={() => handlePassword(password)}
                icon={
                    <Eye
                        color={colors.onBackground}
                        opacity={showPassword ? 1 : 0.3}
                    />
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '70%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
