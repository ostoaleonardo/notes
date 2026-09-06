import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FadeOutUp } from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'

import { Close } from '@/icons/close'
import { KeepFilled } from '@/icons/keep-filled'

import { COMMONS } from '@/constants/themes'

export const CARDS_HEIGHT = 220

export const CardGridItem = memo(function CardGridItem({
    card,
    cellStyle,
    onOpen,
    onRemove
}) {
    const { t } = useTranslation()
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
                {onRemove && (
                    <IconButton
                        size={4}
                        mode='contained'
                        onPress={() => onRemove(card)}
                        style={styles.removeButton}
                        icon={(props) => (
                            card.pinned
                                ? <KeepFilled {...props} />
                                : <Close {...props} />
                        )}
                        accessibilityLabel={
                            t(card.pinned ? 'button.unpin' : 'button.close')
                        }
                    />
                )}

                <Typography
                    opacity={0.6}
                    fontSize={11}
                    numberOfLines={8}
                    color={card.active ? colors.background : undefined}
                    styleProps={{
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
        gap: 8,
        padding: 4,
        borderWidth: 1,
        flexDirection: 'column',
        borderRadius: COMMONS.radius
    },
    removeButton: {
        alignSelf: 'flex-end'
    }
})
