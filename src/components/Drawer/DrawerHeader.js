import { Image, StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '../../constants'

export function DrawerHeader() {
    return (
        <View style={styles.headerContainer}>
            <Image
                source={require('../../../assets/icon.png')}
                style={styles.icon}
            />
            <View style={styles.appInfo}>
                <Text style={styles.appName}>
                    Notes
                </Text>
                <Text style={styles.appVersion}>
                    1.0.0
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        padding: 16,
        paddingVertical: 32,
        backgroundColor: colors.background,
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
    appName: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    appVersion: {
        fontSize: 12,
        color: colors.text50,
        fontFamily: fonts.mono,
    },
})
