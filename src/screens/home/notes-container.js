import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { AnimatedList, DotSeparator, Scroll, Section, SwipeableNote, Typography } from '@/components'
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
        return [...filteredNotes.filter((note) => !pinned.has(note.id))].sort(
            (a, b) => getSortedNotes(a, b, sort)
        )
    }, [filteredNotes, pinned, sort])

    const renderCard = useCallback((note) => (
        <SwipeableNote
            key={note.id}
            data={note}
            isOpen={selected === note.id}
            onOpen={() => setSelected(note.id)}
            onDelete={(isLocked) => onDelete(note, isLocked)}
            onUnlock={() => onUnlock(note.id)}
            onPin={() => onPin(note.id)}
            grid={grid}
        />
    ), [selected, onUnlock, onDelete, onPin, setSelected, grid])

    const renderColumns = useCallback((elements) => {
        if (loading || elements.length === 0) return null

        const columns = [[], []]
        elements.forEach((note, index) => columns[index % 2].push(renderCard(note)))

        return (
            <View style={styles.columns}>
                {columns.map((column, index) => (
                    <View key={index} style={styles.column}>
                        {column}
                    </View>
                ))}
            </View>
        )
    }, [loading, renderCard])

    const isEmpty = filteredNotes.length === 0 && !loading

    const header = (
        <View style={styles.header}>
            {loading && (
                <Typography opacity={0.5} variant='caption'>
                    {t('message.loading')}
                </Typography>
            )}

            {isEmpty && (
                <Typography opacity={0.5} variant='caption'>
                    {t('message.notes.empty')}
                </Typography>
            )}

            <Section
                title={t('pinned')}
                visible={pinnedNotes.length > 0}
                containerStyle={{ paddingVertical: 16 }}
                contentStyle={{ gap: 4 }}
            >
                {grid ? renderColumns(pinnedNotes) : pinnedNotes.map(renderCard)}
            </Section>

            {pinnedNotes.length > 0 && remainingNotes.length > 0 && (
                <View style={{ paddingBottom: 8 }}>
                    <DotSeparator />
                </View>
            )}
        </View>
    )

    if (grid) {
        return (
            <Scroll contentContainerStyle={styles.container}>
                {header}

                <Section
                    visible={remainingNotes.length > 0}
                    containerStyle={{ paddingTop: 8 }}
                >
                    {renderColumns(remainingNotes)}
                </Section>
            </Scroll>
        )
    }

    return (
        <AnimatedList
            gap={8}
            data={loading ? [] : remainingNotes}
            keyExtractor={(note) => note.id}
            renderItem={({ item }) => renderCard(item)}
            ListHeaderComponent={() => header}
            emptyLabel={t('message.notes.empty')}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center'
    },
    header: {
        width: '100%',
        alignItems: 'center'
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
