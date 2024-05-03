import { StyleSheet, View } from 'react-native'

export function Shade({ color }) {
    const styles = StyleSheet.create({
        container: {
            width: '100%',
            height: 96,
            borderRadius: 16,
            backgroundColor: color,
        }
    })

    return <View style={styles.container} />
}
