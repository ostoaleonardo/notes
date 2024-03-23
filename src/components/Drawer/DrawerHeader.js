import { Image, StyleSheet, View } from 'react-native'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

const icon = require('../../../assets/icon.png')

export function DrawerHeader() {
    return (
        <View style={styles.headerContainer}>
            <Image
                source={icon}
                style={styles.icon}
            />
            <View style={styles.appInfo}>
                <Typography>
                    Notes
                </Typography>
                <Typography
                    opacity={0.5}
                    variant='caption'
                >
                    1.0.0
                </Typography>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        padding: 16,
        paddingVertical: 32,
        backgroundColor: COLORS.background,
    },
    icon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        marginBottom: 16,
    },
    appInfo: {
        gap: 4,
        marginLeft: 8,
    },
})
