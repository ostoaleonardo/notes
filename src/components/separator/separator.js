import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

export function Separator({ style }) {
    const { colors } = useTheme()

    return (
        <View
            style={{
                ...styles.base,
                backgroundColor: colors.onBackground,
                ...style
            }}
        />
    )
}

const styles = StyleSheet.create({
    base: {
        height: 1,
        opacity: 0.1
    }
})
