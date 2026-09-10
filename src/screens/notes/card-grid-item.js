import { memo } from 'react'
import { FadeOutUp } from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'

import { COMMONS } from '@/constants/themes'
import { CARD_PREVIEW_LINES } from '@/constants/note-preview'

export const CARDS_HEIGHT = 220

export const CardGridItem = memo(function CardGridItem({
    card,
    cellStyle,
    onOpen,
    renderHeader,
    previewLines = CARD_PREVIEW_LINES
}) {
    const { colors } = useTheme()

    return (
        <AnimatedView
            exiting={FadeOutUp}
            style={{ ...cellStyle, gap: 8 }}
        >
            <Pressable
                disabled={card.active}
                onPress={() => onOpen(card)}
                style={{
                    ...styles.card,
                    borderColor: colors.outline,
                    backgroundColor: card.active ? colors.onBackground : colors.surface
                }}
            >
                {renderHeader && renderHeader(card)}

                <Typography
                    opacity={0.6}
                    fontSize={11}
                    numberOfLines={previewLines}
                    color={card.active ? colors.background : undefined}
                    styleProps={{
                        paddingVertical: 8,
                        paddingHorizontal: 12
                    }}
                >
                    {card.preview}
                </Typography>
            </Pressable>

            <Typography
                variant='caption'
                textAlign='center'
                numberOfLines={1}
            >
                {card.title}
            </Typography>
        </AnimatedView>
    )
})

const styles = StyleSheet.create({
    card: {
        height: CARDS_HEIGHT,
        borderWidth: 1,
        flexDirection: 'column',
        borderRadius: COMMONS.radius,
        overflow: 'hidden'
    }
})
