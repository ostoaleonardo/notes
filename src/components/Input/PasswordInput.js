import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { LargeInput } from './LargeInput'
import { IconButton } from '../Button'
import { Eye } from '@/icons'
import { colors } from '@/constants'

export function PasswordInput({ password, onChangeText, ...props }) {
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
                icon={
                    <Eye
                        width={24}
                        height={24}
                        color={showPassword ? colors.text : colors.text15}
                    />
                }
                size='md'
                variant='light'
                onPress={() => handlePassword(password)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '70%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
})
