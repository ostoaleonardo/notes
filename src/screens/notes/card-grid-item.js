import { memo } from 'react'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'

import { AnimatedView } from '@/ui/animated/animated-view'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { RADIUS, SPACING, OPACITY, BORDER_WIDTH } from '@/constants/theme'
import { CARD_PREVIEW_LINES } from '@/constants/note-preview'
import { CARD_GRID } from '@/constants/components'
import { TINT } from '@/ui/tokens/transparent'

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
                    borderColor: card.active ? colors.onBackground + TINT.indicator : colors.outline,
                    backgroundColor: colors.surface
                }}
            >
                {renderHeader && renderHeader(card)}

                <Typography
                    opacity={OPACITY.strong}
                    fontSize={CARD_GRID.previewFontSize}
                    numberOfLines={previewLines}
                    styleProps={{
                        paddingVertical: SPACING.sm,
                        paddingHorizontal: SPACING.md
                    }}
                >
                    {card.preview}
                </Typography>
            </Pressable>

            <Typography
                bold={card.active}
                variant='bodySmall'
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
        borderWidth: BORDER_WIDTH.thick,
        flexDirection: 'column',
        borderRadius: RADIUS.lg,
        overflow: 'hidden'
    }
})
