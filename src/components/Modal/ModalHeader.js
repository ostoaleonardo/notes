import { StyleSheet } from 'react-native'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Typography } from '../Typography'

export function ModalHeader({ title }) {
    return (
        <BottomSheetView style={styles.container}>
            <Typography
                bold
                uppercase
                opacity={0.5}
                variant='caption'
            >
                {title}
            </Typography>
        </BottomSheetView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
