import { Linking, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import * as Application from 'expo-application'
import { Option } from './Option'
import { Typography } from '../Text'
import { OpenInNew } from '@/icons'
import { GOOGLE_PLAY_URL } from '@/constants'

export function AppVersionCard() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { nativeApplicationVersion } = Application

    return (
        <Option
            onPress={() => Linking.openURL(GOOGLE_PLAY_URL)}
            rightContent={
                <OpenInNew
                    color={colors.onBackground}
                />
            }
        >
            <View style={{ gap: 4 }}>
                <Typography
                    uppercase
                >
                    {t('settings.updates')}
                </Typography>
                <Typography
                    opacity={0.5}
                    variant='caption'
                >
                    {t('settings.version')} {nativeApplicationVersion}
                </Typography>
            </View>
        </Option>
    )
}
