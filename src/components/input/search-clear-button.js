import { useTranslation } from 'react-i18next'

import { IconButton } from '@/ui/button/icon-button'

import { Close } from '@/icons/close'

import { ICON_BUTTON } from '@/ui/tokens/components'

export const SearchClearButton = ({ onPress }) => {
    const { t } = useTranslation()

    return (
        <IconButton
            icon={Close}
            appearance={ICON_BUTTON.noTooltip}
            label={t('button.clear')}
            onPress={onPress}
        />
    )
}
