import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Scroll, Section, SwipeableTrash, Typography } from '@/components'

export function TrashContainer({ notes, selected, setSelected, onDelete, onRestore, loading }) {
    const { t } = useTranslation()

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
                visible={notes.length > 0}
                contentStyle={{ gap: 8 }}
            >
                {notes.map((note) => (
                    <SwipeableTrash
                        key={note.id}
                        data={note}
                        isOpen={selected === note.id}
                        onOpen={() => setSelected(note.id)}
                        onDelete={onDelete}
                        onRestore={onRestore}
                    />
                ))}
            </Section>

            {!loading && notes.length === 0 && (
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
