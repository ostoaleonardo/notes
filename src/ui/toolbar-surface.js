import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { BlurView } from 'expo-blur'

import { useBlurTarget } from '@/ui/blur/blur-target'
import { useTheme } from '@/ui/hooks/use-theme'

import { TINT } from '@/ui/tokens/transparent'
import { BLUR, BORDER_WIDTH, RADIUS, SPACING } from '@/ui/tokens/theme'

export function ToolbarSurface({ children }) {
    const { colors, dark } = useTheme()
    const { width } = useWindowDimensions()
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
                        maxWidth: width - SPACING.lg * 2,
                        backgroundColor: colors.surface,
                        borderColor: colors.onBackground + TINT.border
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
        marginBottom: SPACING.md,
        padding: SPACING.xxxs
    }
})
