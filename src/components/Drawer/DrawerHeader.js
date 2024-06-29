import { Link } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { Typography } from '../Text'
import { Avatar } from '../Avatar'
import { ArrowForward } from '@/icons'
import { useUser } from '@/hooks'
import { COLORS } from '@/constants'

export function DrawerHeader() {
    const { user } = useUser()
    const { givenName } = user

    return (
        <Link
            asChild
            href='/profile'
            style={styles.container}
        >
            <Pressable>
                <Avatar
                    user={user}
                    color={COLORS.white10}
                />
                <View style={styles.userContainer}>
                    <Typography
                        uppercase
                        variant='subtitle'
                    >
                        {givenName}
                    </Typography>
                    <ArrowForward color={COLORS.white} />
                </View>
            </Pressable>
        </Link>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
        paddingTop: 16,
        paddingBottom: 24,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.white5
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
