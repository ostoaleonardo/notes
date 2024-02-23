import { ScrollView, StyleSheet, View } from 'react-native'
import { Note } from './Note'
import { useNotes } from '../hooks/useNotes'
import { HomeMessage } from './HomeMessage'

export function NotesContainer() {
    const { notes, loading } = useNotes()

    return (
        <ScrollView
            overScrollMode='never'
            style={styles.scrollContainer}
        >
            <View style={styles.notesContainer}>
                {loading && <HomeMessage label='Loading...' />}

                {notes.map(({ title, note }, index) => (
                    <Note key={index} title={title} note={note} />
                ))}

                {notes.length === 0 && !loading && (
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
        gap: 24,
        width: '100%',
        paddingVertical: 24,
        alignItems: 'center',
    },
})
