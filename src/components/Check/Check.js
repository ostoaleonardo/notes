import { StyleSheet, View } from 'react-native'
import { colors } from '../../constants'

export function Check({ checked }) {
    const checkStyle = checked ? styles.checked : styles.unchecked

    return (
        <View style={styles.checkContainer}>
            <View style={checkStyle} />
        </View>
    )
}

const styles = StyleSheet.create({
    checkContainer: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: colors.text15,
    },
    checked: {
        width: 12,
        height: 12,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    unchecked: {
        width: 12,
        height: 12,
        borderRadius: 4,
        backgroundColor: colors.text15,
    },
})
