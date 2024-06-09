import { useEffect } from 'react'
import { router } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, ModalSheet, Typography, User } from '@/components'
import { useAuth, useUser } from '@/hooks'
import { LogOut } from '@/icons'
import { COLORS, ROUTES } from '@/constants'

function OptionCard({ rightLabel, rightContent, onPress, children }) {
    const styles = StyleSheet.create({
        container: {
            width: '100%',
            borderRadius: 16,
            paddingVertical: 24,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.text5,
            justifyContent: 'space-between',
        },
    })

    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
        >
            {children}
            {rightContent || (
                <Typography>
                    {rightLabel}
                </Typography>
            )}
        </Pressable>
    )
}

export function AccountModal({ isVisible, onClose }) {
    const { t } = useTranslation()
    const { user } = useUser()
    const { isSignedIn, signIn, signOut } = useAuth()

    useEffect(() => {
        if (!isSignedIn) {
            onClose()
            router.replace(ROUTES.SIGN_IN)
        }
    }, [isSignedIn])

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t('title.backupSync')}
        >
            <View style={styles.container}>
                {user.givenName ? (
                    <User
                        name={user.givenName}
                        description={user.email}
                    />
                ) : (
                    <View style={styles.welcomeContainer}>
                        <Typography variant='title'>
                            Notes
                        </Typography>
                        <Typography
                            opacity={0.5}
                            textAlign='center'
                        >
                            {t('welcome.tagline')}
                        </Typography>
                    </View>
                )}

                {user.givenName ? (
                    <View style={styles.optionsContainer}>
                        <OptionCard
                            onPress={signOut}
                            rightContent={
                                <LogOut
                                    width={20}
                                    height={20}
                                    color={COLORS.text}
                                />
                            }
                        >
                            <Typography>
                                {t('welcome.signOut')}
                            </Typography>
                        </OptionCard>
                    </View>
                ) : (
                    <Button
                        onPress={signIn}
                        label={t('welcome.signIn')}
                    />
                )}
            </View>
        </ModalSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 40,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userContainer: {
        gap: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoContainer: {
        gap: 4,
    },
    optionsContainer: {
        width: '100%',
        gap: 8,
    },
    welcomeContainer: {
        gap: 8,
        alignItems: 'center',
    },
})
