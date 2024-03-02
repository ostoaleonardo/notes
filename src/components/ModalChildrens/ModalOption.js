import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Check } from '../Check'
import { colors, fonts } from '../../constants'

export function ModalOption({ onPress, label, isSelected }) {
    return (
        <View style={styles.container}>
            <Pressable
                onPress={onPress}
                style={styles.optionContainer}
            >
                <Text style={styles.label}>
                    {label}
                </Text>
                <Check checked={isSelected} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        width: '100%',
    },

    container: {
        width: '100%',
        alignItems: 'center',
    },
    optionContainer: {
        minWidth: '100%',
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 2,
        justifyContent: 'space-between',
        borderBottomColor: colors.text5,
    },
    label: {
        fontSize: 16,
        color: colors.text50,
        fontFamily: fonts.mono,
    },
})
