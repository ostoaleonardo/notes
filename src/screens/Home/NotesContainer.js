import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Scroll, SwipeableNote, Typography } from '@/components'
import { RemoveNoteModal } from '../Modals'
import { useNotes } from '@/hooks'

export function NotesContainer({ filteredNotes }) {
    const { t } = useTranslation()
    const { loading, deleteNote } = useNotes()
    const [openNote, setOpenNote] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleDelete = (id, isLocked) => {
        if (isLocked) {
            setIsModalVisible(true)
        } else {
            deleteNote(id)
        }
    }

    return (
        <Scroll contentStyle={styles.notesContainer}>
            {loading && (
                <Typography
                    opacity={0.5}
                >
                    {t('message.loading')}
                </Typography>
            )}

            {filteredNotes.map(({ id, ...note }) => (
                <SwipeableNote
                    key={id}
                    data={{ id, ...note }}
                    isOpen={openNote === id}
                    onOpen={() => setOpenNote(id)}
                    onDelete={handleDelete}
                />
            ))}

            {filteredNotes.length === 0 && !loading && (
                <Typography
                    opacity={0.5}
                >
                    {t('message.noNotes')}
                </Typography>
            )}

            <RemoveNoteModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                id={openNote}
                onDelete={() => deleteNote(openNote)}
            />
        </Scroll>
    )
}

const styles = StyleSheet.create({
    notesContainer: {
        flex: 1,
        gap: 16,
        paddingVertical: 24,
        alignItems: 'center',
    },
})
