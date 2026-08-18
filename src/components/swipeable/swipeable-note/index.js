import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SwipeableCard } from '../swipeable-card'
import { Typography } from '../../typography'
import { MarkdownPreview } from '../../markdown'
import { PinAction } from '../actions/pin-action'
import { Skeleton } from './skeleton'
import { useLocalAuthentication } from '@/hooks'
import { getDimensions, getPreviewNote } from '@/utils'
import { Lock } from '@/icons'
import { ROUTES } from '@/constants'

export function SwipeableNote({ ref, data, onUnlock, onDelete, onPin, onOpen, isOpen }) {
    const { colors } = useTheme()
    const { hasBiometrics } = useLocalAuthentication()

    const { id, title, note, images, password, biometrics } = data

    const hasImages = images && images.length > 0
    const isLocked = password || (biometrics && hasBiometrics)
    const hasContent = title || note || isLocked

    const width = hasImages && getDimensions(images.length)
    const value = getPreviewNote(note)

    const goToEdit = () => {
        if (isLocked) {
            onUnlock()
        } else {
            router.push(ROUTES.EDIT_NOTE + id)
        }
    }

    return (
        <SwipeableCard
            isOpen={isOpen}
            onOpen={onOpen}
            onDelete={() => onDelete(isLocked)}
            renderLeftActions={() => <PinAction onPress={onPin} />}
            simultaneousHandlers={ref}
        >
            <Pressable
                onPress={goToEdit}
                pointerEvents='box-only'
                style={{
                    ...styles.container,
                    backgroundColor: colors.surface
                }}
            >
                <View
                    style={{
                        gap: hasContent ? 16 : 0,
                        padding: hasContent ? 20 : hasImages ? 0 : 20
                    }}
                >
                    {(title || isLocked) && (
                        <View style={styles.header}>
                            <View style={{ flex: 1 }}>
                                {title && (
                                    <Typography
                                        bold
                                        variant='caption'
                                    >
                                        {title}
                                    </Typography>
                                )}
                            </View>

                            {isLocked && <Lock color={colors.onSurface} />}
                        </View>
                    )}

                    {!isLocked && note && <MarkdownPreview value={value} />}

                    {isLocked && <Skeleton />}
                </View>

                {!isLocked && hasImages && (
                    <View style={styles.images}>
                        {images.slice(0, 3).map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image }}
                                style={[styles.image, {
                                    width: width + '%',
                                    height: width + '%'
                                }]}
                            />
                        ))}
                    </View>
                )}
            </Pressable>
        </SwipeableCard>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden'
    },
    header: {
        width: '100%',
        gap: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    images: {
        width: '100%',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    image: {
        aspectRatio: 1
    }
})
