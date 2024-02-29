import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { Categories, FloatingButton, NotesContainer } from '../../../../src/components'
import { useHeaderTitle } from '../../../../src/hooks'
import { colors } from '../../../../src/constants'

export default function App() {
    const [filteredNotes, setFilteredNotes] = useState([])

    useHeaderTitle('Notes')

    return (
        <View style={styles.container}>
            <Categories setFilteredNotes={setFilteredNotes} />
            <NotesContainer filteredNotes={filteredNotes} />
            <FloatingButton label='+ Add Note' href='/note' />
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
