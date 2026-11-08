import { useTranslation } from 'react-i18next'

import { IconButton } from '@/ui/button/icon-button'
import { TonalIconButton } from '@/ui/button/tonal-icon-button'

import { Tune } from '@/icons/tune'

import { ICON_BUTTON } from '@/ui/tokens/components'
import { TEST_IDS } from '@/constants/test-ids'

export const SearchFilterButton = ({ active, onPress }) => {
    const { t } = useTranslation()
    const Button = active ? TonalIconButton : IconButton

    return (
        <Button
            icon={Tune}
            appearance={ICON_BUTTON.noTooltip}
            label={t('search.filter')}
            testID={TEST_IDS.SEARCH_FILTER_BUTTON}
            onPress={onPress}
        />
    )
}
