import { useTranslation } from 'react-i18next'

import { SearchListSection } from './search-list-section'

import { History } from '@/icons/history'

const getTerm = (term) => term

export function RecentSearches({ recent, onSelect }) {
    const { t } = useTranslation()

    return (
        <SearchListSection
            title={t('search.recent')}
            items={recent}
            keyExtractor={getTerm}
            icon={History}
            getLabel={getTerm}
            onSelect={onSelect}
        />
    )
}
