import { Image, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Typography } from '../Text'
import { useUser } from '@/hooks'
import { COLORS } from '@/constants'

export function Avatar({ color }) {
    const { t } = useTranslation()
    const { user } = useUser()
    const { givenName, photo } = user

    const containerStyles = {
        ...styles.container,
        backgroundColor: color || COLORS.foreground
    }

    if (!givenName) return (
        <Typography
            opacity={0.5}
            variant='caption'
        >
            ({t('settings.signIn')})
        </Typography>
    )

    return (
        photo ? (
            <Image
                source={{ uri: photo }}
                style={containerStyles}
            />
        ) : (
            <View style={containerStyles}>
                <Typography>
                    {givenName[0]}
                </Typography>
            </View>
        )
    )
}

const styles = StyleSheet.create({
    container: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
