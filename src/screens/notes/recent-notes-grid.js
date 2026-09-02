import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { FadeInUp } from 'react-native-reanimated'
import { AnimatedView, Scroll, Typography } from '@/components'
import { RecentNoteCard, CARDS_HEIGHT } from './recent-note-card'

const CARD_MIN_WIDTH = 160
const GRID_GAP = 8
const GRID_PADDING = 16

export function RecentNotesGrid({ cards, onOpen, onRemove }) {
    const { t } = useTranslation()
    const [containerWidth, setContainerWidth] = useState(0)

    const cellStyle = useMemo(() => {
        const columns = containerWidth ? Math.max(1, Math.floor(containerWidth / CARD_MIN_WIDTH)) : 2

        return { width: `${100 / columns}%`, padding: GRID_GAP / 2 }
    }, [containerWidth])

    return (
        <View
            style={styles.container}
            onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        >
            {cards.length === 0 ? (
                <AnimatedView
                    entering={FadeInUp}
                    style={styles.empty}
                >
                    <Typography
                        opacity={0.5}
                        textAlign='center'
                    >
                        {t('message.notes.no_recent')}
                    </Typography>
                </AnimatedView>
            ) : (
                <Scroll
                    overScrollMode='never'
                    contentContainerStyle={styles.grid}
                >
                    {cards.map((card) => (
                        <RecentNoteCard
                            key={card.id}
                            card={card}
                            cellStyle={cellStyle}
                            onPress={() => onOpen(card)}
                            onRemove={() => onRemove(card)}
                        />
                    ))}
                </Scroll>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        maxHeight: CARDS_HEIGHT * 2 + 32
    },
    empty: {
        minHeight: CARDS_HEIGHT,
        paddingHorizontal: GRID_PADDING,
        alignItems: 'center',
        justifyContent: 'center'
    },
    grid: {
        paddingHorizontal: GRID_PADDING - GRID_GAP / 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    }
})
