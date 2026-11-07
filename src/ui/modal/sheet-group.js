import { StyleSheet, View } from 'react-native'

import { PositionGroup } from '@/ui/position-group'

import { BOTTOM_GAP, SPACING } from '@/ui/tokens/theme'

export const SheetGroup = ({ children }) => (
    <View style={styles.list}>
        <PositionGroup>
            {children}
        </PositionGroup>
    </View>
)

const styles = StyleSheet.create({
    list: {
        gap: SPACING.xxxs,
        paddingHorizontal: SPACING.lg,
        paddingBottom: BOTTOM_GAP
    }
})
