import { Linking } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Application from 'expo-application'
import { Option } from './option'
import { useIconProps } from '@/hooks'
import { OpenInNew } from '@/icons'
import { LINKS } from '@/constants'

export function AppVersionCard() {
    const { t } = useTranslation()
    const iconProps = useIconProps()
    const { nativeApplicationVersion } = Application

    return (
        <Option
            title={t('settings.updates')}
            description={t('settings.version') + ' ' + nativeApplicationVersion}
            rightContent={<OpenInNew {...iconProps} />}
            onPress={() => Linking.openURL(LINKS.GOOGLE_PLAY)}
            isLast={true}
        />
    )
}
