import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme } from 'react-native-paper'

import { SearchListSection } from './search-list-section'

import { Close } from '@/icons/close'
import { Search } from '@/icons/search'
import { ICON_SIZE, SPACING } from '@/constants/theme'

const getEntryKey = (entry) => entry.id
const getEntryLabel = (entry) => entry.query

export const SavedSearches = memo(function SavedSearches({ saved, onSelect, onDelete }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const onSelectEntry = useCallback((entry) => onSelect(entry.query), [onSelect])

    const renderTrailing = useCallback((entry) => (
        <Pressable
            accessibilityRole='button'
            accessibilityLabel={t('button.delete')}
            hitSlop={SPACING.md}
            onPress={() => onDelete(entry.id)}
        >
            <Close
                width={ICON_SIZE.lg}
                height={ICON_SIZE.lg}
                color={colors.onBackground}
            />
        </Pressable>
    ), [onDelete, t, colors.onBackground])

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
