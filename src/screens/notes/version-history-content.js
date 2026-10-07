import { memo, useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react'
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

import { DIFF_ADDED_COLOR, DIFF_REMOVED_COLOR, DIFF_TYPES } from '@/constants/diff'
import { TRANSPARENT } from '@/constants/themes'
import { FONTS, TYPOGRAPHY_SIZE_VARIANTS, SPACING, OPACITY, RADIUS } from '@/constants/theme'
import { FREE_VERSION_HISTORY_LIMIT } from '@/constants/default-values'

const getDiffColor = (type) => (type === DIFF_TYPES.ADDED ? DIFF_ADDED_COLOR : DIFF_REMOVED_COLOR)

const VersionItem = memo(function VersionItem({ version, first, last, onSelect }) {
    const { colors } = useTheme()
    const { currentLanguage } = useLanguage()
    const onPress = useCallback(() => onSelect(version), [onSelect, version])

    return (
        <AnimatedView>
            <TouchableRipple accessibilityRole='button' onPress={onPress}>
                <View
                    style={{
                        ...styles.item,
                        backgroundColor: colors.surface,
                        ...getGroupedRadius(first, last)
                    }}
                >
                    <Typography bold numberOfLines={1}>
                        {version.title}
                    </Typography>
                    <Typography opacity={OPACITY.muted} variant='caption'>
                        {getFormattedDate(version.createdAt, currentLanguage)}
                    </Typography>
                </View>
            </TouchableRipple>
        </AnimatedView>
    )
})

export const VersionHistoryContent = memo(function VersionHistoryContent({
    location,
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

    const loadVersions = useEffectEvent(() => {
        if (!location || !noteId) return

        setLoading(true)
        getVersions(location, noteId, pro ? Infinity : FREE_VERSION_HISTORY_LIMIT).then((result) => {
            setVersions(result)
            setLoading(false)
        })
    })

    useEffect(() => {
        loadVersions()
    }, [location?.folderUri, location?.folderPath, noteId, pro])

    const ordered = useMemo(() => [...versions].reverse(), [versions])
    const diff = useMemo(() => (
        selected ? diffLines(selected.content, currentContentRef.current.content) : []
    ), [selected, currentContentRef])

    const onCloseHistory = useCallback(() => {
        setSelected(null)
        onClose()
    }, [onClose])

    const renderDiffItem = useCallback(({ item: entry }) => {
        const isChanged = entry.type !== DIFF_TYPES.UNCHANGED
        const prefix = entry.type === DIFF_TYPES.ADDED ? '+ ' : entry.type === DIFF_TYPES.REMOVED ? '- ' : '  '
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
        <VersionItem
            version={version}
            first={index === 0}
            last={index === ordered.length - 1}
            onSelect={setSelected}
        />
    ), [ordered.length])

    const onBack = useCallback(() => setSelected(null), [])
    const onOpenRestore = useCallback(() => setRestoreDialogVisible(true), [])
    const onCloseRestore = useCallback(() => setRestoreDialogVisible(false), [])
    const onConfirmRestore = useCallback(() => onRestore(selected), [onRestore, selected])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {selected && (
                        <IconButton
                            onPress={onBack}
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
                            <Typography opacity={OPACITY.muted} variant='caption'>
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
                                    paddingLeft: SPACING.sm,
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
                                onPress={onOpenRestore}
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
                        <Typography opacity={OPACITY.muted}>
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
                onDismiss={onCloseRestore}
                onConfirm={onConfirmRestore}
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
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    list: {
        gap: SPACING.xxxs,
        paddingHorizontal: SPACING.lg
    },
    item: {
        minWidth: '100%',
        padding: SPACING.xl
    },
    diff: {
        flex: 1,
        marginHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        marginBottom: SPACING.lg
    },
    diffLine: {
        paddingVertical: SPACING.xxxs,
        paddingHorizontal: SPACING.xxs
    },
    diffText: {
        fontFamily: FONTS.azeretLight,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.caption
    }
})
