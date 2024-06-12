import { useState } from 'react'
import { router } from 'expo-router'
import { Image, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, Toast, Typography } from '@/components'
import { Shade, Stripe } from '@/screens'
import { useAuth, useGoogleDrive, useStorage } from '@/hooks'
import { COLORS, DEFAULT_CATEGORIES, ROUTES, STORAGE_KEYS } from '@/constants'

export default function SignIn() {
    const { t } = useTranslation()
    const { signIn } = useAuth()
    const { setItem } = useStorage()
    const { listFiles, getFile } = useGoogleDrive()
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const signInAndSync = async () => {
        try {
            setIsLoading(true)
            const accessToken = await signIn()

            if (accessToken) {
                const categoriesListFile = await listFiles(accessToken, 'name="categories.json"')

                if (categoriesListFile.length) {
                    const categoriesFile = categoriesListFile[0].id
                    const categories = await getFile(accessToken, categoriesFile)

                    await setItem(STORAGE_KEYS.CATEGORIES_FILE_ID, categoriesFile)
                    await setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
                } else {
                    await setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES))
                }

                const notesFiles = await listFiles(accessToken, 'name contains "note"')
                const notes = []
                const notesIdBackup = {}

                for (const { id } of notesFiles) {
                    const content = await getFile(accessToken, id)
                    notesIdBackup[content.id] = id
                    notes.push(content)
                }

                await setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes))
                await setItem(STORAGE_KEYS.NOTES_ID_BACKUP, JSON.stringify(notesIdBackup))

                router.replace(ROUTES.HOME)
            }
        } catch (error) {
            setMessage(t('welcome.signInError'))
            setTimeout(() => setMessage(''), 3000)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.decorations}>
                <Shade color={COLORS.foreground} />
                <Shade color={COLORS.foreground75} />
                <Shade color={COLORS.foreground50} />
                <Shade color={COLORS.foreground25} />
                <Shade color={COLORS.foreground15} />
                <Shade color={COLORS.foreground5} />
            </View>

            <View style={styles.landingContainer}>
                <View style={styles.topContainer}>
                    <Image
                        style={styles.icon}
                        source={require('assets/icon.png')}
                    />
                    <Typography
                        bold
                        variant='title'
                    >
                        NOTES
                    </Typography>
                    <Typography
                        variant='subtitle'
                        textAlign='center'
                    >
                        {t('welcome.tagline')}
                    </Typography>
                </View>
                <View style={styles.bottomContainer}>
                    <Button
                        variant='secondary'
                        isLoading={isLoading}
                        onPress={signInAndSync}
                        label={t('welcome.signIn')}
                    />
                </View>
            </View>

            <View style={styles.stripes}>
                <Stripe color={COLORS.foreground75} />
                <Stripe color={COLORS.foreground50} />
                <Stripe color={COLORS.foreground25} />
            </View>

            {message && (
                <Toast
                    message={message}
                    backgroundColor={COLORS.foreground}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    gradient: {
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    decorations: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        gap: 16,
        alignItems: 'center',
        paddingTop: 48,
        paddingHorizontal: 24,
    },
    landingContainer: {
        flex: 1,
        gap: 48,
        padding: 24,
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    topContainer: {
        width: '100%',
        gap: 16,
        alignItems: 'center',
    },
    bottomContainer: {
        width: '100%',
        gap: 16,
        alignItems: 'center',
    },
    icon: {
        width: 96,
        height: 96,
        borderRadius: 24,
    },
    stripes: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
    }
})
