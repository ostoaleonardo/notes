import { StyleSheet, View } from 'react-native'

import { Progress } from '@/ui/progress'
import { useTheme } from '@/ui/hooks/use-theme'

export function LoadingOverlay() {
    const { colors } = useTheme()

    return (
        <View
            style={{
                ...styles.overlay,
                backgroundColor: colors.background
            }}
        >
            <Progress />
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
