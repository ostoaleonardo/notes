import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '../../constants'

export function DeleteAction() {
    return (
        <View style={styles.deleteContainer}>
            <Text style={styles.deleteText}>
                Delete
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
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
})
