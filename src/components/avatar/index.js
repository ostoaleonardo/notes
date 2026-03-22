import { Image, StyleSheet, View } from 'react-native'
import { Typography } from '../typography'
import { useTheme } from 'react-native-paper'
import { FONTS } from '@/constants'

export function Avatar({ user, size = 40 }) {
    const { colors } = useTheme()
    const { name, photo } = user

    const avatar = {
        ...styles.container,
        width: size,
        height: size,
        backgroundColor: colors.tertiary
    }

    return (
        photo ? (
            <Image
                source={{ uri: photo }}
                style={avatar}
            />
        ) : (
            <View style={avatar}>
                <Typography
                    fontSize={size / 2}
                    styleProps={{
                        color: colors.onTertiary,
                        fontFamily: FONTS.nType82Headline
                    }}
                >
                    {name[0]}
                </Typography>
            </View>
        )
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 128,
        alignItems: 'center',
        justifyContent: 'center'
    }
})