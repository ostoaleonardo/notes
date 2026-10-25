import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { useTheme } from 'react-native-paper'

import { useBlurTarget } from '@/components/blur/blur-target'

import { TRANSPARENT } from '@/constants/themes'
import { BLUR, BORDER_WIDTH, RADIUS, SPACING } from '@/constants/theme'

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
                        borderColor: colors.onBackground + TRANSPARENT[10]
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
