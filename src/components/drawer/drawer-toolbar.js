import { StyleSheet, View } from 'react-native'
import { Tooltip } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DrawerIconButton } from './drawer-icon-button'

import { ICON_SIZE } from '@/constants/icon-size'
import { SPACING } from '@/constants/spacing'

export function DrawerToolbar({ children }) {
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

export function DrawerToolbarButton({ accessibilityLabel, style, ...props }) {
    return (
        <Tooltip title={accessibilityLabel}>
            <DrawerIconButton
                size={ICON_SIZE.md}
                style={[styles.button, style]}
                accessibilityLabel={accessibilityLabel}
                {...props}
            />
        </Tooltip>
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
