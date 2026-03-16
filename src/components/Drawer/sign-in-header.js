import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Typography } from '../typography'
import { Avatar } from '../avatar'
import { useAuth } from '@/hooks/use-auth'
import { FONTS, ROUTES } from '@/constants'

export function SignInHeader() {
    const { user, isSignedIn } = useAuth()

    return (
        <Pressable
            style={styles.container}
            onPress={() => router.push(ROUTES.SETTINGS)}
        >
            {!isSignedIn ? (
                <View>
                    <Typography
                        numberOfLines={1}
                        variant='title'
                        styleProps={{
                            fontFamily: FONTS.nType82Headline
                        }}
                    >
                        Notes (Offline)
                    </Typography>
                    <Typography
                        variant='caption'
                        opacity={0.5}
                    >
                        Sign In With Google
                    </Typography>
                </View>
            ) : (
                <View style={{ gap: 16 }}>
                    <Avatar user={user} size={56} />
                    <View>
                        <Typography
                            numberOfLines={1}
                            variant='title'
                            styleProps={{
                                fontFamily: FONTS.nType82Headline
                            }}
                        >
                            {user?.name}
                        </Typography>
                        <Typography
                            numberOfLines={1}
                            variant='caption'
                            opacity={0.5}
                        >
                            {user?.email}
                        </Typography>
                    </View>
                </View>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
        paddingBottom: 16,
        paddingHorizontal: 16
    }
})
