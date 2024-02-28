import { Pressable, StyleSheet } from 'react-native'

export function IconButton({ icon, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
        >
            {icon}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
})
