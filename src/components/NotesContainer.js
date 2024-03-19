import { ScrollView, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SwipeableNote } from './SwipeableCard'
import { Typography } from './Text'
import { useNotes } from '@/hooks'

export function NotesContainer({ filteredNotes }) {
    const { t } = useTranslation()
    const { loading } = useNotes()

    return (
        <ScrollView
            overScrollMode='never'
            style={styles.scrollContainer}
        >
            <View style={styles.notesContainer}>
                {loading && (
                    <Typography
                        opacity={0.5}
                    >
                        {t('messages.loading')}
                    </Typography>
                )}

                {filteredNotes.map(({ id, title, note, images, password }) => (
                    <SwipeableNote
                        key={id}
                        id={id}
                        title={title}
                        note={note}
                        images={images}
                        hasPassword={!!password}
                    />
                ))}

                {filteredNotes.length === 0 && !loading && (
                    <Typography
                        opacity={0.5}
                    >
                        {t('messages.noNotes')}
                    </Typography>
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
        alignItems: 'center',
    },
})
