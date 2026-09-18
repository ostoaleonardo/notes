import { View, StyleSheet } from 'react-native'
import { Tooltip, TouchableRipple, useTheme } from 'react-native-paper'

import { AnimatedView } from '../animated/animated-view'
import { Typography } from '../typography'

import { useSegmentedCornerStyle } from '@/hooks/use-segmented-corner-style'

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
        borderWidth: 1,
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
                    disabled={disabled}
                    onPress={onPress}
                    style={[styles.touchable, pill && styles.touchablePill]}
                    accessibilityLabel={label}
                >
                    <View style={styles.content}>
                        {Icon && <Icon color={contentColor} width={16} height={16} />}
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
        opacity: 0.4
    },
    touchable: {
        paddingVertical: 6,
        paddingHorizontal: 12
    },
    touchablePill: {
        height: 44,
        paddingVertical: 0,
        paddingHorizontal: 16,
        justifyContent: 'center'
    },
    content: {
        gap: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
