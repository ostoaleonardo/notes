import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { NotesContainer } from '../src/components'

export default function App() {
    return (
        <View style={styles.container}>
            <View style={styles.homeHeader}>
                <Text style={styles.homeTitle}>Notes</Text>
            </View>
            <NotesContainer />
            <StatusBar
                style='inverted'
                backgroundColor='#18181b'
            />
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
    homeHeader: {
        width: '100%',
        padding: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeTitle: {
        fontSize: 16,
        color: 'white',
        textTransform: 'uppercase',
    },
    addNoteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addNote: {
        fontSize: 16,
        color: 'white',
        textTransform: 'uppercase',
    },
    notesContainer: {
        flex: 1,
        gap: 24,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
