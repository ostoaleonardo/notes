import { StyleSheet, View } from 'react-native'

import { CONTROL_TOUCH_INSET } from '@/ui/tokens/components'
import { BOTTOM_GAP, SPACING } from '@/ui/tokens/theme'

export const SheetActions = ({ children }) => {
    return (
        <View style={styles.actions}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    actions: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: SPACING.md,
        paddingBottom: BOTTOM_GAP - CONTROL_TOUCH_INSET,
        paddingHorizontal: SPACING.lg
    }
})
