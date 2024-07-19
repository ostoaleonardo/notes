import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import { Typography } from '@/components'
import { useToggleMode } from '@/hooks'
import { COLORS } from '@/constants'

const THEMES = [
    {
        name: 'light',
        color: COLORS.light.onBackground,
        background: COLORS.common.white
    },
    {
        name: 'dark',
        color: COLORS.dark.onBackground,
        background: COLORS.dark.background
    },
    {
        name: 'system',
        color: COLORS.dark.onBackground,
        background: COLORS.dark.foreground
    }
]

function ThemeOption({ color, backgroundColor, active, onPress, children }) {
    const styles = StyleSheet.create({
        container: {
            borderRadius: 80,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: active ? COLORS.common.accent : COLORS.common.transparent
        },
        theme: {
            width: 128,
            height: 128,
            margin: 3,
            backgroundColor,
            borderRadius: 64,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: COLORS.common.white15
        }
    })

    return (
        <Pressable
            style={styles.container}
            onPress={onPress}
        >
            <View style={styles.theme}>
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

export default function Theme() {
    const { t } = useTranslation()
    const { mode, toggleMode } = useToggleMode()

    return (
        <View style={styles.container}>
            <Typography
                variant='caption'
            >
                {t('settings.chooseTheme')}
            </Typography>

            <View style={styles.themes}>
                {THEMES.map(({ name, color, background }) => (
                    <ThemeOption
                        key={name}
                        color={color}
                        backgroundColor={background}
                        active={mode === name}
                        onPress={() => toggleMode(name)}
                    >
                        {t('theme.' + name)}
                    </ThemeOption>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 96,
        padding: 24
    },
    themes: {
        gap: 40,
        alignItems: 'center'
    }
})
