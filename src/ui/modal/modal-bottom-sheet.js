import { StyleSheet, View } from 'react-native'
import { BottomSheetModal, BottomSheetView } from '@expo/ui/community/bottom-sheet'

import { SPACING } from '@/ui/tokens/theme'
import { useTheme } from '@/ui/hooks/use-theme'

import { UI_TEST_IDS } from '@/ui/tokens/test-ids'

export const ModalBottomSheet = ({
    ref,
    onClose,
    children,
    contentContainerStyle,
    ...prop
}) => {
    const { colors } = useTheme()

    return (
        <BottomSheetModal
            ref={ref}
            onClose={onClose}
            enablePanDownToClose
            handleComponent={null}
            backgroundStyle={{
                backgroundColor: colors.surface
            }}
            {...prop}
        >
            <BottomSheetView
                style={StyleSheet.flatten([
                    { flex: 1, paddingTop: SPACING.xxxl },
                    contentContainerStyle
                ])}
            >
                <View
                    testID={UI_TEST_IDS.SHEET}
                    style={styles.marker}
                />
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    )
}

const styles = StyleSheet.create({
    marker: {
        height: 1,
        marginBottom: -1
    }
})
