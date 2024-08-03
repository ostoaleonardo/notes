import { forwardRef, useCallback } from 'react'
import { useTheme } from 'react-native-paper'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { ModalHeader } from './ModalHeader'

export const ModalSheet = forwardRef(({ title, children, onClose, contentContainerStyle, ...prop }, ref) => {
    const { colors } = useTheme()

    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
        />
    ), [])

    return (
        <BottomSheetModal
            ref={ref}
            onClose={onClose}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            backgroundStyle={{
                backgroundColor: colors.surface,
                borderRadius: 24
            }}
            handleIndicatorStyle={{
                backgroundColor: colors.onBackground + '66'
            }}
            {...prop}
        >
            <BottomSheetView>
                <ModalHeader title={title} />
            </BottomSheetView>
            <BottomSheetView style={contentContainerStyle}>
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    )
})
