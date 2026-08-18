import { StyleSheet, TextInput, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FONTS, TRANSPARENT } from '@/constants'

export function SmallInput({ background, ...props }) {
    const { colors } = useTheme()
    const { tertiary, surface, onBackground } = colors

    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: background || surface
            }}
        >
            <TextInput
                style={{
                    ...styles.base,
                    color: onBackground
                }}
                cursorColor={onBackground}
                selectionHandleColor={tertiary}
                selectionColor={onBackground + TRANSPARENT[20]}
                placeholderTextColor={onBackground + TRANSPARENT[40]}
                {...props}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 16
    },
    base: {
        flex: 1,
        fontSize: 14,
        fontFamily: FONTS.azeretLight
    }
})
