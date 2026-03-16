import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Section } from '@/components'
import { OptionLarge } from './option-large'
import { ColorOption } from './color-option'
import { useToggleMode } from '@/hooks'
import { usePremium } from '@/hooks/use-premium'
import { ACCENT_COLORS, ACCENT_OPTIONS, THEME_COLORS, THEME_OPTIONS } from '@/constants/themes'

export function ThemeOption() {
    const { t } = useTranslation()
    const { premium } = usePremium()

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
                visible={premium}
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

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap'
    }
})
