import { Image, StyleSheet, View } from 'react-native'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

export function Avatar({ user, color, size = 40 }) {
    const { givenName, photo } = user

    if (!givenName) return null

    const containerStyles = {
        ...styles.container,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color || COLORS.foreground
    }

    return (
        photo ? (
            <Image
                source={{ uri: photo }}
                style={containerStyles}
            />
        ) : (
            <View style={containerStyles}>
                <Typography
                    variant='title'
                    fontSize={size / 2}
                >
                    {givenName[0]}
                </Typography>
            </View>
        )
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center'
    }
})
