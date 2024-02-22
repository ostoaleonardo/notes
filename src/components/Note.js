import { StyleSheet, Text, View } from 'react-native'

export function Note({ title, content }) {
    return (
        <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>{title}</Text>
            <Text style={styles.noteContent}>{content}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    noteContainer: {
        width: '85%',
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#28282c',
    },
    noteTitle: {
        fontSize: 20,
        color: 'white',
        paddingBottom: 10,
    },
    noteContent: {
        fontSize: 16,
        color: 'white',
    },
})
