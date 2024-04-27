import { StyleSheet, View } from 'react-native'
import { Avatar } from './Avatar'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

export function User({ name, description }) {
    return (
        <View style={styles.userContainer}>
            <Avatar color={COLORS.primary} />
            <View style={styles.infoContainer}>
                <Typography>
                    {name}
                </Typography>
                <Typography
                    opacity={0.5}
                    variant='caption'
                >
                    {description}
                </Typography>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    userContainer: {
        gap: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoContainer: {
        gap: 4,
    }
})
