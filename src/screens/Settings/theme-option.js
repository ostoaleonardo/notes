import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Typography } from '@/components'
import { COLORS } from '@/constants'

const THEMES = {
    light: {
        color: COLORS.light.onBackground,
        backgroundColor: COLORS.base.white,
        borderColor: COLORS.base.transparent
    },
    dark: {
        color: COLORS.dark.onBackground,
        backgroundColor: COLORS.dark.background,
        borderColor: COLORS.base.white + '26'
    },
    system: {
        color: COLORS.dark.onBackground,
        backgroundColor: COLORS.dark.foreground,
        borderColor: COLORS.base.transparent
    }
}

export function ThemeOption({ name, active, onPress, children }) {
    const { colors } = useTheme()
    const { tertiary, transparent } = colors
    const { color, borderColor, backgroundColor } = THEMES[name]

    return (
        <Pressable
            onPress={onPress}
            style={{
                ...styles.container,
                borderColor: active ? tertiary : transparent
            }}
        >
            <View
                style={{
                    ...styles.theme,
                    backgroundColor,
                    borderColor
                }}
            >
                <Typography
                    uppercase
                    color={color}
                    variant='caption'
                >
                    {children}
                </Typography>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 3,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center'
    },
    theme: {
        width: 128,
        height: 128,
        margin: 3,
        // backgroundColor,
        borderWidth: 1,
        borderRadius: 64,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: COLORS.base.white15
    }
})
