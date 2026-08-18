import { memo, useCallback, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DotSeparator, Scroll, Section, SwipeableNote, Typography } from '@/components'
import { useNotes, useUtils } from '@/hooks'
import { getSortedNotes } from '@/utils'

export function NotesContainer({
    selected,
    setSelected,
    filter,
    onUnlock,
    onDelete,
    pinned,
    onPin
}) {
    const scrollRef = useRef(null)

    const { t } = useTranslation()
    const { notes, loading } = useNotes()
    const { sort, view } = useUtils()
    const grid = view === 'grid'

    const filteredNotes = useMemo(() => {
        return notes.filter((note) => {
            if (filter.size === 0) return true
            return note.categories?.some((category) => filter.has(category))
        })
    }, [notes, filter])

    const pinnedNotes = useMemo(() => {
        return filteredNotes.filter((note) => pinned.has(note.id))
    }, [filteredNotes, pinned])

    const remainingNotes = useMemo(() => {
        return filteredNotes.filter((note) => !pinned.has(note.id))
    }, [filteredNotes, pinned])

    const renderNotes = useCallback((elements) => {
        if (loading || elements.length === 0) return null

        const cards = elements.map((note) => (
            <SwipeableNote
                ref={scrollRef}
                key={note.id}
                data={note}
                isOpen={selected === note.id}
                onOpen={() => setSelected(note.id)}
                onDelete={(isLocked) => onDelete(note, isLocked)}
                onUnlock={() => onUnlock(note.id)}
                onPin={() => onPin(note.id)}
                grid={grid}
            />
        ))

        if (!grid) return cards

        const columns = [[], []]
        cards.forEach((card, index) => columns[index % 2].push(card))

        return (
            <View style={styles.columns}>
                {columns.map((column, index) => (
                    <View key={index} style={styles.column}>
                        {column}
                    </View>
                ))}
            </View>
        )
    }, [loading, onUnlock, onDelete, onPin, selected, setSelected, grid])

    return (
        <Scroll ref={scrollRef} contentContainerStyle={styles.container}>
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
                contentStyle={styles.list}
            >
                {renderNotes(pinnedNotes)}
            </Section>

            {pinnedNotes.length > 0 && remainingNotes.length > 0 &&
                <DotSeparator />
            }

            <Section
                visible={filteredNotes.length > 0}
                contentStyle={styles.list}
            >
                {renderNotes([...remainingNotes].sort(
                    (a, b) => getSortedNotes(a, b, sort)
                ))}
            </Section>

            {filteredNotes.length === 0 && !loading && (
                <Typography
                    opacity={0.5}
                    variant='caption'
                >
                    {t('message.notes.empty')}
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
    },
    list: {
        gap: 8
    },
    columns: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8
    },
    column: {
        flex: 1,
        gap: 8
    }
})
