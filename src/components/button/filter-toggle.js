import { View, StyleSheet } from 'react-native'
import { Tooltip, TouchableRipple, useTheme } from 'react-native-paper'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'

import { useSegmentedCornerStyle } from '@/hooks/use-segmented-corner-style'

import { BUTTON } from '@/constants/components'
import { SPACING, OPACITY, ICON_SIZE, BORDER_WIDTH } from '@/constants/theme'

export function FilterToggle({
    icon: Icon,
    label,
    selected,
    onPress,
    position = 'middle',
    pill = false,
    minWidth,
    disabled = false
}) {
    const { colors } = useTheme()
    const animatedStyle = useSegmentedCornerStyle(position, selected)

    const contentColor = selected ? colors.background : colors.onBackground

    const colorStyle = pill ? {
        backgroundColor: selected ? colors.onBackground : colors.surfaceVariant
    } : {
        borderWidth: BORDER_WIDTH.thin,
        borderColor: colors.outline,
        backgroundColor: selected ? colors.onBackground : 'transparent'
    }

    return (
        <Tooltip title={label}>
            <AnimatedView
                style={[
                    styles.container,
                    animatedStyle,
                    colorStyle,
                    disabled && styles.disabled,
                    minWidth && { minWidth }
                ]}
            >
                <TouchableRipple
                    accessibilityRole='button'
                    accessibilityState={{ selected: !!selected }}
                    disabled={disabled}
                    onPress={onPress}
                    style={[styles.touchable, pill && styles.touchablePill]}
                    accessibilityLabel={label}
                >
                    <View style={styles.content}>
                        {Icon && <Icon color={contentColor} width={ICON_SIZE.md} height={ICON_SIZE.md} />}
                        <Typography variant='caption' color={contentColor}>
                            {label}
                        </Typography>
                    </View>
                </TouchableRipple>
            </AnimatedView>
        </Tooltip>
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden'
    },
    disabled: {
        opacity: OPACITY.disabled
    },
    touchable: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md
    },
    touchablePill: {
        height: BUTTON.size,
        paddingVertical: 0,
        paddingHorizontal: SPACING.lg,
        justifyContent: 'center'
    },
    content: {
        gap: SPACING.xs,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
