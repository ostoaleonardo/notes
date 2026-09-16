import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { IconButton } from 'react-native-paper'

import { SearchListSection } from './search-list-section'

import { Close } from '@/icons/close'
import { Search } from '@/icons/search'

export function SavedSearches({ saved, onSelect, onDelete }) {
    const { t } = useTranslation()

    return (
        <SearchListSection
            title={t('search.saved')}
            items={saved}
            keyExtractor={(entry) => entry.id}
            icon={Search}
            getLabel={(entry) => entry.query}
            onSelect={(entry) => onSelect(entry.query)}
            itemStyle={styles.item}
            labelStyle={styles.label}
            renderTrailing={(entry) => (
                <IconButton
                    size={16}
                    onPress={() => onDelete(entry.id)}
                    icon={(props) => <Close {...props} />}
                    accessibilityLabel={t('button.delete')}
                />
            )}
        />
    )
}

const styles = StyleSheet.create({
    item: {
        paddingLeft: 16
    },
    label: {
        flex: 1
    }
})
