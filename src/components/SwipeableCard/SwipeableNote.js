import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { SwipeableCard } from './SwipeableCard'
import { Typography } from '../Text'
import { useLocalAuthentication } from '@/hooks'
import { getDimensions } from '@/utils'
import { Lock } from '@/icons'
import { COLORS, ROUTES } from '@/constants'

export function SwipeableNote({ data, isOpen, onOpen, onDelete }) {
    const { id, title, note, images, password, biometrics } = data
    const { hasBiometrics } = useLocalAuthentication()
    const isLocked = password || (biometrics && hasBiometrics)
    const width = getDimensions(images.length)

    const goToEdit = () => {
        if (isLocked) {
            router.push(ROUTES.UNLOCK_NOTE + id)
        } else {
            router.push(ROUTES.VIEW_NOTE + id)
        }
    }

    return (
        <SwipeableCard
            isOpen={isOpen}
            onOpen={onOpen}
            onDelete={() => onDelete(id, isLocked)}
        >
            <Pressable
                onPress={goToEdit}
                style={styles.container}
            >
                <View style={styles.headerContainer}>
                    <View style={{ flex: 1 }}>
                        <Typography
                            bold
                            uppercase
                            variant='caption'
                        >
                            {title}
                        </Typography>
                    </View>

                    {isLocked && (
                        <Lock
                            width={16}
                            height={16}
                            color={COLORS.white}
                        />
                    )}
                </View>

                {!isLocked && (
                    <View style={{ width: '100%' }}>
                        <Typography
                            variant='caption'
                            numberOfLines={5}
                        >
                            {note}
                        </Typography>

                        {images.length > 0 && (
                            <View style={styles.imagesContainer}>
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
                    </View>
                )}

                {isLocked && (
                    <View style={styles.skeletonContainer}>
                        <View style={styles.skeleton1} />
                        <View style={styles.skeleton2} />
                    </View>
                )}
            </Pressable>
        </SwipeableCard>
    )
}

const styles = StyleSheet.create({
    container: {
        minWidth: '100%',
        gap: 16,
        padding: 20,
        borderRadius: 16,
        backgroundColor: COLORS.foreground
    },
    headerContainer: {
        gap: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    imagesContainer: {
        width: '100%',
        gap: 8,
        marginTop: 12,
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    image: {
        aspectRatio: 1,
        borderRadius: 16
    },
    skeletonContainer: {
        width: '100%',
        gap: 8
    },
    skeleton1: {
        width: '80%',
        height: 10,
        borderRadius: 6,
        backgroundColor: COLORS.white5
    },
    skeleton2: {
        width: '60%',
        height: 10,
        borderRadius: 16,
        backgroundColor: COLORS.white5
    }
})
