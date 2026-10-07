import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SPACING, RADIUS } from '@/constants/theme'

export function FloatingButton({ icon, label, onPress }) {
    const { colors } = useTheme()

    const style = {
        ...styles.container,
        backgroundColor: colors.tertiary
    }

    const content = icon && React.cloneElement(icon, {
        color: colors.onTertiary
    })

    return (
        <Pressable onPress={onPress} style={style} accessibilityRole='button' accessibilityLabel={label}>
            {content}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: SPACING.lg,
        right: SPACING.lg,
        padding: SPACING.xxl,
        borderRadius: RADIUS.xl
    }
})
