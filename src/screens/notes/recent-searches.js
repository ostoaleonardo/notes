import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'

import { SearchListSection } from './search-list-section'

import { History } from '@/icons/history'

export function RecentSearches({ recent, onSelect }) {
    const { t } = useTranslation()

    return (
        <SearchListSection
            title={t('search.recent')}
            items={recent}
            keyExtractor={(term) => term}
            icon={History}
            getLabel={(term) => term}
            onSelect={onSelect}
            itemStyle={styles.item}
        />
    )
}

const styles = StyleSheet.create({
    item: {
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16
    }
})
