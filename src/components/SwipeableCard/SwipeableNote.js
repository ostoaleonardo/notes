import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { CurvedTransition, FadeInUp, SlideOutLeft } from 'react-native-reanimated'
import { Swipeable } from 'react-native-gesture-handler'
import { DeleteAction } from './DeleteAction'
import { useNotes } from '@/hooks'
import { getDimensions } from '@/utils'
import { colors, fonts } from '@/constants'

export function SwipeableNote({ id, title, note, images }) {
    const { deleteNote } = useNotes()
    const width = getDimensions(images.length)

    const goToEdit = () => {
        router.navigate('/note/' + id)
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
                    style={styles.noteContainer}
                >
                    <Text style={styles.noteTitle}>{title}</Text>
                    <Text style={styles.noteContent}>{note}</Text>
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
    noteContainer: {
        minWidth: '100%',
        padding: 20,
        borderRadius: 16,
        backgroundColor: colors.foreground,
    },
    noteTitle: {
        fontSize: 16,
        color: colors.text,
        paddingBottom: 10,
        fontFamily: fonts.mono,
        textTransform: 'uppercase',
    },
    noteContent: {
        fontSize: 16,
        color: colors.text,
        fontFamily: 'Roboto-Mono',
    },
    noteImages: {
        width: '100%',
        gap: 8,
        marginTop: 16,
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    noteImage: {
        aspectRatio: 1,
        borderRadius: 16,
    },
})
