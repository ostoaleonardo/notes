import { router } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'
import Animated, { CurvedTransition, FadeOutLeft } from 'react-native-reanimated'
import { Swipeable } from 'react-native-gesture-handler'
import { DeleteAction } from './DeleteAction'
import { useNotes } from '../../hooks'
import { colors, fonts } from '../../constants'

export function Note({ id, title, note }) {
    const { deleteNote } = useNotes()

    const goToEdit = () => {
        router.navigate('/note/' + id)
    }

    return (
        <Animated.View
            exiting={FadeOutLeft}
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
})
