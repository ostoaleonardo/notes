import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, Check, ModalSheet, Typography, User } from '@/components'
import { useAuth } from '@/hooks'
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
    const { user, signIn, signOut } = useAuth()
    const [isEnabled, setIsEnabled] = useState(false)

    const toggleSwitch = () => setIsEnabled(!isEnabled)

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title='Account'
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
                            Welcome to Notes
                        </Typography>
                        <Typography
                            opacity={0.5}
                            variant='caption'
                        >
                            Sign in to sync your notes across devices
                        </Typography>
                    </View>
                )}

                {user.givenName ? (
                    <View style={styles.optionsContainer}>
                        <OptionCard
                            rightLabel='>'
                        >
                            <View>
                                <Typography>
                                    Sync now
                                </Typography>
                                <Typography
                                    opacity={0.5}
                                    variant='caption'
                                >
                                    Last synced 2 days ago
                                </Typography>
                            </View>
                        </OptionCard>
                        <OptionCard
                            onPress={toggleSwitch}
                            rightContent={
                                <Pressable onPress={toggleSwitch}>
                                    <Check checked={isEnabled} />
                                </Pressable>
                            }
                        >
                            <Typography>
                                Enable auto sync
                            </Typography>
                        </OptionCard>
                        <OptionCard
                            rightLabel='>'
                            onPress={signOut}
                        >
                            <Typography>
                                {t('Sign Out')}
                            </Typography>
                        </OptionCard>
                    </View>
                ) : (
                    <Button
                        onPress={signIn}
                        label='Sign in with Google'
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
