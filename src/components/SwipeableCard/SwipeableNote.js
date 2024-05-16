import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { SwipeableCard } from './SwipeableCard'
import { Typography } from '../Text'
import { useLocalAuthentication } from '@/hooks'
import { getDimensions } from '@/utils'
import { Lock } from '@/icons'
import { COLORS } from '@/constants'

export function SwipeableNote({ data, isOpen, onOpen, onDelete }) {
    const { id, title, note, images, password, biometrics } = data
    const { hasBiometrics } = useLocalAuthentication()
    const isLocked = password || (biometrics && hasBiometrics)
    const width = getDimensions(images.length)

    const goToEdit = () => {
        if (isLocked) {
            router.navigate('/note/unlock/' + id)
        } else {
            router.navigate('/note/view/' + id)
        }
    }

    return (
        <SwipeableCard
            isOpen={isOpen}
            onOpen={onOpen}
            onDelete={onDelete}
        >
            <Pressable
                onPress={goToEdit}
                style={styles.pressableContainer}
            >
                <View style={styles.noteContainer}>
                    <Typography
                        bold
                        variant='subtitle'
                    >
                        {title}
                    </Typography>

                    {!isLocked &&
                        <>
                            <Typography>
                                {note}
                            </Typography>

                            {images.length > 0 && (
                                <View style={styles.noteImages}>
                                    {images.slice(0, 3).map((image, index) => (
                                        <Image
                                            key={index}
                                            source={{ uri: image }}
                                            style={[styles.noteImage, {
                                                width: width + '%',
                                                height: width + '%',
                                            }]}
                                        />
                                    ))}
                                </View>
                            )}
                        </>
                    }

                    {isLocked &&
                        <>
                            <View style={styles.skeletonContainer}>
                                <View style={styles.skeleton1} />
                                <View style={styles.skeleton2} />
                            </View>

                            <View style={styles.iconContainer}>
                                <Lock
                                    width={12}
                                    height={12}
                                    color={COLORS.text}
                                />
                            </View>
                        </>
                    }
                </View>
            </Pressable>
        </SwipeableCard>
    )
}

const styles = StyleSheet.create({
    pressableContainer: {
        minWidth: '100%',
        padding: 20,
        borderRadius: 16,
        backgroundColor: COLORS.foreground,
    },
    noteContainer: {
        width: '100%',
        gap: 8,
    },
    noteImages: {
        width: '100%',
        gap: 8,
        marginTop: 12,
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    noteImage: {
        aspectRatio: 1,
        borderRadius: 16,
    },
    skeletonContainer: {
        width: '100%',
        gap: 8,
    },
    skeleton1: {
        width: '80%',
        height: 10,
        borderRadius: 6,
        backgroundColor: COLORS.text5,
    },
    skeleton2: {
        width: '60%',
        height: 10,
        borderRadius: 16,
        backgroundColor: COLORS.text5,
    },
    iconContainer: {
        position: 'absolute',
        right: 0,
        padding: 8,
        borderRadius: 16,
        backgroundColor: COLORS.text5,
    },
})
