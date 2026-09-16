import { View, StyleSheet } from 'react-native'
import { Tooltip, TouchableRipple, useTheme } from 'react-native-paper'

import { AnimatedView } from '../animated/animated-view'
import { Typography } from '../typography'

import { useSegmentedCornerStyle } from '@/hooks/use-segmented-corner-style'

export function FilterToggle({ icon: Icon, label, selected, onPress, position = 'middle', disabled = false }) {
    const { colors } = useTheme()
    const animatedStyle = useSegmentedCornerStyle(position, selected)

    const contentColor = selected ? colors.background : colors.onBackground

    return (
        <Tooltip title={label}>
            <AnimatedView
                style={[
                    styles.container,
                    animatedStyle,
                    disabled && styles.disabled, {
                        borderColor: colors.outline,
                        backgroundColor: selected ? colors.onBackground : 'transparent'
                    }
                ]}
            >
                <TouchableRipple
                    disabled={disabled}
                    onPress={onPress}
                    style={styles.touchable}
                    accessibilityLabel={label}
                >
                    <View style={styles.content}>
                        <Icon color={contentColor} width={16} height={16} />
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
        borderWidth: 1,
        overflow: 'hidden'
    },
    disabled: {
        opacity: 0.4
    },
    touchable: {
        paddingVertical: 6,
        paddingHorizontal: 12
    },
    content: {
        gap: 6,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
