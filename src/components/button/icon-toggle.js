import { useCallback, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Tooltip, TouchableRipple, useTheme } from 'react-native-paper'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'

import { useExpandingWidth } from '@/hooks/use-expanding-width'
import { useSegmentedCornerStyle } from '@/hooks/use-segmented-corner-style'

import { BUTTON, ICON_TOGGLE } from '@/constants/components'
import { OPACITY } from '@/constants/theme'

export function IconToggle({
    icon: Icon,
    label,
    testID,
    onPress,
    showLabel = false,
    expandable = false,
    iconSize: iconSizeOverride,
    selected = false,
    minWidth,
    onWidth,
    background,
    color,
    disabled = false
}) {
    const { colors } = useTheme()
    const backgroundColor = selected ? colors.onBackground : background ?? colors.surfaceVariant
    const contentColor = selected ? colors.background : color ?? colors.onBackground

    const iconSize = iconSizeOverride ??
        (showLabel ? ICON_TOGGLE.iconSizeWithLabel : ICON_TOGGLE.iconSize)

    const [pressed, setPressed] = useState(false)
    const onPressIn = useCallback(() => setPressed(true), [])
    const onPressOut = useCallback(() => setPressed(false), [])

    const onContentLayout = useCallback((event) => {
        onWidth?.(label, event.nativeEvent.layout.width + ICON_TOGGLE.labelPaddingTotal)
    }, [label, onWidth])

    const releaseDuration = expandable ? 0 : undefined
    const animatedStyle = useSegmentedCornerStyle(pressed || selected, releaseDuration)
    const expanding = useExpandingWidth(showLabel, expandable, label)

    const renderContent = (extra) => (
        <>
            {Icon && (
                <Icon
                    color={contentColor}
                    width={iconSize}
                    height={iconSize}
                />
            )}
            {extra && (
                <Typography numberOfLines={1} variant='bodySmall' color={contentColor}>
                    {label}
                </Typography>
            )}
        </>
    )

    const touchableStyle = expandable
        ? styles.touchableExpandable
        : showLabel ? [styles.touchableLabel, { minWidth }] : styles.touchable

    const contentStyle = expandable && showLabel && expanding.contentWidth !== null
        ? [styles.content, styles.contentFixed, { width: expanding.contentWidth }]
        : styles.content

    return (
        <Tooltip title={label}>
            <AnimatedView
                {...(expandable && { layout: undefined })}
                style={[
                    styles.container,
                    animatedStyle,
                    expandable && expanding.style,
                    { backgroundColor, opacity: disabled ? OPACITY.disabled : 1 }
                ]}
            >
                <TouchableRipple
                    accessibilityRole='button'
                    disabled={disabled}
                    testID={testID}
                    onPress={onPress}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    style={touchableStyle}
                    accessibilityLabel={label}
                >
                    <View
                        style={contentStyle}
                        onLayout={expandable ? undefined : onContentLayout}
                    >
                        {renderContent(showLabel)}
                    </View>
                </TouchableRipple>

                {expanding.needsMeasure && (
                    <View
                        pointerEvents='none'
                        importantForAccessibility='no-hide-descendants'
                        style={styles.measurer}
                    >
                        <View
                            style={styles.content}
                            onLayout={expanding.onMeasure}
                        >
                            {renderContent(true)}
                        </View>
                    </View>
                )}
            </AnimatedView>
        </Tooltip>
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden'
    },
    touchable: {
        width: BUTTON.size,
        height: BUTTON.size,
        alignItems: 'center',
        justifyContent: 'center'
    },
    touchableLabel: {
        height: BUTTON.size,
        paddingHorizontal: ICON_TOGGLE.labelPaddingHorizontal,
        alignItems: 'center',
        justifyContent: 'center'
    },
    touchableExpandable: {
        height: BUTTON.size,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        gap: ICON_TOGGLE.gap,
        flexDirection: 'row',
        alignItems: 'center'
    },
    contentFixed: {
        flexShrink: 0
    },
    measurer: {
        width: ICON_TOGGLE.measureOffset,
        left: -ICON_TOGGLE.measureOffset,
        opacity: 0,
        position: 'absolute',
        flexDirection: 'row'
    }
})
