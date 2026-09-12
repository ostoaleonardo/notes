import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { FilterToggle } from '@/components/button/filter-toggle'

import { toggleImageQualifier, togglePinnedQualifier } from '@/utils/search-query'

import { Check } from '@/icons/check'
import { Keep } from '@/icons/keep'
import { KeepFilled } from '@/icons/keep-filled'
import { Picture } from '@/icons/picture'
import { Plus } from '@/icons/plus'

export function SearchFilterToggles({ query, setQuery, parsed, isSaved, canSave, onToggleSave }) {
    const { t } = useTranslation()

    return (
        <View style={styles.group}>
            <FilterToggle
                position='first'
                icon={Picture}
                label={t('search.has_image')}
                selected={parsed.hasImage}
                onPress={() => setQuery(toggleImageQualifier(query))}
            />

            <FilterToggle
                position='middle'
                icon={parsed.pinned ? KeepFilled : Keep}
                label={t('search.pinned')}
                selected={parsed.pinned}
                onPress={() => setQuery(togglePinnedQualifier(query))}
            />

            <FilterToggle
                position='last'
                icon={isSaved ? Check : Plus}
                label={t(isSaved ? 'search.unsave' : 'search.save')}
                selected={isSaved}
                disabled={!canSave}
                onPress={onToggleSave}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: 2,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'center'
    }
})
