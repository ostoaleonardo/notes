import { useTranslation } from 'react-i18next'

import { ListItem } from '@/ui/list-item'
import { useTheme } from '@/ui/hooks/use-theme'

import { useDirectAccess } from '@/hooks/use-direct-access'

import { OpenInNew } from '@/icons/open-in-new'

export const DirectAccessOption = () => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { granted, request } = useDirectAccess()

    return (
        <ListItem
            title={t('settings.permissions.direct_access.title')}
            description={
                t(granted
                    ? 'settings.permissions.direct_access.granted'
                    : 'settings.permissions.direct_access.denied')
            }
            rightContent={<OpenInNew color={colors.onBackground} />}
            onPress={request}
        />
    )
}
