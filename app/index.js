import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { Categories, FloatingButton, NotesContainer } from '../src/components'
import { useNotes } from '../src/hooks'
import { colors } from '../src/constants'
import 'react-native-gesture-handler'

export default function App() {
    const { notes } = useNotes()
    const [filteredNotes, setFilteredNotes] = useState(notes)

    return (
        <View style={styles.container}>
            <Categories
                // notes={notes}
                setFilteredNotes={setFilteredNotes}
            />
            <NotesContainer filteredNotes={filteredNotes} />
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
