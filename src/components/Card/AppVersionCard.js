import { useEffect, useState } from 'react'
import { Linking, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Application from 'expo-application'
import { SettingCard } from './SettingCard'
import { Typography } from '../Text'
import { getGooglePlayVersion } from '@/utils'
import { GOOGLE_PLAY_URL } from '@/constants'

export function AppVersionCard() {
    const { t } = useTranslation()
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const { nativeApplicationVersion } = Application

    useEffect(() => {
        (async () => {
            const { updateAvailable } = await getGooglePlayVersion(
                GOOGLE_PLAY_URL,
                nativeApplicationVersion
            )

            setUpdateAvailable(updateAvailable)
        })()
    }, [])

    return (
        <SettingCard
            rightLabel={nativeApplicationVersion}
            onPress={() => Linking.openURL(GOOGLE_PLAY_URL)}
        >
            <View>
                <Typography>
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
        </SettingCard>
    )
}
