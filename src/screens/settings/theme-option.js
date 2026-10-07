import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Option } from './option'
import { ColorOption } from './color-option'
import { Section } from '@/components/section'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useToggleMode } from '@/hooks/use-toggle-mode'
import { usePro } from '@/hooks/use-pro'
import { isAccentAllowed, toggleAccentSelection } from '@/utils/accent'

import { ACCENT_COLORS, THEME_COLORS } from '@/constants/themes'
import { ACCENT_OPTIONS, THEME_OPTIONS } from '@/constants/theme-options'
import { SPACING } from '@/constants/theme'

export function ThemeOption() {
    const { t } = useTranslation()
    const { pro } = usePro()

    const {
        mode, toggleMode,
        accent, toggleAccent
    } = useToggleMode()

    const onToggleAccent = (color) => {
        if (!isAccentAllowed(color, pro)) {
            showSnackbar(t('repositories.pro_required'))
            return
        }

        toggleAccent(toggleAccentSelection(color, accent))
    }

    return (
        <Option
            title={t('settings.theme')}
            description={t('theme.choose')}
            isLast={true}
        >
            <ColorSection
                title={t('settings.themes')}
                names={THEME_OPTIONS}
                options={THEME_COLORS}
                isActive={(color) => mode === color}
                onPress={toggleMode}
                getLabel={(color) => t(`theme.${color}`)}
                containerStyle={{ marginTop: SPACING.lg }}
            />
            <ColorSection
                title={t('settings.accent')}
                names={ACCENT_OPTIONS}
                options={ACCENT_COLORS}
                isActive={(color) => accent === color}
                onPress={onToggleAccent}
                getLabel={(color) => t(`accent.${color}`)}
            />
        </Option>
    )
}

function ColorSection({
    title,
    names,
    options,
    isActive,
    onPress,
    getLabel,
    containerStyle
}) {
    return (
        <Section
            title={title}
            containerStyle={containerStyle}
            contentStyle={styles.container}
        >
            {names.map((color) => (
                <ColorOption
                    key={color}
                    name={color}
                    active={isActive(color)}
                    onPress={() => onPress(color)}
                    options={options}
                >
                    {getLabel(color)}
                </ColorOption>
            ))}
        </Section>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap'
    }
})
