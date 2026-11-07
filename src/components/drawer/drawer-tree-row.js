import { StyleSheet, View } from 'react-native'

import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'
import { levelRowStyles } from './drawer-level-styles'

import { ChevronRight } from '@/icons/chevron-right'
import { KeyboardArrowDown } from '@/ui/icons/keyboard-arrow-down'
import { Touchable } from '@/ui/touchable'

import { OPACITY, RADIUS, SPACING, ICON_SIZE } from '@/constants/theme'

export const DrawerTreeRow = ({
    label,
    depth,
    collapsed,
    expandable = true,
    count,
    bold,
    uppercase,
    onPress,
    onLongPress
}) => {
    const { colors } = useTheme()

    const Chevron = collapsed ? ChevronRight : KeyboardArrowDown
    const paddingStart = SPACING.md + depth * SPACING.lg

    return (
        <View style={styles.container}>
            <Touchable
                accessibilityRole='button'
                accessibilityState={expandable ? { expanded: !collapsed } : undefined}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[levelRowStyles.touch, { paddingStart }]}
            >
                <View style={levelRowStyles.content}>
                    <Typography
                        bold={bold}
                        uppercase={uppercase}
                        numberOfLines={1}
                        styleProps={levelRowStyles.label}
                    >
                        {label}
                    </Typography>
                    {count !== undefined && (
                        <Typography opacity={OPACITY.muted} variant='bodySmall'>
                            {count}
                        </Typography>
                    )}
                    <View style={levelRowStyles.slot}>
                        {expandable && (
                            <Chevron
                                color={colors.onBackground}
                                opacity={OPACITY.muted}
                                width={ICON_SIZE.lg}
                                height={ICON_SIZE.lg}
                            />
                        )}
                    </View>
                </View>
            </Touchable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: RADIUS.xl
    }
})
