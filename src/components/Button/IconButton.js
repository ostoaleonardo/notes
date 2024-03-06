import { Pressable, StyleSheet } from 'react-native'

export function IconButton({ icon, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && { opacity: 0.5 },
            ]}
        >
            {icon}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
