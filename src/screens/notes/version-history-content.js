import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View } from 'react-native'
import { IconButton, TouchableRipple, useTheme } from 'react-native-paper'
import { FadeIn, FadeInRight, FadeOut, FadeOutRight } from 'react-native-reanimated'

import { AnimatedView } from '@/components/animated/animated-view'
import { Pressable } from '@/components/button/pressable'
import { Typography } from '@/components/typography'
import { ConfirmDialog } from '@/components/confirm-dialog'

import { useLanguage } from '@/hooks/use-language'
import { useNoteVersions } from '@/hooks/use-note-versions'
import { diffLines } from '@/utils/diff-lines'
import { getFormattedDate } from '@/utils/formatted-date'
import { getGroupedRadius } from '@/utils/grouped-card-style'

import { ArrowBack } from '@/icons/arrow-back'
import { Close } from '@/icons/close'

import { DIFF_ADDED_COLOR, DIFF_REMOVED_COLOR } from '@/constants/diff'
import { TRANSPARENT } from '@/constants/themes'
import { FONTS } from '@/constants/fonts'
import { FREE_VERSION_HISTORY_LIMIT } from '@/constants/default-values'

const getDiffColor = (type) => (type === 'added' ? DIFF_ADDED_COLOR : DIFF_REMOVED_COLOR)

export const VersionHistoryContent = memo(function VersionHistoryContent({
    directoryUri,
    noteId,
    currentContentRef,
    pro,
    onRestore,
    onClose
}) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { currentLanguage } = useLanguage()
    const { getVersions } = useNoteVersions()

    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [restoreDialogVisible, setRestoreDialogVisible] = useState(false)

    useEffect(() => {
        if (!directoryUri || !noteId) return

        setLoading(true)
        getVersions(directoryUri, noteId).then((result) => {
            setVersions(result)
            setLoading(false)
        })
    }, [directoryUri, noteId])

    const visibleVersions = useMemo(() => (
        pro ? versions : versions.slice(-FREE_VERSION_HISTORY_LIMIT)
    ), [versions, pro])

    const ordered = useMemo(() => [...visibleVersions].reverse(), [visibleVersions])
    const diff = useMemo(() => (
        selected ? diffLines(selected.content, currentContentRef.current.content) : []
    ), [selected, currentContentRef])

    const onCloseHistory = useCallback(() => {
        setSelected(null)
        onClose()
    }, [onClose])

    const renderDiffItem = useCallback(({ item: entry }) => {
        const isChanged = entry.type !== 'unchanged'
        const prefix = entry.type === 'added' ? '+ ' : entry.type === 'removed' ? '- ' : '  '
        const background = isChanged
            ? getDiffColor(entry.type) + TRANSPARENT[20]
            : 'transparent'

        return (
            <View style={{ ...styles.diffLine, backgroundColor: background }}>
                <Typography
                    color={isChanged ? getDiffColor(entry.type) : colors.onBackground}
                    styleProps={styles.diffText}
                >
                    {prefix + entry.line}
                </Typography>
            </View>
        )
    }, [colors.onBackground])

    const renderVersionItem = useCallback(({ item: version, index }) => (
        <AnimatedView>
            <TouchableRipple onPress={() => setSelected(version)}>
                <View
                    style={{
                        ...styles.item,
                        backgroundColor: colors.surface,
                        ...getGroupedRadius(index === 0, index === ordered.length - 1)
                    }}
                >
                    <Typography bold numberOfLines={1}>
                        {version.title}
                    </Typography>
                    <Typography opacity={0.5} variant='caption'>
                        {getFormattedDate(version.createdAt, currentLanguage)}
                    </Typography>
                </View>
            </TouchableRipple>
        </AnimatedView>
    ), [colors.surface, ordered.length, currentLanguage])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {selected && (
                        <IconButton
                            onPress={() => setSelected(null)}
                            icon={(props) => <ArrowBack {...props} />}
                            accessibilityLabel={t('button.back')}
                        />
                    )}

                    {selected ? (
                        <AnimatedView
                            key='date'
                            entering={FadeIn}
                            exiting={FadeOut}
                        >
                            <Typography opacity={0.5} variant='caption'>
                                {getFormattedDate(selected.createdAt, currentLanguage)}
                            </Typography>
                        </AnimatedView>
                    ) : (
                        <AnimatedView
                            key='title'
                            entering={FadeIn}
                            exiting={FadeOut}
                        >
                            <Typography
                                variant='title'
                                styleProps={{
                                    paddingLeft: 8,
                                    fontFamily: FONTS.nType82Headline
                                }}
                            >
                                {t('title.version_history')}
                            </Typography>
                        </AnimatedView>
                    )}
                </View>

                <View style={styles.headerRight}>
                    {selected && (
                        <AnimatedView
                            entering={FadeInRight}
                            exiting={FadeOutRight}
                        >
                            <Pressable
                                compact={true}
                                mode='contained'
                                onPress={() => setRestoreDialogVisible(true)}
                            >
                                {t('button.restore')}
                            </Pressable>
                        </AnimatedView>
                    )}

                    <IconButton
                        onPress={onCloseHistory}
                        icon={(props) => <Close {...props} />}
                        accessibilityLabel={t('button.close')}
                    />
                </View>
            </View>

            {selected ? (
                <FlatList
                    data={diff}
                    keyExtractor={(_, index) => String(index)}
                    showsVerticalScrollIndicator={false}
                    style={styles.diff}
                    renderItem={renderDiffItem}
                />
            ) : (
                <>
                    {!loading && ordered.length === 0 && (
                        <Typography opacity={0.5}>
                            {t('message.version_history.empty')}
                        </Typography>
                    )}

                    {!loading && ordered.length > 0 && (
                        <FlatList
                            data={ordered}
                            keyExtractor={(version) => version.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.list}
                            renderItem={renderVersionItem}
                        />
                    )}
                </>
            )}

            <ConfirmDialog
                visible={restoreDialogVisible}
                title={t('message.version_history.restore_title')}
                message={t('message.version_history.restore_message')}
                confirmLabel={t('button.restore')}
                onDismiss={() => setRestoreDialogVisible(false)}
                onConfirm={() => onRestore(selected)}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    list: {
        gap: 2,
        paddingHorizontal: 16
    },
    item: {
        minWidth: '100%',
        padding: 20
    },
    diff: {
        flex: 1,
        marginHorizontal: 16,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16
    },
    diffLine: {
        paddingVertical: 1,
        paddingHorizontal: 4
    },
    diffText: {
        fontFamily: FONTS.azeretLight,
        fontSize: 12
    }
})
