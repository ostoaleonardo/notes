import { Pressable, StyleSheet, View } from 'react-native'

import { Typography } from '@/components/typography'
import { DrawerIconButton } from './drawer-icon-button'

import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/icons/keyboard-arrow-up'

import { BUTTON } from '@/constants/components'
import { SPACING, OPACITY } from '@/constants/theme'

export function DrawerTreeRow({
    label,
    depth,
    collapsed,
    expandable = true,
    count,
    bold,
    uppercase,
    compact,
    onPress,
    trailing
}) {
    return (
        <View style={[styles.container, !compact && styles.regular, { paddingLeft: depth * SPACING.lg }]}>
            <Pressable
                accessibilityRole='button'
                onPress={onPress}
                style={styles.content}
                accessibilityState={expandable ? { expanded: !collapsed } : undefined}
            >
                <DrawerIconButton
                    pointerEvents='none'
                    importantForAccessibility='no'
                    icon={collapsed ? KeyboardArrowUp : KeyboardArrowDown}
                    style={[styles.chevron, !expandable && styles.hidden]}
                />
                <Typography
                    bold={bold}
                    uppercase={uppercase}
                    numberOfLines={1}
                    styleProps={styles.label}
                >
                    {label}
                </Typography>
                {count !== undefined && (
                    <Typography
                        opacity={OPACITY.muted}
                        variant='caption'
                        styleProps={styles.count}
                    >
                        {count}
                    </Typography>
                )}
            </Pressable>
            {trailing}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    regular: {
        minHeight: BUTTON.size
    },
    content: {
        flex: 1,
        gap: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center'
    },
    chevron: {
        margin: 0
    },
    hidden: {
        opacity: 0
    },
    label: {
        flexShrink: 1
    },
    count: {
        marginStart: 'auto',
        marginEnd: SPACING.lg
    }
})
