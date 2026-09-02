import { Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FadeOutUp } from 'react-native-reanimated'
import { AnimatedView, Typography } from '@/components'
import { Close, KeepFilled } from '@/icons'
import { COMMONS } from '@/constants'

export const CARDS_HEIGHT = 220

export function RecentNoteCard({ card, cellStyle, cardStyle, iconProps, iconBackgroundColor, onPress, onRemove }) {
    const { t } = useTranslation()

    return (
        <AnimatedView
            exiting={FadeOutUp}
            style={cellStyle}
        >
            <Pressable
                onPress={onPress}
                style={{ ...styles.card, ...cardStyle }}
            >
                {card.pinned && (
                    <Pressable
                        onPress={onRemove}
                        hitSlop={8}
                        accessibilityLabel={t('button.unpin')}
                        style={{
                            ...styles.pin,
                            backgroundColor: iconBackgroundColor
                        }}
                    >
                        <KeepFilled {...iconProps} />
                    </Pressable>
                )}

                <Pressable
                    onPress={onRemove}
                    hitSlop={8}
                    accessibilityLabel={t('button.close')}
                    style={{
                        ...styles.close,
                        backgroundColor: iconBackgroundColor
                    }}
                >
                    <Close {...iconProps} />
                </Pressable>

                <Typography
                    opacity={0.6}
                    fontSize={11}
                    numberOfLines={8}
                    styleProps={styles.preview}
                >
                    {card.preview}
                </Typography>
            </Pressable>

            <Typography
                variant='caption'
                textAlign='center'
                numberOfLines={1}
                styleProps={styles.title}
            >
                {card.title}
            </Typography>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    card: {
        height: CARDS_HEIGHT,
        gap: 6,
        padding: 12,
        borderWidth: 1,
        borderRadius: COMMONS.radius
    },
    close: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    pin: {
        position: 'absolute',
        top: 8,
        right: 40,
        zIndex: 1,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    preview: {
        marginTop: 24
    },
    title: {
        marginTop: 6
    }
})
