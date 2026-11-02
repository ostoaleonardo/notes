import { StyleSheet, View } from 'react-native'

import { Progress } from '@/ui/progress'
import { useTheme } from '@/ui/hooks/use-theme'

import { SIZE } from '@/ui/tokens/theme'

export function LoadingOverlay({ background = true }) {
    const { colors } = useTheme()

    return (
        <View
            pointerEvents={background ? 'auto' : 'none'}
            style={[
                StyleSheet.absoluteFill,
                styles.overlay,
                background && {
                    backgroundColor: colors.background
                }
            ]}
        >
            <Progress dimension={SIZE.xxl} />
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        alignItems: 'center',
        justifyContent: 'center'
    }
})
