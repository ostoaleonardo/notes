import { useTheme } from 'react-native-paper'
import { BottomSheetModal, BottomSheetView } from '@expo/ui/community/bottom-sheet'

export const ModalSheet = ({
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
}
