import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { CurvedTransition, FadeOutLeft } from 'react-native-reanimated'
import { Swipeable } from 'react-native-gesture-handler'
import { useNotes } from '../hooks'
import { colors, fonts } from '../constants'
import { router } from 'expo-router'

export function DeleteAction() {
    return (
        <View style={styles.deleteContainer}>
            <Text style={styles.deleteText}>
                Delete
            </Text>
        </View>
    )
}

export function Note({ id, title, note }) {
    const { deleteNote } = useNotes()

    const goToEdit = () => {
        router.navigate('/note/' + id)
    }

    return (
        <Animated.View
            exiting={FadeOutLeft}
            layout={CurvedTransition}
            style={styles.swipeableContainer}
        >
            <Swipeable
                onSwipeableOpen={() => deleteNote(id)}
                renderRightActions={() => (
                    <DeleteAction />
                )}
            >
                <Pressable
                    onPress={goToEdit}
                    style={styles.noteContainer}
                >
                    <Text style={styles.noteTitle}>{title}</Text>
                    <Text style={styles.noteContent}>{note}</Text>
                </Pressable>
            </Swipeable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    swipeableContainer: {
        width: '100%',
    },
    deleteContainer: {
        width: 100,
        marginRight: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
    deleteText: {
        fontSize: 12,
        color: colors.text,
        fontFamily: fonts.mono,
        textTransform: 'uppercase',
    },
    noteContainer: {
        width: '90%',
        padding: 20,
        borderRadius: 16,
        marginHorizontal: 16,
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
})
