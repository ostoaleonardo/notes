import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Typography } from '@/components'
import { ThemeOption } from '@/screens'
import { useToggleMode } from '@/hooks'

export default function Theme() {
    const { t } = useTranslation()
    const { mode, toggleMode } = useToggleMode()

    const themes = ['light', 'dark', 'system']

    return (
        <View style={styles.container}>
            <Typography
                variant='caption'
            >
                {t('theme.choose')}
            </Typography>

            <View style={styles.themes}>
                {themes.map((name) => (
                    <ThemeOption
                        key={name}
                        name={name}
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
