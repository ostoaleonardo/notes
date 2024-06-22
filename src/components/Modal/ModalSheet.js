import { forwardRef } from 'react'
import { StyleSheet, View } from 'react-native'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { Typography } from '../Text'
import { IconButton } from '../Button'
import { Cross } from '@/icons'
import { COLORS } from '@/constants'

export const ModalSheet = forwardRef(({ title, children, onClose, contentContainerStyle }, ref) => {
    const snapPoints = ['50%', '75%']

    return (
        <BottomSheet
            ref={ref}
            index={-1}
            onClose={onClose}
            enablePanDownToClose
            snapPoints={snapPoints}
            backgroundStyle={{ backgroundColor: COLORS.foreground }}
            handleIndicatorStyle={{ backgroundColor: COLORS.text50 }}
        >
            <BottomSheetView style={{ paddingHorizontal: 24 }}>
                <View style={styles.headerContainer}>
                    <Typography
                        opacity={0.5}
                        variant='subtitle'
                    >
                        {title}
                    </Typography>
                    <IconButton
                        size='sm'
                        variant='light'
                        icon={
                            <Cross
                                width={24}
                                height={24}
                                rotation={45}
                                color={COLORS.text}
                            />
                        }
                        onPress={onClose}
                    />
                </View>
                <View
                    style={[
                        styles.bodyContainer,
                        contentContainerStyle
                    ]}
                >
                    {children}
                </View>
            </BottomSheetView>
        </BottomSheet>
    )
})

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bodyContainer: {
        width: '100%',
        height: '100%',
        paddingTop: 24,
        alignItems: 'center',
    },
})
