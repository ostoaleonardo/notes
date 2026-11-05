import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useKeyboardState } from 'react-native-keyboard-controller'

import { useBlurTarget } from '@/ui/blur/blur-target'
import { useTheme } from '@/ui/hooks/use-theme'

import { TINT } from '@/ui/tokens/transparent'
import { BLUR, BORDER_WIDTH, RADIUS, SPACING } from '@/ui/tokens/theme'

export function ToolbarSurface({ children }) {
    const { colors, dark } = useTheme()
    const { bottom } = useSafeAreaInsets()
    const { width } = useWindowDimensions()

    const keyboardVisible = useKeyboardState((state) => state.isVisible)
    const blurTarget = useBlurTarget()

    return (
        <View
            pointerEvents='box-none'
            style={styles.overlay}
        >
            <BlurView
                blurTarget={blurTarget}
                blurMethod={BLUR.method}
                intensity={BLUR.intensity}
                tint={dark ? 'systemChromeMaterialDark' : 'light'}
                style={[
                    styles.surface, {
                        maxWidth: width - SPACING.xxl,
                        backgroundColor: colors.surface,
                        borderColor: colors.onBackground + TINT.border,
                        marginBottom: keyboardVisible ? SPACING.sm : bottom
                    }
                ]}
            >
                {children}
            </BlurView>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center'
    },
    surface: {
        overflow: 'hidden',
        borderRadius: RADIUS.full,
        borderWidth: BORDER_WIDTH.thin,
        padding: SPACING.xxxs
    }
})
