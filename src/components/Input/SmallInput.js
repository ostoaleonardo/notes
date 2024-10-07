import { useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FONTS } from '@/constants'

export function SmallInput({ value, onChangeText, placeholder }) {
    const { colors } = useTheme()
    const { tertiary, onBackground } = colors

    const [alpha, setAlpha] = useState('1a')

    return (
        <TextInput
            value={value}
            style={{
                ...styles.base,
                color: onBackground,
                borderBottomColor: onBackground + alpha
            }}
            placeholder={placeholder}
            onChangeText={onChangeText}
            cursorColor={onBackground}
            selectionHandleColor={tertiary}
            selectionColor={onBackground + '33'}
            placeholderTextColor={onBackground + '66'}
            onFocus={() => setAlpha('ff')}
            onBlur={() => setAlpha('1a')}
        />
    )
}

const styles = StyleSheet.create({
    base: {
        flex: 1,
        height: 72,
        fontSize: 14,
        borderBottomWidth: 1,
        fontFamily: FONTS.azeretLight
    }
})
