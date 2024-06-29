import { StyleSheet, View } from 'react-native'
import { Typography } from '../Text'
import { IconButton } from '../Button'
import { Cross } from '@/icons'
import { COLORS } from '@/constants'

export function ModalHeader({ title, onClose }) {
    return (
        <View style={styles.container}>
            <Typography
                opacity={0.5}
            >
                {title}
            </Typography>
            <IconButton
                size='sm'
                variant='light'
                onPress={onClose}
                icon={
                    <Cross
                        width={24}
                        height={24}
                        rotation={45}
                        color={COLORS.white}
                    />
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
