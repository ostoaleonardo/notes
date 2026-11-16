import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { SearchListSection } from './search-list-section'
import { SearchRemoveAction } from './search-remove-action'

import { Search } from '@/icons/search'

const getEntryKey = (entry) => entry.id
const getEntryLabel = (entry) => entry.query

export const SavedSearches = memo(({
    saved,
    onSelect,
    onDelete
}) => {
    const { t } = useTranslation()

    const onSelectEntry = useCallback((entry) => onSelect(entry.query), [onSelect])

    const renderTrailing = useCallback((entry) => (
        <SearchRemoveAction onPress={() => onDelete(entry.id)} />
    ), [onDelete])

    return (
        <SearchListSection
            title={t('search.saved')}
            items={saved}
            keyExtractor={getEntryKey}
            icon={Search}
            getLabel={getEntryLabel}
            onSelect={onSelectEntry}
            renderTrailing={renderTrailing}
        />
    )
})
