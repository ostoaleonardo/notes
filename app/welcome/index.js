import { Image, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, Toast, Typography } from '@/components'
import { COLORS, ROUTES } from '@/constants'
import { useAuth } from '@/hooks'
import { router } from 'expo-router'

export default function Welcome() {
    const { t } = useTranslation()
    const { signIn } = useAuth()

    return (
        <View style={styles.container}>
            <View style={styles.landingContainer}>
                <View style={styles.contentContainer}>
                    <Image
                        style={styles.icon}
                        source={require('assets/adaptive-icon.png')}
                    />
                    <Typography variant='title'>
                        NOTES
                    </Typography>
                    <Typography
                        opacity={0.5}
                        variant='subtitle'
                    >
                        {t('welcome.tagline')}
                    </Typography>
                </View>

                <View style={styles.bottomContainer}>
                    <Button
                        onPress={signIn}
                        variant='secondary'
                        label={t('welcome.getStarted')}
                    />
                    <Button
                        variant='outline'
                        label={t('welcome.later')}
                        onPress={() => router.navigate(ROUTES.HOME)}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    landingContainer: {
        flex: 1,
        gap: 48,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center',
    },
    bottomContainer: {
        width: '100%',
        gap: 16,
        alignItems: 'center',
    },
    icon: {
        width: 250,
        height: 250,
    },
})
