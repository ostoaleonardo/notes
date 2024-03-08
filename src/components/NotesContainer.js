import { ScrollView, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Note } from './SwipeableCard'
import { Message } from './Message'
import { useNotes } from '../hooks'

export function NotesContainer({ filteredNotes }) {
    const { t } = useTranslation()
    const { loading } = useNotes()

    return (
        <ScrollView
            overScrollMode='never'
            style={styles.scrollContainer}
        >
            <View style={styles.notesContainer}>
                {loading && <Message label={t('messages.loading')} />}

                {filteredNotes.map(({ id, title, note }) => (
                    <Note key={id} id={id} title={title} note={note} />
                ))}

                {filteredNotes.length === 0 && !loading && (
                    <Message label={t('messages.noNotes')} />
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
