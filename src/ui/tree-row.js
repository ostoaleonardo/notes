import { Pressable, StyleSheet, View } from 'react-native'

import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { ChevronRight } from '@/ui/icons/chevron-right'
import { KeyboardArrowDown } from '@/ui/icons/keyboard-arrow-down'
import { treeRowStyles } from '@/ui/tree-row-styles'
import { Touchable } from '@/ui/touchable'

import { ICON_SIZE, OPACITY, RADIUS, SPACING } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

export const TreeRow = ({
    label,
    caption,
    depth = 0,
    collapsed,
    expandable = true,
    showSlot = true,
    count,
    trailing,
    icon: Icon,
    bold,
    uppercase,
    variant,
    selected = false,
    active = false,
    onPress,
    onExpand,
    onLongPress
}) => {
    const { colors } = useTheme()

    const Chevron = collapsed ? ChevronRight : KeyboardArrowDown
    const SlotIcon = Icon ?? (expandable ? Chevron : null)
    const hasSlot = showSlot || !!SlotIcon
    const paddingStart = depth * SPACING.lg + (hasSlot ? 0 : SPACING.md)
    const textColor = (selected && colors.background) || (active && colors.accentText) || colors.onBackground
    const tinted = selected || active

    let background
    if (selected) background = { backgroundColor: colors.onBackground }
    if (active) background = { backgroundColor: colors.tertiary + TINT.fill }

    const slot = hasSlot && (
        <Pressable
            onPress={onExpand}
            disabled={!onExpand}
            hitSlop={SPACING.sm}
            accessibilityRole={onExpand ? 'button' : undefined}
            style={treeRowStyles.slot}
        >
            {!!SlotIcon && (
                <SlotIcon
                    color={textColor}
                    width={ICON_SIZE.lg}
                    height={ICON_SIZE.lg}
                    opacity={Icon ? undefined : OPACITY.muted}
                />
            )}
        </Pressable>
    )

    const title = (
        <Typography
            numberOfLines={1}
            variant={variant}
            uppercase={uppercase}
            bold={bold || active}
            color={tinted ? textColor : undefined}
        >
            {label}
        </Typography>
    )

    return (
        <View style={[styles.container, background]}>
            <Touchable
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole='button'
                accessibilityState={expandable ? { expanded: !collapsed } : undefined}
                style={[
                    treeRowStyles.touch,
                    treeRowStyles.touchEnd,
                    { paddingStart }
                ]}
            >
                <View style={treeRowStyles.content}>
                    {slot}
                    <View style={treeRowStyles.label}>
                        {title}
                        {!!caption && (
                            <Typography
                                numberOfLines={1}
                                variant='bodySmall'
                                opacity={OPACITY.muted}
                            >
                                {caption}
                            </Typography>
                        )}
                    </View>
                    {count !== undefined && (
                        <Typography
                            variant='bodySmall'
                            opacity={OPACITY.muted}
                            color={tinted ? textColor : undefined}
                        >
                            {count}
                        </Typography>
                    )}
                    {trailing}
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
