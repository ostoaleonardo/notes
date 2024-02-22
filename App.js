import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'

export default function App() {
    return (
        <View style={styles.container}>
            <Text>Notes</Text>
            <StatusBar style='inverted' />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#18181b',
    },
})
