import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Avatar, Button, Typography } from '@/components'
import { useAuth, useUser } from '@/hooks'
import { ROUTES } from '@/constants'

function Option({ title, description }) {
    return (
        <View style={{ gap: 4 }}>
            <Typography
                uppercase
                variant='caption'
            >
                {title}
            </Typography>
            <Typography
                opacity={0.5}
            >
                {description}
            </Typography>
        </View>
    )
}

export default function Profile() {
    const { t } = useTranslation()
    const { user } = useUser()
    const { name, email } = user
    const { signOut } = useAuth()

    return (
        <View style={styles.container}>
            <View style={{ gap: 56 }}>
                <View style={{ alignItems: 'center' }}>
                    <Avatar
                        size={192}
                        user={user}
                    />
                </View>

                <View style={{ gap: 32 }}>
                    <Option
                        title={t('profile.alias')}
                        description={name}
                    />
                    <Option
                        title={t('profile.email')}
                        description={email}
                    />
                </View>
            </View>

            <Button
                variant='secondary'
                label={t('profile.signOut')}
                onPress={() => {
                    signOut()
                    router.replace(ROUTES.SIGN_IN)
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingVertical: 24,
        paddingHorizontal: 24,
        justifyContent: 'space-between'
    }
})
