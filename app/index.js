import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { Categories, FloatingButton, NotesContainer } from '../src/components'
import { colors } from '../src/constants'
import 'react-native-gesture-handler'

export default function App() {
    const [filteredNotes, setFilteredNotes] = useState([])

    return (
        <View style={styles.container}>
            <Categories setFilteredNotes={setFilteredNotes} />
            <NotesContainer filteredNotes={filteredNotes} />
            <FloatingButton label='+ Add Note' />
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
