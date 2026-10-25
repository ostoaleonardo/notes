import { useTheme } from 'react-native-paper'
import { BottomSheetModal, BottomSheetView } from '@expo/ui/community/bottom-sheet'

import { SPACING } from '@/constants/theme'

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
                style={{
                    flex: 1,
                    paddingTop: SPACING.xxxl,
                    ...contentContainerStyle
                }}
            >
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    )
}
