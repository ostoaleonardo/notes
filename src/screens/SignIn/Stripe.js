import { StyleSheet, View } from 'react-native'

export function Stripe({ color }) {
    const styles = StyleSheet.create({
        stripe: {
            flex: 1,
            height: 8,
            backgroundColor: color,
        }
    })

    return <View style={styles.stripe} />
}
