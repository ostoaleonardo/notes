import { Linking } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import * as Application from 'expo-application'
import { Option } from './Option'
import { OpenInNew } from '@/icons'
import { LINKS } from '@/constants'

export function AppVersionCard() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { nativeApplicationVersion } = Application

    return (
        <Option
            title={t('settings.updates')}
            description={t('settings.version') + ' ' + nativeApplicationVersion}
            rightContent={<OpenInNew color={colors.onBackground} />}
            onPress={() => Linking.openURL(LINKS.GOOGLE_PLAY)}
        />
    )
}
