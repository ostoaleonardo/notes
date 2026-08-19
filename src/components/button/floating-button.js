import React from 'react'
import { Link } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useIconProps } from '@/hooks'

export function FloatingButton({ icon, href, onPress }) {
    const { colors } = useTheme()
    const iconProps = useIconProps()

    const style = {
        ...styles.container,
        backgroundColor: colors.tertiary
    }

    const content = icon && React.cloneElement(icon, iconProps)

    if (href) {
        return (
            <Link href={href} style={style}>
                {content}
            </Link>
        )
    }

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
        padding: 24,
        borderRadius: 24
    }
})
