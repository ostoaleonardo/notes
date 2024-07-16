import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Typography } from '../Text'
import { IconButton } from '../Button'
import { Cross } from '@/icons'

export function ModalHeader({ title, onClose }) {
    const { colors } = useTheme()

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
                        color={colors.onSurface}
                    />
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
