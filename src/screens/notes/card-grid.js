import { useCallback, useMemo } from 'react'
import { FlatList, StyleSheet, useWindowDimensions } from 'react-native'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'

import { CardGridItem } from './card-grid-item'
import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'
import { CARD_GRID } from '@/constants/components'

import { OPACITY } from '@/constants/theme'

export function CardGrid({ cards, onOpen, renderHeader, previewLines, emptyMessage }) {
    const { width: windowWidth } = useWindowDimensions()

    const columns = useMemo(() => {
        const containerWidth = windowWidth - (CARD_GRID.padding - CARD_GRID.columnGap / 2) * 2
        return Math.max(1, Math.floor(containerWidth / CARD_GRID.cardMinWidth))
    }, [windowWidth])

    const cellStyle = useMemo(() => ({
        width: `${100 / columns}%`,
        paddingHorizontal: CARD_GRID.columnGap / 2,
        paddingVertical: CARD_GRID.rowGap / 2
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
                    opacity={OPACITY.muted}
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
        maxHeight: CARD_GRID.cardHeight * 2 + 48
    },
    empty: {
        minHeight: CARD_GRID.cardHeight,
        paddingHorizontal: CARD_GRID.padding,
        alignItems: 'center',
        justifyContent: 'center'
    },
    grid: {
        paddingHorizontal: CARD_GRID.padding - CARD_GRID.columnGap / 2
    },
    row: {
        justifyContent: 'center'
    }
})
