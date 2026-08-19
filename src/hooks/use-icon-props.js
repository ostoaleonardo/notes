import { useTheme } from 'react-native-paper'

export function useIconProps(size = 24) {
    const { colors } = useTheme()

    return {
        width: size,
        height: size,
        color: colors.onBackground
    }
}
