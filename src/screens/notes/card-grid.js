import { useCallback, useMemo } from 'react'
import { FlatList, StyleSheet, useWindowDimensions } from 'react-native'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'

import { CardGridItem } from './card-grid-item'
import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'
import { CARDS_HEIGHT } from '@/constants/card-grid'

const CARD_MIN_WIDTH = 160
const GRID_GAP = 24
const GRID_GAP_HORIZONTAL = 16
const GRID_PADDING = 16

export function CardGrid({ cards, onOpen, renderHeader, previewLines, emptyMessage }) {
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

    const renderItem = useCallback(({ item: card }) => (
        <CardGridItem
            card={card}
            cellStyle={cellStyle}
            onOpen={onOpen}
            renderHeader={renderHeader}
            previewLines={previewLines}
        />
    ), [cellStyle, onOpen, renderHeader, previewLines])

    if (cards.length === 0 && !emptyMessage) return null

    if (cards.length === 0) {
        return (
            <AnimatedView
                entering={FadeInUp}
                exiting={FadeOutUp}
                style={[styles.empty, { width: windowWidth }]}
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
            renderItem={renderItem}
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
