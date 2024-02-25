import { ScrollView, StyleSheet, View } from 'react-native'
import { Note } from './SwipeableCard'
import { HomeMessage } from './HomeMessage'
import { useNotes } from '../hooks'

export function NotesContainer({ filteredNotes }) {
    const { loading } = useNotes()

    return (
        <ScrollView
            overScrollMode='never'
            style={styles.scrollContainer}
        >
            <View style={styles.notesContainer}>
                {loading && <HomeMessage label='Loading...' />}

                {filteredNotes.map(({ id, title, note }) => (
                    <Note key={id} id={id} title={title} note={note} />
                ))}

                {filteredNotes.length === 0 && !loading && (
                    <HomeMessage label='No notes yet' />
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    notesContainer: {
        flex: 1,
        gap: 16,
        paddingVertical: 24,
    },
})
