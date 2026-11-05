import { StyleSheet } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'

import { MarkdownToolbar } from './markdown-toolbar'
import { BlurTarget, BlurTargetProvider } from '@/ui/blur/blur-target'

export const MarkdownEditorLayout = ({ children, ...controlsProps }) => (
    <KeyboardAvoidingView behavior='padding' style={styles.layout}>
        <BlurTargetProvider style={styles.layout}>
            <BlurTarget style={styles.layout}>
                {children}
            </BlurTarget>
            <MarkdownToolbar {...controlsProps} />
        </BlurTargetProvider>
    </KeyboardAvoidingView>
)

const styles = StyleSheet.create({
    layout: {
        flex: 1
    }
})
