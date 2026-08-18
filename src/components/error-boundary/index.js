import { Pressable, StyleSheet, Text, View } from 'react-native'
import { COLORS } from '@/constants'

export function ErrorBoundary({ error, retry }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>{error?.message}</Text>
            <Pressable onPress={retry} style={styles.button}>
                <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        backgroundColor: COLORS.dark.background
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark.onBackground
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        color: COLORS.dark.onBackground,
        opacity: 0.6
    },
    button: {
        marginTop: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: COLORS.dark.surfaceVariant
    },
    buttonText: {
        color: COLORS.dark.onBackground
    }
})
