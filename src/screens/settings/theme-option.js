import { StyleSheet, ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'

import { OptionLarge } from './option-large'
import { ColorOption } from './color-option'
import { Section } from '@/components/section'

import { useToggleMode } from '@/hooks/use-toggle-mode'
import { usePro } from '@/hooks/use-pro'
import { isAccentAllowed, toggleAccentSelection } from '@/utils/accent'

import { ACCENT_COLORS, ACCENT_OPTIONS, THEME_COLORS, THEME_OPTIONS } from '@/constants/themes'

export function ThemeOption() {
    const { t } = useTranslation()
    const { pro } = usePro()

    const {
        mode, toggleMode,
        accent, toggleAccent
    } = useToggleMode()

    const onToggleAccent = (color) => {
        if (!isAccentAllowed(color, pro)) {
            ToastAndroid.show(t('repositories.pro_required'), ToastAndroid.SHORT)
            return
        }

        toggleAccent(toggleAccentSelection(color, accent))
    }

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
                        {t(`theme.${color}`)}
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
                        onPress={() => onToggleAccent(color)}
                        options={ACCENT_COLORS}
                    >
                        {t(`accent.${color}`)}
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
