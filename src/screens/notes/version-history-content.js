import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'

import { VersionDiff } from './version-diff'
import { VersionItem } from './version-item'
import { LoadingOverlay } from '@/ui/layout'
import { EmptyMessage } from '@/ui/modal/empty-message'
import { GroupedList } from '@/ui/grouped-list'

import { useVersionList } from '@/hooks/use-version-list'

import { SPACING } from '@/constants/theme'

const keyExtractor = (version) => version.id

export const VersionHistoryContent = ({
    location,
    noteId,
    currentContentRef,
    selected,
    onSelect
}) => {
    const { t } = useTranslation()
    const { versions, loading } = useVersionList({ location, noteId })

    const renderItem = useCallback(({ item: version }) => (
        <VersionItem
            version={version}
            onSelect={onSelect}
        />
    ), [onSelect])

    if (selected) return (
        <VersionDiff
            version={selected}
            currentContentRef={currentContentRef}
        />
    )

    if (loading) return <LoadingOverlay />

    if (versions.length === 0) {
        return (
            <EmptyMessage style={{ flex: 1 }}>
                {t('message.version_history.empty')}
            </EmptyMessage>
        )
    }

    return (
        <GroupedList
            paged={true}
            data={versions}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
        />
    )
}

const styles = StyleSheet.create({
    list: {
        gap: SPACING.xxxs,
        paddingHorizontal: SPACING.lg
    }
})
