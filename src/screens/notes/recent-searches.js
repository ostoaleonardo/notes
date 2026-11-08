import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { SearchListSection } from './search-list-section'
import { SearchRemoveAction } from './search-remove-action'

import { History } from '@/icons/history'

const getTerm = (term) => term

export const RecentSearches = ({ recent, onSelect, onDelete }) => {
    const { t } = useTranslation()

    const renderTrailing = useCallback((term) => (
        <SearchRemoveAction onPress={() => onDelete(term)} />
    ), [onDelete])

    return (
        <SearchListSection
            title={t('search.recent')}
            items={recent}
            keyExtractor={getTerm}
            icon={History}
            getLabel={getTerm}
            onSelect={onSelect}
            renderTrailing={renderTrailing}
        />
    )
}
