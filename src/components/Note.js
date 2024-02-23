import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '../constants'

export function Note({ title, note }) {
    return (
        <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>{title}</Text>
            <Text style={styles.noteContent}>{note}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    noteContainer: {
        width: '85%',
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
