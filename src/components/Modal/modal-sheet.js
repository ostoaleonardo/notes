import { forwardRef } from 'react'
import { useTheme } from 'react-native-paper'
import { BottomSheetModal, BottomSheetView } from '@expo/ui/community/bottom-sheet'

export const ModalSheet = forwardRef(({ children, onClose, contentContainerStyle, scrollable = false, ...prop }, ref) => {
    const { colors } = useTheme()

    return (
        <BottomSheetModal
            ref={ref}
            onClose={onClose}
            enablePanDownToClose
            backgroundStyle={{
                backgroundColor: colors.surface
            }}
            {...prop}
        >
            <BottomSheetView style={{ flex: 1, ...contentContainerStyle }}>
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    )
})
