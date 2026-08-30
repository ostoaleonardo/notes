import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useKeyboardState } from 'react-native-keyboard-controller'
import { MarkdownToolbar } from './markdown-toolbar'

export const MarkdownEditorLayout = ({ children, ...controlsProps }) => {
    const { isVisible, height } = useKeyboardState()
    const { bottom } = useSafeAreaInsets()

    const keyboardPadding = isVisible ? Math.max(0, height - bottom) : 0

    return (
        <View style={{ flex: 1, paddingBottom: keyboardPadding }}>
            <View style={{ flex: 1 }}>
                {children}
            </View>

            <MarkdownToolbar {...controlsProps} />
        </View>
    )
}
