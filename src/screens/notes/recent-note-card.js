import { useTranslation } from 'react-i18next'
import { FadeOutUp } from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { AnimatedView, Typography } from '@/components'
import { Close, KeepFilled } from '@/icons'
import { COMMONS } from '@/constants'

export const CARDS_HEIGHT = 220

export function RecentNoteCard({
    card,
    cellStyle,
    onPress,
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
                onPress={onPress}
                style={{
                    ...styles.card,
                    borderColor: colors.outline,
                    backgroundColor: colors.surface
                }}
            >
                <IconButton
                    size={4}
                    mode='contained'
                    onPress={onRemove}
                    style={{
                        alignSelf: 'flex-end'
                    }}
                    icon={(props) => (
                        card.pinned
                            ? <KeepFilled {...props} />
                            : <Close {...props} />
                    )}
                    accessibilityLabel={
                        t(card.pinned ? 'button.unpin' : 'button.close')
                    }
                />

                <Typography
                    opacity={0.6}
                    fontSize={11}
                    numberOfLines={8}
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
}

const styles = StyleSheet.create({
    card: {
        height: CARDS_HEIGHT,
        gap: 8,
        padding: 4,
        borderWidth: 1,
        flexDirection: 'column',
        borderRadius: COMMONS.radius
    }
})
