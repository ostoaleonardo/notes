import { View } from 'react-native'
import { useTheme } from 'react-native-paper'

export function Separator({ style }) {
    const { colors } = useTheme()

    return (
        <View
            style={{
                height: 1,
                opacity: 0.1,
                backgroundColor: colors.onBackground,
                ...style
            }}
        />
    )
}
