import { forwardRef, useCallback } from 'react'
import { useTheme } from 'react-native-paper'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { ModalHeader } from './modal-header'
import { TRANSPARENT } from '@/constants'

export const ModalSheet = forwardRef(({ title, children, onClose, contentContainerStyle, scrollable = false, ...prop }, ref) => {
    const { colors } = useTheme()

    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop
            {...props}
            opacity={1}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            style={{ backgroundColor: colors.backdrop }}
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
                backgroundColor: colors.onBackground + TRANSPARENT[40]
            }}
            {...prop}
        >
            <ModalHeader title={title} />
            <BottomSheetView style={{ paddingTop: 48, ...contentContainerStyle }}>
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    )
})
