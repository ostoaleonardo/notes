import { Pressable, StyleSheet, View } from 'react-native'
import { Typography } from '../Text'
import { Check } from '../Check'
import { COLORS } from '@/constants'

export function ModalOption({ onPress, label, isSelected }) {
    return (
        <View style={styles.container}>
            <Pressable
                onPress={onPress}
                style={styles.optionContainer}
            >
                <Typography>
                    {label}
                </Typography>
                <Check checked={isSelected} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    optionContainer: {
        minWidth: '100%',
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 2,
        justifyContent: 'space-between',
        borderBottomColor: COLORS.text5,
    },
})
