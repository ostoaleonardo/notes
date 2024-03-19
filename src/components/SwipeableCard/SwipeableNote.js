import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import Animated, { CurvedTransition, FadeInUp, SlideOutLeft } from 'react-native-reanimated'
import { Swipeable } from 'react-native-gesture-handler'
import { DeleteAction } from './DeleteAction'
import { Typography } from '../Text'
import { useNotes } from '@/hooks'
import { getDimensions } from '@/utils'
import { colors } from '@/constants'
import { Lock } from '@/icons'

export function SwipeableNote({ id, title, note, images, hasPassword }) {
    const { deleteNote } = useNotes()
    const width = getDimensions(images.length)

    const goToEdit = () => {
        if (hasPassword) {
            router.navigate('/note/password/' + id)
        } else {
            router.navigate('/note/' + id)
        }
    }

    return (
        <Animated.View
            entering={FadeInUp}
            exiting={SlideOutLeft}
            layout={CurvedTransition}
            style={styles.container}
        >
            <Swipeable
                onSwipeableOpen={() => deleteNote(id)}
                renderRightActions={() => (
                    <DeleteAction />
                )}
                containerStyle={styles.swipeableContainer}
            >
                <Pressable
                    onPress={goToEdit}
                    style={styles.pressableContainer}
                >
                    <View style={styles.noteContainer}>
                        <Typography
                            uppercase
                        >
                            {title}
                        </Typography>

                        {!hasPassword &&
                            <>
                                <Typography>
                                    {note}
                                </Typography>

                                {images.length > 0 && (
                                    <View style={styles.noteImages}>
                                        {images.map((image, index) => (
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

                        {hasPassword &&
                            <>
                                <View style={styles.skeletonContainer}>
                                    <View style={styles.skeleton1} />
                                    <View style={styles.skeleton2} />
                                </View>

                                <View style={styles.iconContainer}>
                                    <Lock
                                        width={12}
                                        height={12}
                                        color={colors.text}
                                    />
                                </View>
                            </>
                        }
                    </View>

                </Pressable>
            </Swipeable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    swipeableContainer: {
        minWidth: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    pressableContainer: {
        minWidth: '100%',
        padding: 20,
        borderRadius: 16,
        backgroundColor: colors.foreground,
    },
    noteContainer: {
        width: '100%',
        gap: 8,
    },
    noteImages: {
        width: '100%',
        gap: 8,
        marginTop: 8,
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
        backgroundColor: colors.text5,
    },
    skeleton2: {
        width: '60%',
        height: 10,
        borderRadius: 16,
        backgroundColor: colors.text5,
    },
    iconContainer: {
        position: 'absolute',
        right: 0,
        padding: 8,
        borderRadius: 16,
        backgroundColor: colors.text5,
    },
})
