import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Scroll } from './Scroll'
import { Typography } from './Text'
import { SwipeableNote } from './SwipeableCard'
import { useNotes } from '@/hooks'

export function NotesContainer({ filteredNotes }) {
    const { t } = useTranslation()
    const { loading, deleteNote } = useNotes()
    const [openNote, setOpenNote] = useState(null)

    return (
        <Scroll contentStyle={styles.notesContainer}>
                {loading && (
                    <Typography
                        opacity={0.5}
                    >
                        {t('message.loading')}
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
                        onDelete={() => deleteNote(id)}
                        isOpen={openNote === id}
                        onOpen={() => setOpenNote(id)}
                    />
                ))}

                {filteredNotes.length === 0 && !loading && (
                    <Typography
                        opacity={0.5}
                    >
                        {t('message.noNotes')}
                    </Typography>
                )}
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
