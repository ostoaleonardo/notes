import { ScrollView, StyleSheet, View } from 'react-native'
import { Note } from './Note'

export function NotesContainer() {
    return (
        <ScrollView
            overScrollMode='never'
            style={styles.scrollContainer}
        >
            <View style={styles.notesContainer}>
                <Note title='Note 1' content='This is the first note' />
                <Note title='Note 2' content='This is the second note' />
                <Note title='Note 3' content='This is the third note' />
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
