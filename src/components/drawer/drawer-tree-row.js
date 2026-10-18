import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'
import { levelRowStyles } from './drawer-level-styles'

import { ChevronRight } from '@/icons/chevron-right'
import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'

import { DRAWER_ITEM } from '@/constants/components'
import { OPACITY, RADIUS, SPACING } from '@/constants/theme'

export function DrawerTreeRow({
    label,
    depth,
    collapsed,
    expandable = true,
    count,
    bold,
    uppercase,
    onPress,
    onLongPress
}) {
    const { colors } = useTheme()

    const Chevron = collapsed ? ChevronRight : KeyboardArrowDown
    const paddingStart = DRAWER_ITEM.paddingHorizontal + depth * SPACING.lg

    return (
        <View style={styles.container}>
            <TouchableRipple
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
                                width={DRAWER_ITEM.iconSize}
                                height={DRAWER_ITEM.iconSize}
                            />
                        )}
                    </View>
                </View>
            </TouchableRipple>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: RADIUS.xl,
        marginBottom: DRAWER_ITEM.rowGap
    }
})
