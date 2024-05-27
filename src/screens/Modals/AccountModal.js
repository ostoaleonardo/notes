import { useEffect } from 'react'
import { router } from 'expo-router'
import { useNetInfo } from '@react-native-community/netinfo'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, ModalSheet, Typography, User } from '@/components'
import { useAuth, useGoogleDrive, useUser } from '@/hooks'
import { getFormattedDate } from '@/utils'
import { LogOut, Offline, Sync } from '@/icons'
import { COLORS } from '@/constants'

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
    const { isConnected } = useNetInfo()
    const { isSignedIn, signIn, signOut } = useAuth()
    const { lastSync, isSyncing } = useGoogleDrive()

    const syncDate = getFormattedDate(lastSync)

    useEffect(() => {
        if (!isSignedIn) {
            onClose()
            router.replace('/signin')
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
                            rightContent={
                                isSyncing
                                    ? <ActivityIndicator color={COLORS.text} />
                                    : isConnected
                                        ? <Sync width={20} height={20} color={COLORS.text} />
                                        : <Offline width={20} height={20} color={COLORS.text} />
                            }
                        >
                            <View>
                                <Typography>
                                    {t('welcome.lastSync')}
                                </Typography>
                                {lastSync && (
                                    <Typography
                                        opacity={0.5}
                                        variant='caption'
                                    >
                                        {syncDate}
                                    </Typography>
                                )}
                            </View>
                        </OptionCard>
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
