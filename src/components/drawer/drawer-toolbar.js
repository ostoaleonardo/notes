import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { IconButton } from '@/ui/button/icon-button'

import { SPACING } from '@/constants/theme'
import { ICON_BUTTON } from '@/ui/tokens/components'

export const DrawerToolbar = ({ children }) => {
    const insets = useSafeAreaInsets()

    return (
        <View
            style={[
                styles.container, {
                    paddingStart: SPACING.md + insets.left,
                    paddingEnd: SPACING.md + insets.right
                }
            ]}
        >
            {children}
        </View>
    )
}

export const DrawerToolbarButton = ({
    accessibilityLabel,
    style,
    ...props
}) => {
    return (
        <IconButton
            appearance={ICON_BUTTON.drawer}
            label={accessibilityLabel}
            style={[styles.button, style]}
            {...props}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm
    },
    button: {
        margin: 0
    }
})
