import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { IconButton } from 'react-native-paper'

import { SearchListSection } from './search-list-section'

import { Close } from '@/icons/close'
import { Search } from '@/icons/search'
import { SPACING, ICON_SIZE } from '@/constants/theme'

const closeIcon = (props) => <Close {...props} />
const getEntryKey = (entry) => entry.id
const getEntryLabel = (entry) => entry.query

export const SavedSearches = memo(function SavedSearches({ saved, onSelect, onDelete }) {
    const { t } = useTranslation()

    const onSelectEntry = useCallback((entry) => onSelect(entry.query), [onSelect])

    const renderTrailing = useCallback((entry) => (
        <IconButton
            size={ICON_SIZE.md}
            onPress={() => onDelete(entry.id)}
            icon={closeIcon}
            accessibilityLabel={t('button.delete')}
        />
    ), [onDelete, t])

    return (
        <SearchListSection
            title={t('search.saved')}
            items={saved}
            keyExtractor={getEntryKey}
            icon={Search}
            getLabel={getEntryLabel}
            onSelect={onSelectEntry}
            itemStyle={styles.item}
            labelStyle={styles.label}
            renderTrailing={renderTrailing}
        />
    )
})

const styles = StyleSheet.create({
    item: {
        paddingLeft: SPACING.lg
    },
    label: {
        flex: 1
    }
})
