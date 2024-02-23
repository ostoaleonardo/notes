import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { FloatingButton, NotesContainer } from '../src/components'
import { colors } from '../src/constants'

export default function App() {
    return (
        <View style={styles.container}>
            <NotesContainer />
            <FloatingButton />
            <StatusBar style='inverted' />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
})
