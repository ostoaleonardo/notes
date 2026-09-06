import { useMemo } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { FadeInUp } from 'react-native-reanimated'
import { AnimatedView, Scroll, Typography } from '@/components'
import { CardGridItem, CARDS_HEIGHT } from './card-grid-item'

const CARD_MIN_WIDTH = 160
const GRID_GAP = 24
const GRID_GAP_HORIZONTAL = 16
const GRID_PADDING = 16

export function CardGrid({ cards, onOpen, onRemove, emptyMessage }) {
    const { width: windowWidth } = useWindowDimensions()

    const cellStyle = useMemo(() => {
        const containerWidth = windowWidth - (GRID_PADDING - GRID_GAP_HORIZONTAL / 2) * 2
        const columns = Math.max(1, Math.floor(containerWidth / CARD_MIN_WIDTH))

        return {
            width: `${100 / columns}%`,
            paddingHorizontal: GRID_GAP_HORIZONTAL / 2,
            paddingVertical: GRID_GAP / 2
        }
    }, [windowWidth])

    if (cards.length === 0 && !emptyMessage) return null

    return (
        <View style={[styles.container, { width: windowWidth }]}>
            {cards.length === 0 ? (
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
            ) : (
                <Scroll
                    overScrollMode='never'
                    contentContainerStyle={styles.grid}
                >
                    {cards.map((card) => (
                        <CardGridItem
                            key={card.id}
                            card={card}
                            cellStyle={cellStyle}
                            onPress={() => onOpen(card)}
                            onRemove={onRemove && (() => onRemove(card))}
                        />
                    ))}
                </Scroll>
            )}
        </View>
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
        paddingHorizontal: GRID_PADDING - GRID_GAP_HORIZONTAL / 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    }
})
