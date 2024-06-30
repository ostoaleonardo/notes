import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Scroll, SwipeableNote, Typography } from '@/components'
import { useNotes } from '@/hooks'

export function NotesContainer({ onOpen, filteredNotes, selectedNote, setSelectedNote }) {
    const { t } = useTranslation()
    const { loading, deleteNote } = useNotes()

    const handleDelete = (id, isLocked) => {
        if (isLocked) {
            setSelectedNote(id)
            onOpen()
        } else {
            deleteNote(id)
        }
    }

    return (
        <Scroll contentContainerStyle={styles.container}>
            {loading && (
                <Typography
                    opacity={0.5}
                    variant='caption'
                >
                    {t('message.loading')}
                </Typography>
            )}

            {filteredNotes.map(({ id, ...note }) => (
                <SwipeableNote
                    key={id}
                    data={{ id, ...note }}
                    isOpen={selectedNote === id}
                    onOpen={() => setSelectedNote(id)}
                    onDelete={handleDelete}
                />
            ))}

            {filteredNotes.length === 0 && !loading && (
                <Typography
                    opacity={0.5}
                    variant='caption'
                >
                    {t('message.noNotes')}
                </Typography>
            )}
        </Scroll>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        gap: 16,
        paddingVertical: 24,
        alignItems: 'center'
    }
})
