import { useTranslation } from 'react-i18next'

import { ComposeIconButton } from '@/ui/button/compose-icon-button'

import { Close } from '@/icons/close'

export const SearchClearButton = ({ onPress }) => {
    const { t } = useTranslation()

    return (
        <ComposeIconButton
            variant='text'
            icon={Close}
            label={t('button.clear')}
            onPress={onPress}
        />
    )
}
