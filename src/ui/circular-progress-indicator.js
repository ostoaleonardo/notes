import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Box, CircularProgressIndicator as ComposeProgress } from '@expo/ui/jetpack-compose'
import { size as sizeModifier } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeHost } from '@/ui/compose-context'
import { useTheme } from '@/ui/hooks/use-theme'

import { TINT, TRANSPARENT } from '@/ui/tokens/transparent'

export const CircularProgressIndicator = ({
    size,
    stroke,
    progress,
    children
}) => {
    const { colors } = useTheme()
    const modifiers = useMemo(() => [sizeModifier(size, size)], [size])

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <ComposeHost style={StyleSheet.absoluteFill}>
                <Box>
                    <ComposeProgress
                        progress={1}
                        color={colors.onBackground + TINT.border}
                        trackColor={TRANSPARENT.color}
                        strokeWidth={stroke}
                        strokeCap='butt'
                        gapSize={0}
                        modifiers={modifiers}
                    />
                    <ComposeProgress
                        progress={progress}
                        color={colors.accentText}
                        trackColor={TRANSPARENT.color}
                        strokeWidth={stroke}
                        strokeCap='round'
                        gapSize={0}
                        modifiers={modifiers}
                    />
                </Box>
            </ComposeHost>
            <View style={[StyleSheet.absoluteFill, styles.content]}>{children}</View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center'
    }
})
