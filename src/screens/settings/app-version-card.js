import { Linking } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { nativeApplicationVersion } from 'expo-application'

import { Option } from './option'

import { OpenInNew } from '@/icons/open-in-new'

import { LINKS } from '@/constants/links'

export function AppVersionCard() {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <Option
            title={t('settings.updates')}
            description={t('settings.version') + ' ' + nativeApplicationVersion}
            rightContent={<OpenInNew color={colors.onBackground} />}
            onPress={() => Linking.openURL(LINKS.GOOGLE_PLAY)}
            isLast={true}
        />
    )
}
