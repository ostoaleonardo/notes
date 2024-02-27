import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '../constants'

export function TitleSection({ title }) {
    return (
        <View style={styles.titleContainer}>
            <Text style={styles.title}>
                {title}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    titleContainer: {
        width: '100%',
    },
    title: {
        fontSize: 16,
        opacity: 0.8,
        color: colors.text,
        fontFamily: fonts.mono,
    },
})
