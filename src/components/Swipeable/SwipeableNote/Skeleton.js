import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

export function Skeleton() {
    const { colors } = useTheme()
    const backgroundColor = colors.onBackground

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.skeleton1,
                    { backgroundColor }
                ]}
            />
            <View
                style={[
                    styles.skeleton2,
                    { backgroundColor }
                ]}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        opacity: 0.05,
        gap: 8
    },
    skeleton1: {
        width: '80%',
        height: 10,
        borderRadius: 6
    },
    skeleton2: {
        width: '60%',
        height: 10,
        borderRadius: 6
    }
})
