import { Pressable, StyleSheet, View } from 'react-native'
import { Section, Typography } from '@/components'
import { useTranslation } from 'react-i18next'
import { OptionLarge } from './option-large'
import { useToggleMode } from '@/hooks'
import { ACCENT_COLORS, ACCENT_OPTIONS, THEME_COLORS, THEME_OPTIONS } from '@/constants/themes'

export function ThemeOptionLarge() {
    const { t } = useTranslation()
    const {
        mode, toggleMode,
        accent, toggleAccent
    } = useToggleMode()

    return (
        <OptionLarge
            title={t('settings.theme')}
            description={t('theme.choose')}
            isLast={true}
        >
            <Section
                title={t('settings.themes')}
                containerStyle={{ marginTop: 16 }}
                contentStyle={styles.container}
            >
                {THEME_OPTIONS.map((color) => (
                    <ColorOption
                        key={color}
                        name={color}
                        active={mode === color}
                        onPress={() => toggleMode(color)}
                        options={THEME_COLORS}
                    >
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                    </ColorOption>
                ))}
            </Section>
            <Section
                title={t('settings.accent')}
                contentStyle={styles.container}
            >
                {ACCENT_OPTIONS.map((color) => (
                    <ColorOption
                        key={color}
                        name={color}
                        active={accent === color}
                        onPress={() => toggleAccent(color)}
                        options={ACCENT_COLORS}
                    >
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                    </ColorOption>
                ))}
            </Section>
        </OptionLarge>
    )
}

const ColorOption = ({ name, active, onPress, children, options }) => {
    const { background, borderColor } = options[name]

    return (
        <Pressable
            onPress={onPress}
            style={{
                width: 100 / 3 + '%',
                alignItems: 'center',
                gap: 4
            }}
        >
            <View
                style={{
                    ...styles.theme,
                    borderColor: borderColor,
                    borderRadius: active ? 16 : '100%',
                    backgroundColor: background
                }}
            />
            <Typography
                bold={active}
                opacity={active ? 1 : 0.3}
            >
                {children}
            </Typography>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap'
    },
    theme: {
        width: 64,
        height: 64,
        borderWidth: 2,
        borderRadius: 64
    }
})
