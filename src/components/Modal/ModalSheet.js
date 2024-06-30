import { forwardRef, useCallback } from 'react'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { ModalHeader } from './ModalHeader'
import { COLORS } from '@/constants'

export const ModalSheet = forwardRef(({ title, children, onClose, contentContainerStyle, ...prop }, ref) => {
    const snapPoints = ['50%', '70%', '95%']

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
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: COLORS.foreground }}
            handleIndicatorStyle={{ backgroundColor: COLORS.white50 }}
            {...prop}
        >
            <BottomSheetView style={{ paddingHorizontal: 24 }}>
                <ModalHeader
                    title={title}
                    onClose={onClose}
                />
            </BottomSheetView>
            <BottomSheetView style={contentContainerStyle}>
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    )
})
