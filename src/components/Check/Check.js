import { StyleSheet, View } from 'react-native'
import { Check as CheckIcon } from '@/icons'
import { COLORS } from '@/constants'

export function Check({ checked }) {
    const containerStyle = checked ? styles.checkedContainer : styles.uncheckedContainer

    return (
        <View style={containerStyle}>
            {checked &&
                <CheckIcon
                    width={16}
                    height={16}
                    color={COLORS.foreground}
                />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    checkedContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.text75,
    },
    uncheckedContainer: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 12,
        borderColor: COLORS.text15,
    },
})
