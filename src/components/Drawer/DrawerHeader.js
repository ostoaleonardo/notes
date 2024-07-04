import { Link } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { Typography } from '../Text'
import { Avatar } from '../Avatar'
import { ArrowForward } from '@/icons'
import { useUser } from '@/hooks'
import { COLORS, ROUTES } from '@/constants'

export function DrawerHeader() {
    const { user } = useUser()
    const { name } = user

    return (
        <Link
            asChild
            href={ROUTES.PROFILE}
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
                        numberOfLines={1}
                        variant='subtitle'
                    >
                        {name}
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
