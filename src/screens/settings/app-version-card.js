import { Linking } from 'react-native'
import { useTranslation } from 'react-i18next'
import { nativeApplicationVersion } from 'expo-application'

import { useTheme } from '@/ui/hooks/use-theme'

import { ListItem } from '../../ui/list-item'

import { OpenInNew } from '@/icons/open-in-new'

import { LINKS } from '@/constants/links'

export const AppVersionCard = () => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <ListItem
            title={t('settings.about.updates')}
            description={t('settings.about.version') + ' ' + nativeApplicationVersion}
            rightContent={<OpenInNew color={colors.onBackground} />}
            onPress={() => Linking.openURL(LINKS.GOOGLE_PLAY)}
        />
    )
}
