import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useKeyboardState } from 'react-native-keyboard-controller'

import { BOTTOM_GAP } from '@/ui/tokens/theme'

export function useBottomSpacing() {
    const { bottom } = useSafeAreaInsets()

    const visible = useKeyboardState((state) => state.isVisible)

    return visible ? BOTTOM_GAP : bottom + BOTTOM_GAP
}
