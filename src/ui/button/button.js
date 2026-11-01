import { StyleSheet, View } from 'react-native'
import { ActivityIndicator, Button as PaperButton, useTheme } from 'react-native-paper'

import { ICON_SIZE, FONTS, TYPOGRAPHY_SIZE_VARIANTS } from '@/ui/tokens/theme'
import { HIDDEN_OPACITY } from '@/ui/tokens/components'

export function Button({
    loading = false,
    mode = 'contained',
    disabled,
    style,
    labelStyle = styles.label,
    children,
    ...props
}) {
    const { colors } = useTheme()

    return (
        <View style={style}>
            <PaperButton
                uppercase
                mode={mode}
                disabled={disabled || loading}
                labelStyle={[labelStyle, loading && styles.hidden]}
                {...props}
            >
                {children}
            </PaperButton>
            {loading && (
                <View pointerEvents='none' style={styles.spinner}>
                    <ActivityIndicator size={ICON_SIZE.md} color={colors.onBackground} />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    label: {
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodySmall,
        fontFamily: FONTS.azeretLight
    },
    hidden: {
        opacity: HIDDEN_OPACITY
    },
    spinner: {
        position: 'absolute',
        inset: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
