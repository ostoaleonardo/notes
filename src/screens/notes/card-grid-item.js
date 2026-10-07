import { memo } from 'react'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'

import { RADIUS, SPACING, OPACITY, BORDER_WIDTH } from '@/constants/theme'
import { CARD_PREVIEW_LINES } from '@/constants/note-preview'
import { CARD_GRID } from '@/constants/components'

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
            entering={FadeInUp}
            exiting={FadeOutUp}
            style={{ ...cellStyle, gap: SPACING.sm }}
        >
            <Pressable
                accessibilityRole='button'
                accessibilityState={{ selected: !!card.active }}
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
                    opacity={OPACITY.secondary}
                    fontSize={11}
                    numberOfLines={previewLines}
                    color={card.active ? colors.background : undefined}
                    styleProps={{
                        paddingVertical: SPACING.sm,
                        paddingHorizontal: SPACING.md
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
        height: CARD_GRID.cardHeight,
        borderWidth: BORDER_WIDTH.thin,
        flexDirection: 'column',
        borderRadius: RADIUS.lg,
        overflow: 'hidden'
    }
})
