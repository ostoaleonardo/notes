import { StyleSheet, View } from 'react-native'

import { OPACITY, BORDER_WIDTH } from '@/ui/tokens/theme'
import { useTheme } from '@/ui/hooks/use-theme'

export function Divider({ style }) {
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
        height: BORDER_WIDTH.thin,
        opacity: OPACITY.divider
    }
})
