import { Pressable, StyleSheet, View } from 'react-native'

import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { ChevronRight } from '@/ui/icons/chevron-right'
import { KeyboardArrowDown } from '@/ui/icons/keyboard-arrow-down'
import { treeRowStyles } from '@/ui/tree-row-styles'
import { Touchable } from '@/ui/touchable'

import { ICON_SIZE, OPACITY, RADIUS, SPACING } from '@/ui/tokens/theme'

export const TreeRow = ({
    label,
    depth,
    collapsed,
    expandable = true,
    count,
    bold,
    uppercase,
    selected = false,
    leadingChevron = false,
    onPress,
    onExpand,
    onLongPress
}) => {
    const { colors } = useTheme()

    const Chevron = collapsed ? ChevronRight : KeyboardArrowDown
    const textColor = selected ? colors.background : colors.onBackground
    const background = selected ? { backgroundColor: colors.onBackground } : undefined
    const paddingStart = SPACING.md + depth * SPACING.lg

    const chevron = (
        <Pressable
            disabled={!onExpand}
            accessibilityRole={onExpand ? 'button' : undefined}
            hitSlop={SPACING.sm}
            onPress={onExpand}
            style={treeRowStyles.slot}
        >
            {expandable && (
                <Chevron
                    color={textColor}
                    opacity={OPACITY.muted}
                    width={ICON_SIZE.lg}
                    height={ICON_SIZE.lg}
                />
            )}
        </Pressable>
    )

    return (
        <View style={[styles.container, background]}>
            <Touchable
                accessibilityRole='button'
                accessibilityState={expandable ? { expanded: !collapsed } : undefined}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[treeRowStyles.touch, leadingChevron && treeRowStyles.touchEnd, { paddingStart }]}
            >
                <View style={treeRowStyles.content}>
                    {leadingChevron && chevron}
                    <Typography
                        bold={bold}
                        color={selected ? textColor : undefined}
                        uppercase={uppercase}
                        numberOfLines={1}
                        styleProps={treeRowStyles.label}
                    >
                        {label}
                    </Typography>
                    {count !== undefined && (
                        <Typography
                            color={selected ? textColor : undefined}
                            opacity={OPACITY.muted}
                            variant='bodySmall'
                        >
                            {count}
                        </Typography>
                    )}
                    {!leadingChevron && chevron}
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
