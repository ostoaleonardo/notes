import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function useSheetBottomSpacing() {
    const { bottom } = useSafeAreaInsets()
    return bottom
}
