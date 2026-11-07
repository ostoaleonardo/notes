import { useCallback, useEffect, useMemo, useState } from 'react'
import { router, Stack, usePreventRemove } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { FilledButton } from '@/ui/button/filled-button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { VersionHistoryContent } from '@/screens/notes/version-history-content'

import { useLanguage } from '@/hooks/use-language'
import { getFormattedDate } from '@/utils/formatted-date'
import { clearVersionHistorySession, getVersionHistorySession } from '@/utils/version-history-session'

import { SPACING } from '@/constants/theme'

export default function VersionHistoryScreen() {
    const { t } = useTranslation()
    const { currentLanguage } = useLanguage()

    const [selected, setSelected] = useState(null)
    const [restoreVisible, setRestoreVisible] = useState(false)
    const [session] = useState(getVersionHistorySession)

    useEffect(() => {
        if (!session) router.back()

        return clearVersionHistorySession
    }, [session])

    const onBackToList = useCallback(() => setSelected(null), [])
    usePreventRemove(!!selected, onBackToList)

    const onOpenRestore = useCallback(() => setRestoreVisible(true), [])
    const onCloseRestore = useCallback(() => setRestoreVisible(false), [])

    const onConfirmRestore = useCallback(() => {
        setRestoreVisible(false)
        session.onRestore(selected)
        setSelected(null)
        setTimeout(() => router.back())
    }, [session, selected])

    const options = useMemo(() => ({
        title: selected
            ? getFormattedDate(selected.createdAt, currentLanguage)
            : t('title.version_history'),
        headerRight: selected
            ? () => (
                <FilledButton
                    onPress={onOpenRestore}
                    style={styles.restore}
                >
                    {t('button.restore')}
                </FilledButton>
            ) : undefined
    }), [selected, currentLanguage, t, onOpenRestore])

    if (!session) return null

    return (
        <View style={styles.screen}>
            <Stack.Screen options={options} />

            <VersionHistoryContent
                selected={selected}
                onSelect={setSelected}
                noteId={session.noteId}
                location={session.location}
                currentContentRef={session.contentRef}
            />

            <ConfirmDialog
                visible={restoreVisible}
                title={t('message.version_history.restore.title')}
                message={t('message.version_history.restore.message')}
                confirmLabel={t('button.restore')}
                onDismiss={onCloseRestore}
                onConfirm={onConfirmRestore}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    restore: {
        marginRight: SPACING.sm
    }
})
