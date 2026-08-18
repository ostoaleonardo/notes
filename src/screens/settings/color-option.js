import { Pressable, StyleSheet, View } from 'react-native'
import { Typography } from '@/components'

export const ColorOption = ({ name, active, onPress, children, options }) => {
    const { background, borderColor } = options[name]

    return (
        <Pressable
            onPress={onPress}
            style={{
                width: 100 / 3 + '%',
                alignItems: 'center',
                gap: 4
            }}
        >
            <View
                style={{
                    ...styles.color,
                    borderColor: borderColor,
                    borderRadius: active ? 16 : '100%',
                    backgroundColor: background
                }}
            />
            <Typography
                bold={active}
                opacity={active ? 1 : 0.3}
            >
                {children}
            </Typography>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    color: {
        width: 64,
        height: 64,
        borderWidth: 2,
        borderRadius: 64
    }
})
