import { useMemo } from 'react'
import { FlatList, StyleSheet, useWindowDimensions } from 'react-native'
import { FadeInUp } from 'react-native-reanimated'
import { AnimatedView, Typography } from '@/components'
import { CardGridItem, CARDS_HEIGHT } from './card-grid-item'

const CARD_MIN_WIDTH = 160
const GRID_GAP = 24
const GRID_GAP_HORIZONTAL = 16
const GRID_PADDING = 16

export function CardGrid({ cards, onOpen, onRemove, emptyMessage }) {
    const { width: windowWidth } = useWindowDimensions()

    const columns = useMemo(() => {
        const containerWidth = windowWidth - (GRID_PADDING - GRID_GAP_HORIZONTAL / 2) * 2
        return Math.max(1, Math.floor(containerWidth / CARD_MIN_WIDTH))
    }, [windowWidth])

    const cellStyle = useMemo(() => ({
        width: `${100 / columns}%`,
        paddingHorizontal: GRID_GAP_HORIZONTAL / 2,
        paddingVertical: GRID_GAP / 2
    }), [columns])

    if (cards.length === 0 && !emptyMessage) return null

    if (cards.length === 0) {
        return (
            <AnimatedView
                entering={FadeInUp}
                style={styles.empty}
            >
                <Typography
                    opacity={0.5}
                    textAlign='center'
                >
                    {emptyMessage}
                </Typography>
            </AnimatedView>
        )
    }

    return (
        <FlatList
            key={columns}
            data={cards}
            keyExtractor={(card) => card.id}
            numColumns={columns}
            overScrollMode='never'
            showsVerticalScrollIndicator={false}
            style={[styles.container, { width: windowWidth }]}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={columns > 1 ? styles.row : undefined}
            renderItem={({ item: card }) => (
                <CardGridItem
                    card={card}
                    cellStyle={cellStyle}
                    onPress={() => onOpen(card)}
                    onRemove={onRemove && (() => onRemove(card))}
                />
            )}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        maxHeight: CARDS_HEIGHT * 2 + 48
    },
    empty: {
        minHeight: CARDS_HEIGHT,
        paddingHorizontal: GRID_PADDING,
        alignItems: 'center',
        justifyContent: 'center'
    },
    grid: {
        paddingHorizontal: GRID_PADDING - GRID_GAP_HORIZONTAL / 2
    },
    row: {
        justifyContent: 'center'
    }
})
