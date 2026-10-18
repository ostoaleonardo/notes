import { useCallback, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'

import { FILLED_INPUT } from '@/constants/components'
import { FONTS, OPACITY, RADIUS, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

export function FilledInput({ label, onFocus, onBlur, ...props }) {
    const { colors } = useTheme()
    const [focused, setFocused] = useState(false)

    const handleFocus = useCallback((event) => {
        setFocused(true)
        onFocus?.(event)
    }, [onFocus])

    const handleBlur = useCallback((event) => {
        setFocused(false)
        onBlur?.(event)
    }, [onBlur])

    const accent = focused ? colors.accentText : colors.onBackground + TRANSPARENT[50]

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surfaceVariant,
                    borderBottomColor: accent,
                    borderBottomWidth: focused
                        ? FILLED_INPUT.indicatorFocused
                        : FILLED_INPUT.indicatorIdle
                }
            ]}
        >
            <Typography
                variant='bodySmall'
                color={focused ? colors.accentText : colors.onBackground}
                opacity={focused ? 1 : OPACITY.secondary}
            >
                {label}
            </Typography>

            <TextInput
                multiline
                {...props}
                style={[styles.input, { color: colors.onBackground }]}
                cursorColor={colors.accentText}
                selectionHandleColor={colors.accentText}
                selectionColor={colors.tertiary + TRANSPARENT[30]}
                placeholderTextColor={colors.onBackground + TRANSPARENT[40]}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: FILLED_INPUT.minHeight,
        gap: FILLED_INPUT.labelGap,
        paddingTop: FILLED_INPUT.paddingTop,
        paddingBottom: FILLED_INPUT.paddingBottom,
        paddingHorizontal: FILLED_INPUT.paddingHorizontal,
        borderTopLeftRadius: RADIUS.xs,
        borderTopRightRadius: RADIUS.xs
    },
    input: {
        padding: 0,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodyMedium,
        fontFamily: FONTS.azeretLight
    }
})
