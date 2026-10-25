import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useKeyboardState } from 'react-native-keyboard-controller'

import { MarkdownToolbar } from './markdown-toolbar'
import { BlurTarget, BlurTargetProvider } from '@/components/blur/blur-target'

export const MarkdownEditorLayout = ({ children, ...controlsProps }) => {
    const { isVisible, height } = useKeyboardState()
    const { bottom } = useSafeAreaInsets()

    const keyboardPadding = isVisible && controlsProps.isFocused ? Math.max(0, height - bottom) : 0

    return (
        <BlurTargetProvider style={{ flex: 1, paddingBottom: keyboardPadding }}>
            <BlurTarget style={{ flex: 1 }}>
                {children}
            </BlurTarget>

            <MarkdownToolbar {...controlsProps} />
        </BlurTargetProvider>
    )
}
