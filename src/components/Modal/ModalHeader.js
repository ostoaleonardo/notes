import { StyleSheet, View } from 'react-native'
import { Typography } from '../Text'

export function ModalHeader({ title }) {
    return (
        <View style={styles.container}>
            <Typography
                bold
                uppercase
                opacity={0.5}
                variant='caption'
            >
                {title}
            </Typography>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
