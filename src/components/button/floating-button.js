import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SPACING } from '@/constants/spacing'

export function FloatingButton({ icon, onPress }) {
    const { colors } = useTheme()

    const style = {
        ...styles.container,
        backgroundColor: colors.tertiary
    }

    const content = icon && React.cloneElement(icon, {
        color: colors.onTertiary
    })

    return (
        <Pressable onPress={onPress} style={style}>
            {content}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        padding: SPACING.xxl,
        borderRadius: 24
    }
})
