import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'
import { AnimatedView, IconActionButton, Pressable, Typography } from '@/components'
import { useLanguage, useNoteVersions } from '@/hooks'
import { ArrowBack } from '@/icons'
import {
    DIFF_ADDED_COLOR,
    DIFF_REMOVED_COLOR,
    FONTS,
    FREE_VERSION_HISTORY_LIMIT,
    TRANSPARENT
} from '@/constants'
import { diffLines, getFormattedDate } from '@/utils'

const getDiffColor = (type) => (type === 'added' ? DIFF_ADDED_COLOR : DIFF_REMOVED_COLOR)

export function VersionHistoryContent({
    directoryUri,
    noteId,
    currentContent,
    premium,
    onRestore
}) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { currentLanguage } = useLanguage()
    const { getVersions } = useNoteVersions()

    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        if (!directoryUri || !noteId) return

        setLoading(true)
        getVersions(directoryUri, noteId).then((result) => {
            setVersions(result)
            setLoading(false)
        })
    }, [directoryUri, noteId])

    if (loading) return null

    const visibleVersions = premium ? versions : versions.slice(-FREE_VERSION_HISTORY_LIMIT)
    const ordered = [...visibleVersions].reverse()

    if (selected) {
        const diff = diffLines(selected.content, currentContent)

        return (
            <View style={styles.diffContainer}>
                <View style={styles.diffHeader}>
                    <IconActionButton
                        icon={ArrowBack}
                        onPress={() => setSelected(null)}
                        accessibilityLabel={t('button.back')}
                    />
                    <Typography opacity={0.6} variant='caption'>
                        {getFormattedDate(selected.createdAt, currentLanguage)}
                    </Typography>
                </View>

                <FlatList
                    data={diff}
                    keyExtractor={(_, index) => String(index)}
                    showsVerticalScrollIndicator={false}
                    style={styles.diff}
                    renderItem={({ item: entry }) => {
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
                    }}
                />

                <Pressable onPress={() => onRestore(selected)}>
                    {t('button.restore')}
                </Pressable>
            </View>
        )
    }

    if (ordered.length === 0) {
        return (
            <Typography opacity={0.5}>
                {t('message.version_history.empty')}
            </Typography>
        )
    }

    return (
        <FlatList
            data={ordered}
            keyExtractor={(version) => version.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: version }) => (
                <AnimatedView>
                    <TouchableRipple onPress={() => setSelected(version)}>
                        <View style={styles.item}>
                            <Typography bold numberOfLines={1}>
                                {version.title}
                            </Typography>
                            <Typography opacity={0.5} variant='caption'>
                                {getFormattedDate(version.createdAt, currentLanguage)}
                            </Typography>
                        </View>
                    </TouchableRipple>
                </AnimatedView>
            )}
        />
    )
}

const styles = StyleSheet.create({
    item: {
        paddingVertical: 10
    },
    diffContainer: {
        flex: 1
    },
    diffHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    diff: {
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16
    },
    diffLine: {
        paddingVertical: 2,
        paddingHorizontal: 8
    },
    diffText: {
        fontFamily: FONTS.azeretLight,
        fontSize: 12
    }
})
