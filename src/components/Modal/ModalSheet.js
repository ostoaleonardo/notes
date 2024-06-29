import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'
import { ModalHeader } from './ModalHeader'
import { COLORS } from '@/constants'

export function ModalSheet({ title, children, onClose, contentContainerStyle }) {
    const snapPoints = ['50%']

    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
        />
    ), [])

    return (
        <BottomSheet
            onClose={onClose}
            enableDynamicSizing
            enablePanDownToClose
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: COLORS.foreground }}
            handleIndicatorStyle={{ backgroundColor: COLORS.white50 }}
        >
            <BottomSheetView style={{ paddingHorizontal: 24 }}>
                <ModalHeader
                    title={title}
                    onClose={onClose}
                />
                <View
                    style={[
                        styles.bodyContainer,
                        contentContainerStyle
                    ]}
                >
                    {children}
                </View>
            </BottomSheetView>
        </BottomSheet >
    )
}

const styles = StyleSheet.create({
    bodyContainer: {
        width: '100%',
        paddingTop: 24,
        alignItems: 'center'
    }
})
