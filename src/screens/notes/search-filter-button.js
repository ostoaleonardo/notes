import { useTranslation } from 'react-i18next'

import { ComposeIconButton } from '@/ui/button/compose-icon-button'

import { Tune } from '@/icons/tune'

import { TEST_IDS } from '@/constants/test-ids'

export const SearchFilterButton = ({ active, onPress }) => {
    const { t } = useTranslation()

    return (
        <ComposeIconButton
            variant={active ? 'tonal' : 'text'}
            icon={Tune}
            label={t('search.filter')}
            testID={TEST_IDS.SEARCH_FILTER_BUTTON}
            onPress={onPress}
        />
    )
}
