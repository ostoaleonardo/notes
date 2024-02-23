import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { NotesContainer } from '../src/components'
import { colors } from '../src/constants'

export default function App() {
    return (
        <View style={styles.container}>
            <NotesContainer />
            <StatusBar style='inverted' />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    notesContainer: {
        flex: 1,
        gap: 24,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
