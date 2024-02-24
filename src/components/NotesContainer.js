import { ScrollView, StyleSheet, View } from 'react-native'
import Animated, { CurvedTransition, LinearTransition } from 'react-native-reanimated'
import { Note } from './Note'
import { HomeMessage } from './HomeMessage'
import { useNotes } from '../hooks'

export function NotesContainer() {
    const { notes, loading } = useNotes()

    return (
        <ScrollView
            overScrollMode='never'
            style={styles.scrollContainer}
        >
            <View style={styles.notesContainer}>
                {loading && <HomeMessage label='Loading...' />}

                {notes.map(({ id, title, note }) => (
                    <Note key={id} id={id} title={title} note={note} />
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
        width: '100%',
        gap: 16,
        paddingVertical: 24,
    },
})
