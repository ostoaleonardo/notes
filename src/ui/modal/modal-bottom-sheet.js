import { StyleSheet } from 'react-native'
import { BottomSheetModal, BottomSheetView } from '@expo/ui/community/bottom-sheet'

import { SPACING } from '@/ui/tokens/theme'
import { useTheme } from '@/ui/hooks/use-theme'

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
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    )
}
