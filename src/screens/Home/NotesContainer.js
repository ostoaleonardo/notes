import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DotSeparator, Scroll, Section, SwipeableNote, Typography } from '@/components'
import { useNotes, useUtils } from '@/hooks'
import { getSortedNotes } from '@/utils'

export function NotesContainer({ selectedNote, setSelectedNote, filter, onDelete, pinned, onPin }) {
    const { t } = useTranslation()
    const { notes, loading } = useNotes()
    const { sort } = useUtils()

    const filteredNotes = notes.filter((note) => {
        if (filter.size === 0) return true
        return note.categories.some((category) => filter.has(category))
    })

    const pinnedNotes = filteredNotes.filter((note) => pinned.has(note.id))

    const remainingNotes = filteredNotes.filter((note) => !pinned.has(note.id))

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

            <Section
                title={t('pinned')}
                visible={pinnedNotes.length > 0}
                contentStyle={{ gap: 8 }}
            >
                {pinnedNotes.map((note) => (
                    <SwipeableNote
                        key={note.id}
                        data={note}
                        isOpen={selectedNote === note.id}
                        onOpen={() => setSelectedNote(note.id)}
                        onDelete={onDelete}
                        onPin={onPin}
                    />
                ))}
            </Section>

            {pinnedNotes.length > 0 && remainingNotes.length > 0 &&
                <DotSeparator />
            }

            <Section
                visible={filteredNotes.length > 0}
                contentStyle={{ gap: 8 }}
            >
                {remainingNotes
                    .sort((a, b) => getSortedNotes(a, b, sort))
                    .map((note) => (
                        <SwipeableNote
                            key={note.id}
                            data={note}
                            isOpen={selectedNote === note.id}
                            onOpen={() => setSelectedNote(note.id)}
                            onDelete={onDelete}
                            onPin={onPin}
                        />
                    ))
                }
            </Section>

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
        gap: 24,
        paddingVertical: 24,
        alignItems: 'center'
    }
})
