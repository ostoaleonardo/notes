import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Application from 'expo-application'
import { Linking, Pressable, StyleSheet, View } from 'react-native'
import { Languages, ModalSheet, Typography } from '@/components'
import { getGooglePlayVersion } from '@/utils'
import { PLAY_STORE_URL, colors } from '@/constants'

const SETTINGS_OPTIONS = [
    {
        title: 'settings.language',
        children: <Languages />
    },
    // {
    //     title: 'settings.theme',
    //     children: <Themes />
    // }
]

export default function Settings() {
    const { t } = useTranslation()
    const [selected, setSelected] = useState(SETTINGS_OPTIONS[0])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const { nativeApplicationVersion } = Application

    useEffect(() => {
        const fetchGooglePlayData = async () => {
            const { updateAvailable } = await getGooglePlayVersion(
                PLAY_STORE_URL,
                nativeApplicationVersion
            )

            setUpdateAvailable(updateAvailable)
        }

        fetchGooglePlayData()
    }, [])

    const handleModal = (option) => {
        setIsModalVisible(!isModalVisible)
        setSelected(option)
    }

    return (
        <View style={styles.container}>
            <View style={styles.sectionContainer}>
                <Typography
                    opacity={0.5}
                    variant='subtitle'
                >
                    {t('settings.language')}
                </Typography>
                <Pressable
                    style={styles.cardContainer}
                    onPress={() => handleModal(SETTINGS_OPTIONS[0])}
                >
                    <Typography variant='paragraph'>
                        {t('language')}
                    </Typography>
                    <Typography variant='paragraph'>
                        {'>'}
                    </Typography>
                </Pressable>
            </View>
            <View style={styles.sectionContainer}>
                <Typography
                    opacity={0.5}
                    variant='subtitle'
                >
                    {t('settings.about')}
                </Typography>
                <Pressable
                    onPress={() => Linking.openURL(PLAY_STORE_URL)}
                    style={styles.cardContainer}
                >
                    <View>
                        <Typography variant='paragraph'>
                            {t('settings.checkUpdates')}
                        </Typography>
                        <Typography
                            opacity={0.5}
                            variant='caption'
                        >
                            {updateAvailable
                                ? t('settings.newVersion')
                                : t('settings.yourVersion')
                            }
                        </Typography>
                    </View>
                    <Typography variant='paragraph'>
                        {nativeApplicationVersion}
                    </Typography>
                </Pressable>
            </View>

            <ModalSheet
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(!isModalVisible)}
                title={t(selected.title)}
            >
                {selected.children}
            </ModalSheet>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8,
        padding: 24,
        backgroundColor: colors.background,
    },
    sectionContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 24,
    },
    cardContainer: {
        borderRadius: 16,
        paddingVertical: 32,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.foreground,
    },
})
