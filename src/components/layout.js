import { StyleSheet, View } from 'react-native'
import { ActivityIndicator, useTheme } from 'react-native-paper'

export function LoadingOverlay() {
    const { colors } = useTheme()

    return (
        <View
            style={{
                ...styles.overlay,
                backgroundColor: colors.background
            }}
        >
            <ActivityIndicator size='small' />
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
