import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ListItem } from '../../ui/list-item'
import { ColorOption } from './color-option'
import { Section } from '@/ui/section'
import { showSnackbar } from '@/ui/snackbar/snackbar-host'

import { useToggleMode } from '@/hooks/use-toggle-mode'
import { usePro } from '@/hooks/use-pro'
import { isAccentAllowed, toggleAccentSelection } from '@/utils/accent'

import { ACCENT_COLORS, THEME_COLORS } from '@/constants/themes'
import { ACCENT_OPTIONS, THEME_OPTIONS } from '@/constants/theme-options'
import { SPACING } from '@/constants/theme'

export const ThemeOption = () => {
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
        <ListItem
            title={t('settings.general.theme')}
            description={t('theme.choose')}
        >
            <View style={{ gap: SPACING.xl }}>
                <ColorSection
                    title={t('settings.general.themes')}
                    names={THEME_OPTIONS}
                    options={THEME_COLORS}
                    isActive={(color) => mode === color}
                    onPress={toggleMode}
                    getLabel={(color) => t(`theme.${color}`)}
                />
                <ColorSection
                    title={t('settings.general.accent')}
                    names={ACCENT_OPTIONS}
                    options={ACCENT_COLORS}
                    isActive={(color) => accent === color}
                    onPress={onToggleAccent}
                    getLabel={(color) => t(`accent.${color}`)}
                />
            </View>
        </ListItem>
    )
}

const ColorSection = ({
    title,
    names,
    options,
    isActive,
    onPress,
    getLabel
}) => {
    return (
        <Section
            title={title}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap'
    }
})
